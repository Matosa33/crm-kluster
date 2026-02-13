import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { createClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from '@/lib/ai/system-prompt'
import type { CopilotContext } from '@/lib/ai/types'
import type { AiSettings, AiTone } from '@/lib/types'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Non authentifié', { status: 401 })
  }

  const { data: settings } = await supabase
    .from('ai_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const aiSettings = settings as unknown as AiSettings | null

  if (!aiSettings?.openrouter_api_key) {
    return new Response(
      JSON.stringify({
        error: 'Configurez votre clé API OpenRouter dans Paramètres > Assistant IA',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const body = await req.json()
  const { messages, context } = body as {
    messages: UIMessage[]
    context?: CopilotContext
  }

  // Convert UIMessage (parts-based) to ModelMessage (content-based) for streamText
  const modelMessages = await convertToModelMessages(messages, {
    ignoreIncompleteToolCalls: true,
  })

  const systemPrompt = buildSystemPrompt(
    context || { type: 'company' },
    (aiSettings.tone as AiTone) || 'professionnel',
    aiSettings.custom_instructions
  )

  const openrouter = createOpenRouter({
    apiKey: aiSettings.openrouter_api_key,
  })

  const result = streamText({
    model: openrouter(aiSettings.model_id || 'anthropic/claude-sonnet-4'),
    system: systemPrompt,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
