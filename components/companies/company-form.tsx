'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCompany, updateCompany } from '@/lib/actions/companies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Company } from '@/lib/types'

interface CompanyFormProps {
  company?: Company
}

export function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      business_type: formData.get('business_type') as string,
      address: (formData.get('address') as string) || null,
      city: formData.get('city') as string,
      postal_code: (formData.get('postal_code') as string) || null,
      phone: (formData.get('phone') as string) || null,
      email: (formData.get('email') as string) || null,
      website: (formData.get('website') as string) || null,
    }

    try {
      if (company) {
        await updateCompany(company.id, data)
      } else {
        await createCompany(data)
      }
      router.push('/entreprises')
      router.refresh()
    } catch {
      setError('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de l&apos;entreprise *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={company?.name}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_type">Type d&apos;activite *</Label>
          <Input
            id="business_type"
            name="business_type"
            placeholder="Restaurant, Coiffeur..."
            defaultValue={company?.business_type}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville *</Label>
          <Input
            id="city"
            name="city"
            defaultValue={company?.city}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Code postal</Label>
          <Input
            id="postal_code"
            name="postal_code"
            defaultValue={company?.postal_code || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telephone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={company?.phone || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={company?.email || ''}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            name="address"
            defaultValue={company?.address || ''}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input
            id="website"
            name="website"
            placeholder="https://..."
            defaultValue={company?.website || ''}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Enregistrement...'
            : company
              ? 'Modifier'
              : 'Creer l\'entreprise'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
