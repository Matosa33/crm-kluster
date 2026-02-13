'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Contact, Company, Profile, ContactStatus, ContactForKanban } from '@/lib/types'

type ContactWithRelations = Contact & {
  company: Pick<Company, 'id' | 'name' | 'city' | 'business_type'> | null
  assigned_user: Pick<Profile, 'id' | 'full_name'> | null
}

type ContactDetail = Contact & {
  company: Company | null
  assigned_user: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export async function getContacts(filters?: {
  status?: ContactStatus
  assignedTo?: string
  search?: string
}): Promise<ContactWithRelations[]> {
  const supabase = await createClient()

  let query = supabase
    .from('contacts')
    .select(
      `
      *,
      company:companies!contacts_company_id_fkey(id, name, city, business_type),
      assigned_user:profiles!contacts_assigned_to_fkey(id, full_name)
    `
    )
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo)
  }
  if (filters?.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query

  if (error) throw error
  return (data as unknown as ContactWithRelations[]) || []
}

export async function getContact(id: string): Promise<ContactDetail> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contacts')
    .select(
      `
      *,
      company:companies!contacts_company_id_fkey(*),
      assigned_user:profiles!contacts_assigned_to_fkey(id, full_name, avatar_url)
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as ContactDetail
}

export async function createContact(data: {
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  position?: string | null
  notes?: string | null
  company_id?: string | null
  assigned_to?: string | null
  status?: ContactStatus
  priority?: 'basse' | 'moyenne' | 'haute'
  deal_amount?: number | null
  next_followup_at?: string | null
  lost_reason?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('contacts').insert({
    ...data,
    created_by: user?.id,
  } as never)

  if (error) throw error
  revalidatePath('/contacts')
}

export async function updateContact(
  id: string,
  data: {
    first_name?: string | null
    last_name?: string | null
    email?: string | null
    phone?: string | null
    position?: string | null
    notes?: string | null
    company_id?: string | null
    assigned_to?: string | null
    status?: ContactStatus
    priority?: 'basse' | 'moyenne' | 'haute'
    deal_amount?: number | null
    next_followup_at?: string | null
    lost_reason?: string | null
  }
) {
  const supabase = await createClient()

  const { error } = await supabase.from('contacts').update(data as never).eq('id', id)

  if (error) throw error
  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
}

export async function updateContactStatus(
  id: string,
  newStatus: ContactStatus,
  note?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get old status
  const { data: contact } = await supabase
    .from('contacts')
    .select('status')
    .eq('id', id)
    .single()

  const oldStatus = (contact as unknown as { status: string } | null)?.status

  // Update contact status
  const { error: updateError } = await supabase
    .from('contacts')
    .update({ status: newStatus } as never)
    .eq('id', id)

  if (updateError) throw updateError

  // Record status change
  await supabase.from('status_changes').insert({
    contact_id: id,
    user_id: user?.id,
    old_status: oldStatus,
    new_status: newStatus,
    note: note || null,
  } as never)

  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
  revalidatePath('/tableau-de-bord')
}

export async function deleteContact(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('contacts').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/contacts')
  revalidatePath('/tableau-de-bord')
}

type StatusChangeWithUser = {
  id: string
  contact_id: string
  user_id: string | null
  old_status: ContactStatus | null
  new_status: ContactStatus
  note: string | null
  created_at: string
  user: Pick<Profile, 'id' | 'full_name'> | null
}

// -- Kanban actions --

const ALLOWED_INLINE_FIELDS = [
  'deal_amount',
  'next_followup_at',
  'priority',
  'assigned_to',
  'notes',
  'lost_reason',
] as const

export async function getContactsForKanban() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contacts')
    .select(
      `
      id, first_name, last_name, status, priority, deal_amount, next_followup_at, updated_at,
      company:companies!contacts_company_id_fkey(id, name),
      assigned_user:profiles!contacts_assigned_to_fkey(id, full_name)
    `
    )
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data as unknown as ContactForKanban[]) || []
}

export async function updateContactField(
  id: string,
  field: string,
  value: unknown
) {
  if (!ALLOWED_INLINE_FIELDS.includes(field as (typeof ALLOWED_INLINE_FIELDS)[number])) {
    throw new Error(`Champ non autorisé : ${field}`)
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('contacts')
    .update({ [field]: value } as never)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
  revalidatePath('/tableau-de-bord')
}

export async function quickCreateContact(data: {
  first_name: string
  company_id?: string | null
  status: ContactStatus
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('contacts').insert({
    first_name: data.first_name,
    company_id: data.company_id || null,
    status: data.status,
    priority: 'moyenne',
    created_by: user?.id,
  } as never)

  if (error) throw error
  revalidatePath('/contacts')
  revalidatePath('/tableau-de-bord')
}

export async function getStatusChanges(contactId: string): Promise<StatusChangeWithUser[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('status_changes')
    .select(
      `
      *,
      user:profiles!status_changes_user_id_fkey(id, full_name)
    `
    )
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as unknown as StatusChangeWithUser[]) || []
}

export async function getContactsByCompany(companyId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, status, deal_amount, position')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as unknown as {
    id: string
    first_name: string | null
    last_name: string | null
    status: string
    deal_amount: number | null
    position: string | null
  }[]) || []
}
