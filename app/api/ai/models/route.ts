import { NextResponse } from 'next/server'

export type OpenRouterModel = {
  id: string
  name: string
  contextLength: number
  promptPrice: number // $/M tokens
  completionPrice: number // $/M tokens
}

let cachedModels: OpenRouterModel[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function GET() {
  const now = Date.now()

  if (cachedModels && now - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json(cachedModels)
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des modèles' },
        { status: 502 }
      )
    }

    const json = await res.json()

    const models: OpenRouterModel[] = (json.data || [])
      .filter(
        (m: Record<string, unknown>) =>
          m.id &&
          typeof m.pricing === 'object' &&
          m.pricing !== null
      )
      .map((m: Record<string, unknown>) => {
        const pricing = m.pricing as Record<string, string>
        return {
          id: m.id as string,
          name: (m.name as string) || (m.id as string),
          contextLength: (m.context_length as number) || 0,
          promptPrice: parseFloat(pricing.prompt || '0') * 1_000_000,
          completionPrice: parseFloat(pricing.completion || '0') * 1_000_000,
        }
      })
      .filter(
        (m: OpenRouterModel) => m.contextLength >= 4000 && m.promptPrice > 0
      )
      .sort((a: OpenRouterModel, b: OpenRouterModel) => a.promptPrice - b.promptPrice)

    cachedModels = models
    cacheTimestamp = now

    return NextResponse.json(models)
  } catch {
    return NextResponse.json(
      { error: 'Impossible de contacter OpenRouter' },
      { status: 502 }
    )
  }
}
