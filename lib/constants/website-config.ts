import type { WebsiteStatus, WebsiteQuality } from '@/lib/types'

export const WEBSITE_STATUS_CONFIG: Record<
  WebsiteStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  inconnu: {
    label: 'Non vérifié',
    color: 'text-slate-300',
    bgColor: 'bg-slate-500/20 ring-1 ring-slate-500/30',
    icon: '?',
  },
  pas_de_site: {
    label: 'Pas de site',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/20 ring-1 ring-emerald-500/30',
    icon: '!',
  },
  site_existant: {
    label: 'Site existant',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20 ring-1 ring-blue-500/30',
    icon: 'W',
  },
}

export const WEBSITE_QUALITY_CONFIG: Record<
  WebsiteQuality,
  { label: string; color: string; bgColor: string }
> = {
  bonne: {
    label: 'Bonne qualité',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/20 ring-1 ring-emerald-500/30',
  },
  correcte: {
    label: 'Correcte',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20 ring-1 ring-blue-500/30',
  },
  mauvaise: {
    label: 'Mauvaise',
    color: 'text-orange-300',
    bgColor: 'bg-orange-500/20 ring-1 ring-orange-500/30',
  },
  obsolete: {
    label: 'Obsolète',
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/20 ring-1 ring-rose-500/30',
  },
}

export const WEBSITE_STATUS_ORDER: WebsiteStatus[] = [
  'inconnu',
  'pas_de_site',
  'site_existant',
]

export const WEBSITE_QUALITY_ORDER: WebsiteQuality[] = [
  'bonne',
  'correcte',
  'mauvaise',
  'obsolete',
]
