'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CalendarActivity } from '@/lib/types'

type RecentActivityItem = {
  id: string
  type: 'appel' | 'email' | 'rdv' | 'note'
  subject: string
  created_at: string
  user: { id: string; full_name: string } | null
  contact: {
    id: string
    first_name: string | null
    last_name: string | null
  } | null
}

type FollowupContact = {
  id: string
  first_name: string | null
  last_name: string | null
  next_followup_at: string
  status: string
  deal_amount: number | null
  company: { id: string; name: string } | null
  assigned_user: { id: string; full_name: string } | null
}

type StaleDeal = {
  id: string
  first_name: string | null
  last_name: string | null
  status: string
  deal_amount: number | null
  updated_at: string
  company: { id: string; name: string } | null
}

export async function getMorningCockpitData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

  // Stale threshold: 7 days
  const staleDate = new Date(now)
  staleDate.setDate(staleDate.getDate() - 7)

  const [
    { count: totalContacts },
    { count: totalCompanies },
    { count: companiesWithoutSite },
    { data: contacts },
    { data: todayActivities },
    { data: followups },
    { data: staleDeals },
    { data: recentActivities },
  ] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }).or('website_status.eq.pas_de_site,website_status.is.null'),
    supabase.from('contacts').select('status, deal_amount'),
    supabase
      .from('activities')
      .select(
        `
        id, contact_id, type, subject, description, scheduled_at, completed_at,
        duration_minutes, location, attendees, meeting_notes, created_at,
        contact:contacts!activities_contact_id_fkey(
          id, first_name, last_name, deal_amount,
          company:companies!contacts_company_id_fkey(id, name)
        ),
        user:profiles!activities_user_id_fkey(id, full_name)
      `
      )
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', todayStart)
      .lt('scheduled_at', todayEnd)
      .order('scheduled_at', { ascending: true }),
    supabase
      .from('contacts')
      .select(
        `
        id, first_name, last_name, next_followup_at, status, deal_amount,
        company:companies!contacts_company_id_fkey(id, name),
        assigned_user:profiles!contacts_assigned_to_fkey(id, full_name)
      `
      )
      .not('next_followup_at', 'is', null)
      .lte('next_followup_at', todayEnd)
      .not('status', 'in', '(gagne,perdu)')
      .order('next_followup_at', { ascending: true })
      .limit(20),
    supabase
      .from('contacts')
      .select(
        `
        id, first_name, last_name, status, deal_amount, updated_at,
        company:companies!contacts_company_id_fkey(id, name)
      `
      )
      .lt('updated_at', staleDate.toISOString())
      .not('status', 'in', '(gagne,perdu)')
      .order('updated_at', { ascending: true })
      .limit(10),
    supabase
      .from('activities')
      .select(
        `
        *,
        user:profiles!activities_user_id_fkey(id, full_name),
        contact:contacts!activities_contact_id_fkey(id, first_name, last_name)
      `
      )
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const contactsData =
    (contacts as unknown as { status: string; deal_amount: number | null }[]) || []

  const statusCounts = contactsData.reduce(
    (acc, { status }) => {
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const pipelineValue = contactsData
    .filter(
      (c) =>
        c.deal_amount && c.status !== 'perdu' && c.status !== 'gagne'
    )
    .reduce((sum, c) => sum + (c.deal_amount || 0), 0)

  const wonValue = contactsData
    .filter((c) => c.status === 'gagne' && c.deal_amount)
    .reduce((sum, c) => sum + (c.deal_amount || 0), 0)

  return {
    userName: user?.user_metadata?.full_name || 'Commercial',
    totalContacts: totalContacts || 0,
    totalCompanies: totalCompanies || 0,
    companiesWithoutSite: companiesWithoutSite || 0,
    pipelineValue,
    wonValue,
    statusCounts,
    todayActivities: (todayActivities as unknown as CalendarActivity[]) || [],
    followups: (followups as unknown as FollowupContact[]) || [],
    staleDeals: (staleDeals as unknown as StaleDeal[]) || [],
    recentActivities:
      (recentActivities as unknown as RecentActivityItem[]) || [],
  }
}

// Keep backward compatibility
export async function getDashboardStats() {
  const data = await getMorningCockpitData()
  return {
    totalContacts: data.totalContacts,
    totalCompanies: data.totalCompanies,
    toContact: data.statusCounts.a_contacter || 0,
    contacted: data.statusCounts.contacte || 0,
    rdvPlanned: data.statusCounts.rdv_planifie || 0,
    quotesSent: data.statusCounts.devis_envoye || 0,
    won: data.statusCounts.gagne || 0,
    lost: data.statusCounts.perdu || 0,
    pipelineValue: data.pipelineValue,
    wonValue: data.wonValue,
    companiesWithoutSite: data.companiesWithoutSite,
    followups: data.followups,
    recentActivities: data.recentActivities,
  }
}

export async function rescheduleFollowup(
  contactId: string,
  newDate: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('contacts')
    .update({ next_followup_at: newDate } as never)
    .eq('id', contactId)

  if (error) throw error
  revalidatePath('/tableau-de-bord')
  revalidatePath(`/contacts/${contactId}`)
}

export async function logQuickActivity(
  contactId: string,
  type: 'appel' | 'email' | 'rdv' | 'note',
  subject: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('activities').insert({
    contact_id: contactId,
    type,
    subject,
    user_id: user?.id,
    completed_at: new Date().toISOString(),
  } as never)

  if (error) throw error
  revalidatePath('/tableau-de-bord')
  revalidatePath(`/contacts/${contactId}`)
  revalidatePath('/calendrier')
}
