import type { ContactStatus } from '@/lib/types'

export const STATUS_CONFIG: Record<
  ContactStatus,
  { label: string; color: string; bgColor: string; dropColor: string; accent: string }
> = {
  a_contacter: {
    label: 'À contacter',
    color: 'text-slate-300',
    bgColor: 'bg-slate-500/20 ring-1 ring-slate-500/30',
    dropColor: 'ring-2 ring-slate-400/40',
    accent: 'bg-slate-500',
  },
  contacte: {
    label: 'Contacté',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20 ring-1 ring-blue-500/30',
    dropColor: 'ring-2 ring-blue-400/40',
    accent: 'bg-blue-500',
  },
  rdv_planifie: {
    label: 'RDV planifié',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/20 ring-1 ring-amber-500/30',
    dropColor: 'ring-2 ring-amber-400/40',
    accent: 'bg-amber-500',
  },
  devis_envoye: {
    label: 'Devis envoyé',
    color: 'text-orange-300',
    bgColor: 'bg-orange-500/20 ring-1 ring-orange-500/30',
    dropColor: 'ring-2 ring-orange-400/40',
    accent: 'bg-orange-500',
  },
  gagne: {
    label: 'Gagné',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/20 ring-1 ring-emerald-500/30',
    dropColor: 'ring-2 ring-emerald-400/40',
    accent: 'bg-emerald-500',
  },
  perdu: {
    label: 'Perdu',
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/20 ring-1 ring-rose-500/30',
    dropColor: 'ring-2 ring-rose-400/40',
    accent: 'bg-rose-500',
  },
}

export const STATUS_ORDER: ContactStatus[] = [
  'a_contacter',
  'contacte',
  'rdv_planifie',
  'devis_envoye',
  'gagne',
  'perdu',
]
