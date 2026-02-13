'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createScrapeJob } from '@/lib/actions/scraping'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FRENCH_CITIES } from '@/lib/constants/french-cities'
import { BUSINESS_TYPES } from '@/lib/constants/business-types'
import { fuzzySearchItems } from '@/lib/utils/fuzzy-search'
import { Search, MapPin, Loader2 } from 'lucide-react'
import type { FrenchCity } from '@/lib/constants/french-cities'

export function ScrapeForm() {
  const router = useRouter()
  const [city, setCity] = useState<FrenchCity | null>(null)
  const [citySearch, setCitySearch] = useState('')
  const [showCities, setShowCities] = useState(false)
  const [businessType, setBusinessType] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const cityRef = useRef<HTMLDivElement>(null)

  const filteredCities = fuzzySearchItems<FrenchCity>(
    citySearch,
    FRENCH_CITIES,
    (c) => [c.name, c.postalCode],
    10
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCities(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!city || !businessType) return
    setLoading(true)
    setResult(null)

    try {
      const res = await createScrapeJob({ query: businessType, city: city.name })

      if (res.error) {
        setResult({ type: 'error', message: res.error })
      } else {
        setResult({
          type: 'success',
          message: res.count != null
            ? `${res.count} entreprise(s) trouvée(s) via ${res.api || 'API'}`
            : 'Recherche lancée',
        })
        setCity(null)
        setCitySearch('')
        setBusinessType('')
      }
    } catch {
      setResult({ type: 'error', message: 'Erreur lors du lancement' })
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2" ref={cityRef}>
          <Label>Ville</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={city ? `${city.name} (${city.postalCode})` : citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value)
                setCity(null)
                setShowCities(true)
              }}
              onFocus={() => setShowCities(true)}
              placeholder="Rechercher une ville ou un code postal..."
              className="pl-10"
            />
            {showCities && filteredCities.length > 0 && (
              <div className="absolute z-50 w-full mt-1 rounded-lg border border-white/10 overflow-hidden max-h-60 overflow-y-auto bg-[oklch(0.15_0.02_280)] shadow-xl">
                {filteredCities.map((c) => (
                  <button
                    key={`${c.name}-${c.postalCode}`}
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/[0.08] transition-colors flex items-center gap-3"
                    onClick={() => {
                      setCity(c)
                      setCitySearch('')
                      setShowCities(false)
                    }}
                  >
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{c.name}</span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {c.postalCode}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessType">Type d&apos;entreprise</Label>
          <Input
            id="businessType"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="Restaurant, Coiffeur..."
            list="business-types"
            required
          />
          <datalist id="business-types">
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>
      </div>

      {result && (
        <div
          className={`text-sm px-4 py-3 rounded-lg ${
            result.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {result.message}
        </div>
      )}

      <Button type="submit" disabled={loading || !city || !businessType}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Recherche en cours...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Lancer la recherche
          </>
        )}
      </Button>
    </form>
  )
}
