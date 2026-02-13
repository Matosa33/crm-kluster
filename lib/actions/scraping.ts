'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { processJob } from '@/lib/scraping/process-job'
import type { ScrapeJob, Profile } from '@/lib/types'

type ScrapeJobWithUser = ScrapeJob & {
  created_by_user: Pick<Profile, 'id' | 'full_name'> | null
}

export async function getScrapeJobs(): Promise<ScrapeJobWithUser[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('scrape_jobs')
    .select(
      `
      *,
      created_by_user:profiles!scrape_jobs_created_by_fkey(id, full_name)
    `
    )
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data as unknown as ScrapeJobWithUser[]) || []
}

export async function createScrapeJob(data: {
  query: string
  city: string
  pages?: number
}): Promise<{ id?: string; count?: number; api?: string; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: job, error } = await supabase
    .from('scrape_jobs')
    .insert({
      query: data.query,
      city: data.city,
      created_by: user?.id,
    } as never)
    .select()
    .single()

  if (error) {
    return { error: `Erreur création du job : ${error.message}` }
  }

  const jobData = job as unknown as { id: string }

  // Process the job directly (no more HTTP self-call)
  const result = await processJob(jobData.id, data.pages || 1)

  revalidatePath('/scraping')
  revalidatePath('/entreprises')

  if (!result.success) {
    return {
      id: jobData.id,
      error: result.error || 'Erreur lors du scraping',
    }
  }

  return {
    id: jobData.id,
    count: result.count,
    api: result.api,
  }
}
