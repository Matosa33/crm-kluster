import type { Company } from '@/lib/types'

type GmbScoreInput = Partial<
  Pick<
    Company,
    | 'phone'
    | 'website'
    | 'address'
    | 'rating'
    | 'review_count'
    | 'description'
    | 'opening_hours'
    | 'categories'
    | 'google_maps_url'
    | 'social_facebook'
    | 'social_instagram'
    | 'social_twitter'
    | 'social_linkedin'
    | 'social_youtube'
    | 'email'
  >
>

export function computeGmbScore(company: GmbScoreInput): number {
  let score = 0

  if (company.phone) score += 10
  if (company.website) score += 15
  if (company.address) score += 5
  if (company.rating != null && company.rating > 0) score += 10
  if ((company.review_count ?? 0) >= 5) score += 10
  if ((company.review_count ?? 0) >= 20) score += 5
  if (company.description) score += 10
  if (company.opening_hours) score += 10
  if (company.categories && company.categories.length > 0) score += 5
  if (company.google_maps_url) score += 5
  if (
    company.social_facebook ||
    company.social_instagram ||
    company.social_twitter ||
    company.social_linkedin ||
    company.social_youtube
  )
    score += 10
  if (company.email) score += 5

  return Math.min(score, 100)
}

export function getGmbScoreConfig(score: number): {
  label: string
  color: string
  bgColor: string
} {
  if (score >= 80)
    return {
      label: 'Excellent',
      color: 'text-emerald-300',
      bgColor: 'bg-emerald-500/20 ring-1 ring-emerald-500/30',
    }
  if (score >= 60)
    return {
      label: 'Bon',
      color: 'text-blue-300',
      bgColor: 'bg-blue-500/20 ring-1 ring-blue-500/30',
    }
  if (score >= 40)
    return {
      label: 'Moyen',
      color: 'text-amber-300',
      bgColor: 'bg-amber-500/20 ring-1 ring-amber-500/30',
    }
  if (score >= 20)
    return {
      label: 'Faible',
      color: 'text-orange-300',
      bgColor: 'bg-orange-500/20 ring-1 ring-orange-500/30',
    }
  return {
    label: 'Minimal',
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/20 ring-1 ring-rose-500/30',
  }
}
