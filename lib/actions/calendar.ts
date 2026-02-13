'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CalendarActivity } from '@/lib/types'

const CALENDAR_SELECT = `
  id, contact_id, type, subject, description, scheduled_at, completed_at,
  duration_minutes, location, attendees, meeting_notes, created_at,
  contact:contacts!activities_contact_id_fkey(
    id, first_name, last_name, deal_amount,
    company:companies!contacts_company_id_fkey(id, name)
  ),
  user:profiles!activities_user_id_fkey(id, full_name)
`

export async function getCalendarActivities(
  startDate: string,
  endDate: string
): Promise<CalendarActivity[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activities')
    .select(CALENDAR_SELECT)
    .not('scheduled_at', 'is', null)
    .gte('scheduled_at', startDate)
    .lte('scheduled_at', endDate)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return (data as unknown as CalendarActivity[]) || []
}

export async function getTodayActivities(): Promise<CalendarActivity[]> {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

  return getCalendarActivities(start, end)
}

export async function getUpcomingActivities(
  limit = 10
): Promise<CalendarActivity[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activities')
    .select(CALENDAR_SELECT)
    .not('scheduled_at', 'is', null)
    .gte('scheduled_at', new Date().toISOString())
    .is('completed_at', null)
    .order('scheduled_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data as unknown as CalendarActivity[]) || []
}

export async function createCalendarEvent(data: {
  contact_id: string
  type: 'appel' | 'email' | 'rdv' | 'note'
  subject: string
  description?: string | null
  scheduled_at: string
  duration_minutes?: number | null
  location?: string | null
  meeting_notes?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('activities').insert({
    ...data,
    user_id: user?.id,
  } as never)

  if (error) throw error
  revalidatePath('/calendrier')
  revalidatePath(`/contacts/${data.contact_id}`)
  revalidatePath('/tableau-de-bord')
}

export async function updateCalendarEvent(
  id: string,
  data: {
    subject?: string
    description?: string | null
    scheduled_at?: string
    duration_minutes?: number | null
    location?: string | null
    meeting_notes?: string | null
    completed_at?: string | null
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('activities')
    .update(data as never)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/calendrier')
  revalidatePath('/tableau-de-bord')
}

export async function deleteCalendarEvent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('activities').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/calendrier')
  revalidatePath('/tableau-de-bord')
}
