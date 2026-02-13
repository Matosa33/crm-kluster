'use server'

import { createClient } from '@/lib/supabase/server'

export type TimelineEvent = {
  id: string
  type: 'activity' | 'status_change' | 'creation'
  date: string
  // Activity fields
  activityType?: 'appel' | 'email' | 'rdv' | 'note'
  subject?: string
  description?: string | null
  completed_at?: string | null
  duration_minutes?: number | null
  location?: string | null
  meeting_notes?: string | null
  // Status change fields
  oldStatus?: string | null
  newStatus?: string
  note?: string | null
  // Common
  userName?: string | null
}

export async function getContactTimeline(
  contactId: string
): Promise<TimelineEvent[]> {
  const supabase = await createClient()

  const [{ data: activities }, { data: statusChanges }, { data: contact }] =
    await Promise.all([
      supabase
        .from('activities')
        .select(
          `
          id, type, subject, description, completed_at,
          duration_minutes, location, meeting_notes, created_at,
          user:profiles!activities_user_id_fkey(full_name)
        `
        )
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false }),
      supabase
        .from('status_changes')
        .select(
          `
          id, old_status, new_status, note, created_at,
          user:profiles!status_changes_user_id_fkey(full_name)
        `
        )
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false }),
      supabase
        .from('contacts')
        .select('created_at')
        .eq('id', contactId)
        .single(),
    ])

  const events: TimelineEvent[] = []

  // Activities
  if (activities) {
    for (const a of activities as unknown as Array<{
      id: string
      type: 'appel' | 'email' | 'rdv' | 'note'
      subject: string
      description: string | null
      completed_at: string | null
      duration_minutes: number | null
      location: string | null
      meeting_notes: string | null
      created_at: string
      user: { full_name: string } | null
    }>) {
      events.push({
        id: a.id,
        type: 'activity',
        date: a.created_at,
        activityType: a.type,
        subject: a.subject,
        description: a.description,
        completed_at: a.completed_at,
        duration_minutes: a.duration_minutes,
        location: a.location,
        meeting_notes: a.meeting_notes,
        userName: a.user?.full_name || null,
      })
    }
  }

  // Status changes
  if (statusChanges) {
    for (const s of statusChanges as unknown as Array<{
      id: string
      old_status: string | null
      new_status: string
      note: string | null
      created_at: string
      user: { full_name: string } | null
    }>) {
      events.push({
        id: `sc-${s.id}`,
        type: 'status_change',
        date: s.created_at,
        oldStatus: s.old_status,
        newStatus: s.new_status,
        note: s.note,
        userName: s.user?.full_name || null,
      })
    }
  }

  // Contact creation
  if (contact) {
    const contactData = contact as unknown as { created_at: string }
    events.push({
      id: 'creation',
      type: 'creation',
      date: contactData.created_at,
    })
  }

  // Sort by date descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return events
}
