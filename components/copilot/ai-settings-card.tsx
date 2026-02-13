'use client'

import { useState } from 'react'
import { upsertAiSettings } from '@/lib/actions/ai-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModelSelector } from './model-selector'
import { Bot, Eye, EyeOff, Loader2, Save } from 'lucide-react'
import type { AiSettings, AiTone } from '@/lib/types'

const TONES: { value: AiTone; label: string; desc: string }[] = [
  { value: 'professionnel', label: 'Professionnel', desc: 'Ton chaleureux et structuré' },
  { value: 'decontracte', label: 'Décontracté', desc: 'Direct et punchy' },
  { value: 'technique', label: 'Technique', desc: 'Vocabulaire web/SEO précis' },
]

export function AiSettingsCard({
  initialSettings,
}: {
  initialSettings: AiSettings | null
}) {
  const [apiKey, setApiKey] = useState(initialSettings?.openrouter_api_key || '')
  const [modelId, setModelId] = useState(
    initialSettings?.model_id || 'anthropic/claude-sonnet-4'
  )
  const [tone, setTone] = useState<AiTone>(initialSettings?.tone || 'professionnel')
  const [customInstructions, setCustomInstructions] = useState(
    initialSettings?.custom_instructions || ''
  )
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setResult(null)
    const res = await upsertAiSettings({
      openrouter_api_key: apiKey || null,
      model_id: modelId,
      tone,
      custom_instructions: customInstructions || null,
    })

    if (res.error) {
      setResult({ type: 'error', msg: res.error })
    } else {
      setResult({ type: 'success', msg: 'Paramètres IA enregistrés' })
    }
    setSaving(false)
  }

  return (
    <div className="glass-card rounded-2xl p-6 lg:col-span-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <Bot className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Assistant IA (Copilot)</h2>
          <p className="text-xs text-muted-foreground">
            Configurez l&apos;assistant commercial propulsé par OpenRouter
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* API Key */}
        <div className="space-y-2">
          <Label>Clé API OpenRouter</Label>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Obtenez votre clé sur{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline"
            >
              openrouter.ai/keys
            </a>
          </p>
        </div>

        {/* Model Selector */}
        <div className="space-y-2">
          <Label>Modèle IA</Label>
          <ModelSelector value={modelId} onChange={setModelId} />
          <p className="text-[11px] text-muted-foreground">
            Les prix affichés sont en $/M tokens (input/output)
          </p>
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <Label>Ton de l&apos;assistant</Label>
          <div className="grid grid-cols-3 gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTone(t.value)}
                className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  tone === t.value
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                    : 'bg-white/[0.02] border-white/10 text-muted-foreground hover:bg-white/[0.06]'
                }`}
              >
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-[10px] mt-0.5 opacity-70">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="space-y-2">
          <Label>Instructions personnalisées</Label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Ex: Toujours proposer la maintenance en option, mentionner notre garantie 30 jours..."
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/30 resize-none"
          />
        </div>

        {/* Save */}
        {result && (
          <div
            className={`text-sm px-4 py-2.5 rounded-lg ${
              result.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {result.msg}
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les paramètres IA
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
