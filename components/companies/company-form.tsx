'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCompany, updateCompany } from '@/lib/actions/companies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  WEBSITE_STATUS_CONFIG,
  WEBSITE_STATUS_ORDER,
  WEBSITE_QUALITY_CONFIG,
  WEBSITE_QUALITY_ORDER,
} from '@/lib/constants/website-config'
import type { Company, WebsiteStatus, WebsiteQuality } from '@/lib/types'

interface CompanyFormProps {
  company?: Company
}

export function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus>(
    company?.website_status || 'inconnu'
  )
  const [websiteQuality, setWebsiteQuality] = useState<WebsiteQuality | ''>(
    company?.website_quality || ''
  )
  const [isMobileFriendly, setIsMobileFriendly] = useState<string>(
    company?.is_mobile_friendly === true
      ? 'oui'
      : company?.is_mobile_friendly === false
        ? 'non'
        : ''
  )

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
      website_status: websiteStatus,
      website_quality: (websiteQuality as WebsiteQuality) || null,
      is_mobile_friendly:
        isMobileFriendly === 'oui'
          ? true
          : isMobileFriendly === 'non'
            ? false
            : null,
      website_notes: (formData.get('website_notes') as string) || null,
      description: (formData.get('description') as string) || null,
      social_facebook: (formData.get('social_facebook') as string) || null,
      social_instagram: (formData.get('social_instagram') as string) || null,
      social_twitter: (formData.get('social_twitter') as string) || null,
      social_linkedin: (formData.get('social_linkedin') as string) || null,
      social_youtube: (formData.get('social_youtube') as string) || null,
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Infos générales */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
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
            <Label htmlFor="business_type">Type d&apos;activité *</Label>
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
            <Label htmlFor="phone">Téléphone</Label>
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
        </div>
      </div>

      {/* Intelligence site web */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Analyse du site web</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="website">URL du site</Label>
            <Input
              id="website"
              name="website"
              placeholder="https://..."
              defaultValue={company?.website || ''}
            />
          </div>

          <div className="space-y-2">
            <Label>Statut du site</Label>
            <Select
              value={websiteStatus}
              onValueChange={(v) => setWebsiteStatus(v as WebsiteStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEBSITE_STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {WEBSITE_STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {websiteStatus === 'site_existant' && (
            <>
              <div className="space-y-2">
                <Label>Qualité du site</Label>
                <Select
                  value={websiteQuality}
                  onValueChange={(v) =>
                    setWebsiteQuality(v as WebsiteQuality)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Évaluer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {WEBSITE_QUALITY_ORDER.map((q) => (
                      <SelectItem key={q} value={q}>
                        {WEBSITE_QUALITY_CONFIG[q].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mobile-friendly ?</Label>
                <Select
                  value={isMobileFriendly}
                  onValueChange={setIsMobileFriendly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Non vérifié" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oui">Oui</SelectItem>
                    <SelectItem value="non">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="website_notes">
              Notes sur le site{' '}
              <span className="text-muted-foreground font-normal">
                (manques, problèmes, arguments de vente...)
              </span>
            </Label>
            <Textarea
              id="website_notes"
              name="website_notes"
              rows={3}
              placeholder="Ex: Site pas responsive, design des années 2010, pas de page Google My Business, pas de SEO..."
              defaultValue={company?.website_notes || ''}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Description</h3>
        <div className="space-y-2">
          <Textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Description de l'entreprise, activités principales..."
            defaultValue={company?.description || ''}
          />
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Réseaux sociaux</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="social_facebook">Facebook</Label>
            <Input
              id="social_facebook"
              name="social_facebook"
              placeholder="https://facebook.com/..."
              defaultValue={company?.social_facebook || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_instagram">Instagram</Label>
            <Input
              id="social_instagram"
              name="social_instagram"
              placeholder="https://instagram.com/..."
              defaultValue={company?.social_instagram || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_twitter">X / Twitter</Label>
            <Input
              id="social_twitter"
              name="social_twitter"
              placeholder="https://twitter.com/..."
              defaultValue={company?.social_twitter || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_linkedin">LinkedIn</Label>
            <Input
              id="social_linkedin"
              name="social_linkedin"
              placeholder="https://linkedin.com/..."
              defaultValue={company?.social_linkedin || ''}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="social_youtube">YouTube</Label>
            <Input
              id="social_youtube"
              name="social_youtube"
              placeholder="https://youtube.com/..."
              defaultValue={company?.social_youtube || ''}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Enregistrement...'
            : company
              ? 'Modifier'
              : 'Créer l\'entreprise'}
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
