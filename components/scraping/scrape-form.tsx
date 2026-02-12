'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createScrapeJob } from '@/lib/actions/scraping'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FRENCH_CITIES } from '@/lib/constants/french-cities'
import { BUSINESS_TYPES } from '@/lib/constants/business-types'
import { Search } from 'lucide-react'

export function ScrapeForm() {
  const router = useRouter()
  const [city, setCity] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!city || !businessType) return
    setLoading(true)

    await createScrapeJob({ query: businessType, city })

    setLoading(false)
    setCity('')
    setBusinessType('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ville</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="Selectionner une ville" />
            </SelectTrigger>
            <SelectContent>
              {FRENCH_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <Button type="submit" disabled={loading || !city || !businessType}>
        <Search className="mr-2 h-4 w-4" />
        {loading ? 'Lancement...' : 'Lancer le scraping'}
      </Button>
    </form>
  )
}
