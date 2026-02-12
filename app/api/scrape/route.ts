import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function scrapeWithSerper(query: string, city: string) {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) return null

  const res = await fetch('https://google.serper.dev/maps', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: `${query} ${city} France`,
      gl: 'fr',
      hl: 'fr',
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  return { results: data.places || [], api: 'serper' as const }
}

async function scrapeWithSerpAPI(query: string, city: string) {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) return null

  const params = new URLSearchParams({
    engine: 'google_maps',
    q: `${query} ${city} France`,
    hl: 'fr',
    gl: 'fr',
    api_key: apiKey,
  })

  const res = await fetch(`https://serpapi.com/search?${params}`)
  if (!res.ok) return null
  const data = await res.json()
  return { results: data.local_results || [], api: 'serpapi' as const }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()

  // Verify authorization (simple secret check for cron/webhook)
  const authHeader = request.headers.get('authorization')
  const isAuthorized =
    authHeader === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` ||
    request.headers.get('x-api-key') === process.env.SUPABASE_SERVICE_ROLE_KEY

  // Also allow calls from the same origin (server actions)
  const body = await request.json()
  const { jobId } = body

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })
  }

  // Get job
  const { data: job, error: jobError } = await supabase
    .from('scrape_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Update status to running
  await supabase
    .from('scrape_jobs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', jobId)

  try {
    // Try Serper first, fallback to SerpAPI
    let scrapeResult: { results: Record<string, unknown>[]; api: string } | null = await scrapeWithSerper(job.query, job.city)
    if (!scrapeResult || scrapeResult.results.length === 0) {
      scrapeResult = await scrapeWithSerpAPI(job.query, job.city)
    }

    if (!scrapeResult || scrapeResult.results.length === 0) {
      await supabase
        .from('scrape_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          results_count: 0,
          api_used: 'serper',
        })
        .eq('id', jobId)

      return NextResponse.json({ message: 'No results found', count: 0 })
    }

    // Insert companies (upsert to avoid duplicates)
    let count = 0
    for (const place of scrapeResult.results) {
      const companyData = {
        name: place.title || place.name || 'Sans nom',
        business_type: job.query,
        city: job.city,
        address: place.address || place.street || null,
        phone: place.phoneNumber || place.phone || null,
        website: place.website || null,
        google_maps_url: place.link || place.place_url || null,
        rating: place.rating || null,
        review_count: place.reviews || place.reviewsCount || 0,
        source_api: scrapeResult.api,
        scraped_at: new Date().toISOString(),
        created_by: job.created_by,
      }

      const { error: insertError } = await supabase
        .from('companies')
        .upsert(companyData, {
          onConflict: 'name,city',
          ignoreDuplicates: true,
        })

      if (!insertError) count++
    }

    // Update job as completed
    await supabase
      .from('scrape_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        results_count: count,
        api_used: scrapeResult.api,
      })
      .eq('id', jobId)

    return NextResponse.json({ message: 'Scraping completed', count })
  } catch (error) {
    // Update job as failed
    await supabase
      .from('scrape_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', jobId)

    return NextResponse.json(
      { error: 'Scraping failed' },
      { status: 500 }
    )
  }
}
