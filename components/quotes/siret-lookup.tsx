'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { searchCompanyBySiretOrName, type SiretResult } from '@/lib/actions/siret'
import { Search, Loader2, Building2 } from 'lucide-react'

export function SiretLookup({
  onSelect,
}: {
  onSelect: (data: {
    siret: string
    legalName: string
    address: string
    city: string
    postalCode: string
    nafCode: string
    nafLabel: string
  }) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SiretResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (value: string) => {
    setQuery(value)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (value.length < 3) {
      setResults([])
      setShowResults(false)
      return
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)

      const res = await searchCompanyBySiretOrName(value)

      if (res.error) {
        setError(res.error)
        setResults([])
      } else {
        setResults(res.results)
      }

      setShowResults(true)
      setLoading(false)
    }, 400)
  }

  const handleSelect = (result: SiretResult) => {
    onSelect({
      siret: result.siret,
      legalName: result.legalName,
      address: result.address,
      city: result.city,
      postalCode: result.postalCode,
      nafCode: result.nafCode,
      nafLabel: result.nafLabel,
    })
    setQuery(result.legalName)
    setShowResults(false)
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label className="flex items-center gap-1.5">
        <Search className="h-3.5 w-3.5" />
        Recherche SIRET / Entreprise
      </Label>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Tapez un SIRET, SIREN ou nom d'entreprise..."
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {showResults && (results.length > 0 || error) && (
          <div className="absolute z-50 w-full mt-1 rounded-lg border border-white/10 overflow-hidden max-h-60 overflow-y-auto bg-[oklch(0.15_0.02_280)] shadow-xl">
            {error && (
              <div className="px-4 py-3 text-sm text-muted-foreground">{error}</div>
            )}
            {results.map((result, i) => (
              <button
                key={`${result.siret}-${i}`}
                type="button"
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/[0.08] transition-colors"
                onClick={() => handleSelect(result)}
              >
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{result.legalName}</p>
                    <p className="text-xs text-muted-foreground">
                      SIRET : {result.siret}
                      {result.nafLabel && ` — ${result.nafLabel}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.address && `${result.address}, `}
                      {result.postalCode} {result.city}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        API entreprise.data.gouv.fr — Données publiques INSEE
      </p>
    </div>
  )
}
