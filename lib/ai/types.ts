import type { Company, Contact, Quote } from '@/lib/types'
import type { TimelineEvent } from '@/lib/actions/timeline'
import { Phone, FileText, MessageSquare, Mail, UserCheck } from 'lucide-react'

export type CopilotContextType = 'contact' | 'company'

export type CopilotContext = {
  type: CopilotContextType
  contact?: Pick<
    Contact,
    | 'id'
    | 'first_name'
    | 'last_name'
    | 'phone'
    | 'email'
    | 'position'
    | 'status'
    | 'priority'
    | 'source'
    | 'notes'
    | 'deal_amount'
    | 'next_followup_at'
  > | null
  company?: Pick<
    Company,
    | 'id'
    | 'name'
    | 'business_type'
    | 'city'
    | 'phone'
    | 'email'
    | 'website'
    | 'website_status'
    | 'website_quality'
    | 'rating'
    | 'review_count'
    | 'gmb_score'
    | 'siret'
    | 'legal_name'
    | 'legal_form'
    | 'naf_label'
    | 'chiffre_affaires'
    | 'resultat_net'
    | 'effectif'
    | 'categorie_entreprise'
    | 'date_creation_entreprise'
    | 'description'
    | 'social_facebook'
    | 'social_instagram'
  > | null
  timeline?: TimelineEvent[]
  quotes?: Pick<Quote, 'id' | 'reference' | 'status' | 'total_ht' | 'total_ttc' | 'issued_at'>[]
}

export type QuickAction = {
  id: string
  label: string
  prompt: string
  icon: typeof Phone
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'prepare-call',
    label: 'Préparer l\'appel',
    prompt:
      'Prépare-moi un briefing rapide pour appeler ce prospect. Résume ce qu\'on sait, les points clés à aborder, et propose une accroche d\'ouverture.',
    icon: Phone,
  },
  {
    id: 'recommend-quote',
    label: 'Recommander un devis',
    prompt:
      'En fonction du profil de ce prospect (secteur, taille, besoins potentiels), recommande les prestations les plus pertinentes du catalogue avec les prix. Propose un devis type.',
    icon: FileText,
  },
  {
    id: 'handle-objection',
    label: 'Répondre à une objection',
    prompt:
      'Quelles sont les objections les plus probables de ce type de prospect et comment y répondre ? Donne-moi des arguments concrets avec les prix du catalogue.',
    icon: MessageSquare,
  },
  {
    id: 'draft-email',
    label: 'Rédiger un email',
    prompt:
      'Rédige un email de suivi professionnel pour ce prospect. Adapte le ton au contexte et propose une prochaine étape concrète.',
    icon: Mail,
  },
  {
    id: 'qualify-lead',
    label: 'Qualifier le lead',
    prompt:
      'Analyse ce prospect et donne-moi un score de qualification. Quels sont les signaux positifs et négatifs ? Quelle priorité lui donner et pourquoi ?',
    icon: UserCheck,
  },
]
