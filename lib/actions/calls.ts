'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Company, ContactStatus, ContactPriority } from '@/lib/types'

export type CallContact = {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  email: string | null
  position: string | null
  status: ContactStatus
  priority: ContactPriority
  deal_amount: number | null
  next_followup_at: string | null
  notes: string | null
  source: string | null
  company: Company | null
  assigned_user: { id: string; full_name: string } | null
}

export async function getCallsData(): Promise<CallContact[]> {
  const supabase = await createClient()

  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  // Contacts with overdue followups
  const { data: overdue } = await supabase
    .from('contacts')
    .select(
      `id, first_name, last_name, phone, email, position, status, priority,
       deal_amount, next_followup_at, notes, source,
       company:companies!contacts_company_id_fkey(*),
       assigned_user:profiles!contacts_assigned_to_fkey(id, full_name)`
    )
    .not('status', 'in', '(gagne,perdu)')
    .not('next_followup_at', 'is', null)
    .lte('next_followup_at', todayEnd.toISOString())
    .order('next_followup_at', { ascending: true })
    .limit(30)

  // Contacts "a_contacter" or "contacte" (with or without followup date)
  const { data: toContact } = await supabase
    .from('contacts')
    .select(
      `id, first_name, last_name, phone, email, position, status, priority,
       deal_amount, next_followup_at, notes, source,
       company:companies!contacts_company_id_fkey(*),
       assigned_user:profiles!contacts_assigned_to_fkey(id, full_name)`
    )
    .in('status', ['a_contacter', 'contacte'])
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)

  const overdueList = (overdue as unknown as CallContact[]) || []
  const toContactList = (toContact as unknown as CallContact[]) || []

  // Deduplicate (a contact might appear in both)
  const seen = new Set(overdueList.map((c) => c.id))
  const unique = [
    ...overdueList,
    ...toContactList.filter((c) => !seen.has(c.id)),
  ]

  return unique
}

export async function logCall(
  contactId: string,
  subject: string,
  nextFollowup?: string | null
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Log the call activity
  const { error: activityError } = await supabase.from('activities').insert({
    contact_id: contactId,
    type: 'appel',
    subject,
    user_id: user?.id,
    completed_at: new Date().toISOString(),
  } as never)

  if (activityError) throw activityError

  // Update followup if provided, or clear it
  if (nextFollowup !== undefined) {
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        next_followup_at: nextFollowup,
        status: 'contacte',
      } as never)
      .eq('id', contactId)

    if (updateError) throw updateError
  }

  revalidatePath('/appels')
  revalidatePath('/tableau-de-bord')
  revalidatePath(`/contacts/${contactId}`)
}

export async function rescheduleCall(contactId: string, newDate: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('contacts')
    .update({ next_followup_at: newDate } as never)
    .eq('id', contactId)

  if (error) throw error
  revalidatePath('/appels')
  revalidatePath('/tableau-de-bord')
  revalidatePath(`/contacts/${contactId}`)
}
