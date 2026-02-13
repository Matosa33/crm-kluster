'use client'

import { useState, useRef, useEffect } from 'react'
import { fuzzySearchItems } from '@/lib/utils/fuzzy-search'
import { Search, X, ChevronDown } from 'lucide-react'

export interface FuzzySelectOption {
  value: string
  label: string
  subtitle?: string
}

interface FuzzySelectProps {
  options: FuzzySelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyLabel?: string
  className?: string
}

export function FuzzySelect({
  options,
  value,
  onChange,
  placeholder = 'Rechercher...',
  emptyLabel = 'Aucun (optionnel)',
  className = '',
}: FuzzySelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query
    ? fuzzySearchItems(
        query,
        options,
        (o) => [o.label, o.subtitle || ''].filter(Boolean),
        15
      )
    : options.slice(0, 15)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-input rounded-md bg-background hover:bg-accent/50 transition-colors text-left"
      >
        <span className={selected ? '' : 'text-muted-foreground'}>
          {selected ? selected.label : emptyLabel}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
                setQuery('')
              }}
              className="p-0.5 rounded hover:bg-white/[0.1] transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md border border-white/[0.08] bg-[oklch(0.15_0.02_280)] shadow-xl max-h-[240px] overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-[192px]">
            {/* Empty option */}
            <button
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
                setQuery('')
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/[0.06] transition-colors ${
                !value ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {emptyLabel}
            </button>

            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                  setQuery('')
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/[0.06] transition-colors ${
                  option.value === value ? 'text-primary bg-primary/10' : ''
                }`}
              >
                <div className="truncate">{option.label}</div>
                {option.subtitle && (
                  <div className="text-[10px] text-muted-foreground truncate">
                    {option.subtitle}
                  </div>
                )}
              </button>
            ))}

            {filtered.length === 0 && query && (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                Aucun résultat pour &quot;{query}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
