'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Activity, Profile } from '@/lib/types'

type ActivityWithUser = Activity & {
  user: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export async function getActivities(
  contactId: string
): Promise<ActivityWithUser[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activities')
    .select(
      `
      *,
      user:profiles!activities_user_id_fkey(id, full_name, avatar_url)
    `
    )
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as unknown as ActivityWithUser[]) || []
}

export async function createActivity(data: {
  contact_id: string
  type: 'appel' | 'email' | 'rdv' | 'note'
  subject: string
  description?: string | null
  scheduled_at?: string | null
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
  revalidatePath(`/contacts/${data.contact_id}`)
  revalidatePath('/tableau-de-bord')
}

export async function completeActivity(id: string, contactId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('activities')
    .update({ completed_at: new Date().toISOString() } as never)
    .eq('id', id)

  if (error) throw error
  revalidatePath(`/contacts/${contactId}`)
}

export async function deleteActivity(id: string, contactId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('activities').delete().eq('id', id)

  if (error) throw error
  revalidatePath(`/contacts/${contactId}`)
}
