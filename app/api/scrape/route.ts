import { NextRequest, NextResponse } from 'next/server'
import { processJob } from '@/lib/scraping/process-job'

export async function POST(request: NextRequest) {
  // Verify authorization (for cron/webhook calls)
  const authHeader = request.headers.get('authorization')
  const apiKey = request.headers.get('x-api-key')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const isAuthorized =
    authHeader === `Bearer ${serviceKey}` || apiKey === serviceKey

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await request.json()
  const { jobId } = body

  if (!jobId) {
    return NextResponse.json({ error: 'jobId manquant' }, { status: 400 })
  }

  const result = await processJob(jobId)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, count: result.count },
      { status: 500 }
    )
  }

  return NextResponse.json({
    message: 'Scraping terminé',
    count: result.count,
    api: result.api,
  })
}
