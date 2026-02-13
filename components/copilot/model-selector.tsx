'use client'

import { useState, useEffect, useRef } from 'react'
import { fuzzySearchItems } from '@/lib/utils/fuzzy-search'
import { ChevronDown, Search, Cpu } from 'lucide-react'
import type { OpenRouterModel } from '@/app/api/ai/models/route'

function formatCtx(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return `${n}`
}

function formatPrice(p: number): string {
  if (p < 0.01) return '<0.01'
  if (p >= 100) return p.toFixed(0)
  if (p >= 1) return p.toFixed(1)
  return p.toFixed(2)
}

export function ModelSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (modelId: string) => void
}) {
  const [models, setModels] = useState<OpenRouterModel[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/ai/models')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setModels(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = search
    ? fuzzySearchItems<OpenRouterModel>(search, models, (m) => [m.id, m.name], 20)
    : models.slice(0, 20)

  const selected = models.find((m) => m.id === value)

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm hover:bg-white/[0.06] transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Cpu className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">
            {loading
              ? 'Chargement...'
              : selected
                ? selected.name
                : value || 'Sélectionner un modèle'}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-white/10 bg-[oklch(0.15_0.02_280)] shadow-xl overflow-hidden">
          <div className="p-2 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un modèle..."
                className="w-full rounded-md border border-white/10 bg-white/[0.04] pl-8 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onChange(model.id)
                  setOpen(false)
                  setSearch('')
                }}
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/[0.08] transition-colors ${
                  model.id === value ? 'bg-indigo-500/10' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{model.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatCtx(model.contextLength)} ctx
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">
                    {model.id}
                  </span>
                  <span className="text-[10px] text-emerald-400 ml-auto shrink-0">
                    ${formatPrice(model.promptPrice)}/{formatPrice(model.completionPrice)} /M
                  </span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                Aucun modèle trouvé
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
