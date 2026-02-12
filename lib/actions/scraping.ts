'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
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

export async function createScrapeJob(data: { query: string; city: string }) {
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

  if (error) throw error

  const jobData = job as unknown as { id: string }

  // Trigger the scraping API route
  try {
    const origin = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    await fetch(`${origin}/api/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: jobData.id }),
    }).catch(() => {
      // API route may not be available, job will be picked up by cron
    })
  } catch {
    // Silently fail - the cron will pick it up
  }

  revalidatePath('/scraping')
  return jobData
}
