import type { QuoteStatus } from '@/lib/types'

export const QUOTE_STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; color: string; bgColor: string }
> = {
  brouillon: {
    label: 'Brouillon',
    color: 'text-slate-300',
    bgColor: 'bg-slate-500/15',
  },
  envoye: {
    label: 'Envoyé',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
  },
  accepte: {
    label: 'Accepté',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
  },
  refuse: {
    label: 'Refusé',
    color: 'text-red-400',
    bgColor: 'bg-red-500/15',
  },
  expire: {
    label: 'Expiré',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
  },
}
