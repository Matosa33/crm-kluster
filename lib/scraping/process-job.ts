import { createClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Serper Maps API: ~20 results per page, supports page param (1-indexed)
async function scrapeSerperPage(query: string, city: string, page: number) {
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
      page,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(`[Serper] Erreur page ${page} - ${res.status}: ${text}`)
    return null
  }

  const data = await res.json()
  return (data.places || []) as Record<string, unknown>[]
}

async function scrapeWithSerper(query: string, city: string, pages: number) {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) return null

  const allResults: Record<string, unknown>[] = []

  for (let page = 1; page <= pages; page++) {
    const results = await scrapeSerperPage(query, city, page)
    if (!results || results.length === 0) break
    allResults.push(...results)
    // Small delay between pages to be respectful
    if (page < pages) await new Promise((r) => setTimeout(r, 300))
  }

  if (allResults.length === 0) return null
  return { results: allResults, api: 'serper' as const }
}

// SerpAPI: supports start parameter for offset (0, 20, 40...)
async function scrapeWithSerpAPI(query: string, city: string, pages: number) {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) return null

  const allResults: Record<string, unknown>[] = []

  for (let page = 0; page < pages; page++) {
    const params = new URLSearchParams({
      engine: 'google_maps',
      q: `${query} ${city} France`,
      hl: 'fr',
      gl: 'fr',
      start: String(page * 20),
      api_key: apiKey,
    })

    const res = await fetch(`https://serpapi.com/search?${params}`)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`[SerpAPI] Erreur page ${page} - ${res.status}: ${text}`)
      break
    }

    const data = await res.json()
    const results = (data.local_results || []) as Record<string, unknown>[]
    if (results.length === 0) break
    allResults.push(...results)
    if (page < pages - 1) await new Promise((r) => setTimeout(r, 300))
  }

  if (allResults.length === 0) return null
  return { results: allResults, api: 'serpapi' as const }
}

export interface ProcessJobResult {
  success: boolean
  count: number
  error?: string
  api?: string
}

export async function processJob(jobId: string, pages: number = 1): Promise<ProcessJobResult> {
  const supabase = getAdminSupabase()

  // Get job
  const { data: job, error: jobError } = await supabase
    .from('scrape_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    return { success: false, count: 0, error: 'Job introuvable' }
  }

  // Update status to running
  await supabase
    .from('scrape_jobs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', jobId)

  try {
    // Serper Maps doesn't support pagination (page param ignored, always ~20 results).
    // SerpAPI supports pagination via `start` offset.
    // When multiple pages requested: SerpAPI first, Serper fallback.
    // When single page: Serper first (faster/cheaper), SerpAPI fallback.
    let scrapeResult: {
      results: Record<string, unknown>[]
      api: string
    } | null = null

    if (pages > 1) {
      scrapeResult = await scrapeWithSerpAPI(job.query, job.city, pages)
      if (!scrapeResult || scrapeResult.results.length === 0) {
        scrapeResult = await scrapeWithSerper(job.query, job.city, 1)
      }
    } else {
      scrapeResult = await scrapeWithSerper(job.query, job.city, 1)
      if (!scrapeResult || scrapeResult.results.length === 0) {
        scrapeResult = await scrapeWithSerpAPI(job.query, job.city, 1)
      }
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

      return { success: true, count: 0, api: 'aucun résultat' }
    }

    // Deduplicate by name (same business can appear on multiple pages)
    const seen = new Set<string>()
    const uniqueResults = scrapeResult.results.filter((place) => {
      const name = String(place.title || place.name || '').toLowerCase().trim()
      if (!name || seen.has(name)) return false
      seen.add(name)
      return true
    })

    // Insert companies (upsert to avoid duplicates)
    let count = 0
    for (const place of uniqueResults) {
      // Extract categories from both API formats
      const categories: string[] = []
      if (place.types && Array.isArray(place.types)) {
        categories.push(...(place.types as string[]))
      } else if (place.type) {
        categories.push(String(place.type))
      }
      if (place.category && !categories.includes(String(place.category))) {
        categories.push(String(place.category))
      }

      // Extract GPS coordinates
      const gps = place.gps_coordinates as Record<string, number> | undefined
      const latitude = gps?.latitude ?? (place.latitude as number) ?? null
      const longitude = gps?.longitude ?? (place.longitude as number) ?? null

      // Extract opening hours (SerpAPI: object, Serper: may be string)
      let opening_hours: Record<string, string> | null = null
      if (place.operating_hours && typeof place.operating_hours === 'object') {
        opening_hours = place.operating_hours as Record<string, string>
      } else if (place.hours && typeof place.hours === 'string') {
        opening_hours = { info: place.hours as string }
      }

      // Extract service options (SerpAPI only)
      const service_options =
        place.service_options && typeof place.service_options === 'object'
          ? (place.service_options as Record<string, boolean>)
          : null

      // Extract postal code from address (French: 5 digits before city name)
      const rawAddress = String(place.address || place.street || '')
      const postalMatch = rawAddress.match(/\b(\d{5})\b/)
      const postal_code = postalMatch ? postalMatch[1] : null

      // Core fields (always written)
      const companyData: Record<string, unknown> = {
        name: place.title || place.name || 'Sans nom',
        business_type: job.query,
        city: job.city,
        address: rawAddress || null,
        postal_code,
        phone: place.phoneNumber || place.phone || null,
        website: place.website || null,
        google_maps_url: place.link || place.place_url || null,
        rating: place.rating != null ? Number(place.rating) : null,
        review_count: place.ratingCount || place.reviews || place.reviewsCount || place.user_ratings_total || 0,
        source_api: scrapeResult.api,
        scraped_at: new Date().toISOString(),
        created_by: job.created_by,
      }

      // Enrichment fields: only include when API returns data (avoid overwriting manual input with null)
      if (place.description) companyData.description = String(place.description)
      if (categories.length > 0) companyData.categories = categories
      if (opening_hours) companyData.opening_hours = opening_hours
      if (service_options) companyData.service_options = service_options
      if (latitude != null) companyData.latitude = latitude
      if (longitude != null) companyData.longitude = longitude

      const { error: insertError } = await supabase
        .from('companies')
        .upsert(companyData as never, {
          onConflict: 'name,city',
          ignoreDuplicates: false,
        })

      if (!insertError) count++
    }

    // Batch recalculate GMB scores for all companies in this city
    // Uses SQL so the score accounts for ALL data (scraped + manually entered)
    try {
      await supabase.rpc('recalculate_gmb_scores' as never, { target_city: job.city } as never)
    } catch {
      // Ignore if RPC doesn't exist yet
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

    return { success: true, count, api: scrapeResult.api }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    // Update job as failed
    await supabase
      .from('scrape_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq('id', jobId)

    return { success: false, count: 0, error: errorMessage }
  }
}
