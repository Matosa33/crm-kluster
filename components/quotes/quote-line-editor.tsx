'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Trash2, GripVertical, ChevronDown } from 'lucide-react'

const UNIT_OPTIONS = [
  'unité', 'heure', 'mois', 'page', 'article', 'brief', 'cocon', 'forfait',
]

type QuoteLine = {
  id: string
  catalogItemId?: string | null
  label: string
  description: string
  quantity: number
  unitPriceHT: number
  discountPercent: number
  unitLabel: string
  section: string
}

function UnitSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-9 rounded-md border border-white/10 bg-white/[0.04] px-2 text-sm flex items-center justify-between hover:bg-white/[0.06] transition-colors"
      >
        <span>{value}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-white/10 overflow-hidden bg-[oklch(0.15_0.02_280)] shadow-xl">
          {UNIT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                option === value
                  ? 'bg-primary/15 text-primary'
                  : 'hover:bg-white/[0.08] text-foreground'
              }`}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function QuoteLineEditor({
  line,
  onUpdate,
  onRemove,
}: {
  line: QuoteLine
  onUpdate: (updates: Partial<QuoteLine>) => void
  onRemove: () => void
}) {
  const lineTotal = line.quantity * line.unitPriceHT * (1 - line.discountPercent / 100)

  return (
    <div className="group flex items-start gap-2 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-colors">
      <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

      <div className="flex-1 space-y-2">
        {/* Label + section */}
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              value={line.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Nom de la prestation"
              className="font-medium"
            />
          </div>
          {line.section && (
            <span className="text-[10px] px-2 py-1 rounded bg-white/[0.06] text-muted-foreground shrink-0 mt-1.5">
              {line.section}
            </span>
          )}
        </div>

        {/* Description */}
        <Input
          value={line.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Description (optionnel)"
          className="text-xs"
        />

        {/* Qty, Price, Discount, Total */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">Quantité</label>
            <Input
              type="number"
              min={0.01}
              step={0.01}
              value={line.quantity}
              onChange={(e) => onUpdate({ quantity: parseFloat(e.target.value) || 0 })}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Unité</label>
            <UnitSelect
              value={line.unitLabel}
              onChange={(v) => onUpdate({ unitLabel: v })}
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Prix unit. HT</label>
            <Input
              type="number"
              min={0}
              step={1}
              value={line.unitPriceHT}
              onChange={(e) => onUpdate({ unitPriceHT: parseFloat(e.target.value) || 0 })}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Remise (%)</label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={line.discountPercent}
              onChange={(e) => onUpdate({ discountPercent: parseFloat(e.target.value) || 0 })}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Total HT</label>
            <div className="h-9 flex items-center text-sm font-semibold px-1">
              {lineTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors shrink-0 mt-1"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
