'use server'

import { createClient } from '@/lib/supabase/server'

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

export async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: totalContacts },
    { count: totalCompanies },
    { data: contacts },
    { data: recentActivities },
  ] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('status'),
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

  const statusCounts =
    contacts?.reduce(
      (acc, { status }) => {
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    ) || {}

  return {
    totalContacts: totalContacts || 0,
    totalCompanies: totalCompanies || 0,
    toContact: statusCounts.a_contacter || 0,
    contacted: statusCounts.contacte || 0,
    rdvPlanned: statusCounts.rdv_planifie || 0,
    quotesSent: statusCounts.devis_envoye || 0,
    won: statusCounts.gagne || 0,
    lost: statusCounts.perdu || 0,
    recentActivities:
      (recentActivities as unknown as RecentActivityItem[]) || [],
  }
}
