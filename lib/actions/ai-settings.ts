'use server'

import { createClient } from '@/lib/supabase/server'
import type { AiSettings } from '@/lib/types'

export async function getAiSettings(): Promise<AiSettings | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('ai_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (data as unknown as AiSettings) ?? null
}

export async function upsertAiSettings(
  settings: Partial<Pick<AiSettings, 'openrouter_api_key' | 'model_id' | 'custom_instructions' | 'tone'>>
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('ai_settings')
    .upsert(
      {
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: 'user_id' }
    )

  if (error) return { error: error.message }
  return { success: true }
}
