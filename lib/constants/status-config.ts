import type { ContactStatus } from '@/lib/types'

export const STATUS_CONFIG: Record<
  ContactStatus,
  { label: string; color: string; bgColor: string }
> = {
  a_contacter: {
    label: 'A contacter',
    color: 'text-gray-700',
    bgColor: 'bg-gray-200',
  },
  contacte: {
    label: 'Contacte',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  rdv_planifie: {
    label: 'RDV planifie',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  devis_envoye: {
    label: 'Devis envoye',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  gagne: {
    label: 'Gagne',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  perdu: {
    label: 'Perdu',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
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
