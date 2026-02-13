import { buildCatalogPrompt } from './catalog-prompt'
import type { CopilotContext } from './types'
import type { AiTone } from '@/lib/types'

const TONE_INSTRUCTIONS: Record<AiTone, string> = {
  professionnel:
    'Adopte un ton professionnel mais chaleureux. Tutoie le commercial, vouvoie le prospect dans les emails.',
  decontracte:
    'Adopte un ton décontracté et direct. Utilise un langage simple, concret et punchy.',
  technique:
    'Adopte un ton technique et précis. Utilise le vocabulaire web/SEO, donne des détails techniques.',
}

function formatContext(ctx: CopilotContext): string {
  const parts: string[] = []

  if (ctx.company) {
    const c = ctx.company
    parts.push('=== FICHE ENTREPRISE ===')
    parts.push(`Nom: ${c.name}`)
    parts.push(`Secteur: ${c.business_type}`)
    parts.push(`Ville: ${c.city}`)
    if (c.phone) parts.push(`Tél: ${c.phone}`)
    if (c.email) parts.push(`Email: ${c.email}`)

    // Website analysis
    if (c.website) {
      parts.push(`Site web: ${c.website}`)
      if (c.website_status) parts.push(`Statut site: ${c.website_status}`)
      if (c.website_quality) parts.push(`Qualité site: ${c.website_quality}`)
    } else {
      parts.push('Site web: AUCUN — opportunité majeure !')
    }

    // GMB / Reviews
    if (c.rating != null) {
      parts.push(`Avis Google: ${c.rating}/5 (${c.review_count} avis)`)
    }
    if (c.gmb_score != null) {
      parts.push(`Score GMB: ${c.gmb_score}%`)
    }

    // Legal info
    if (c.legal_name) parts.push(`Raison sociale: ${c.legal_name}`)
    if (c.legal_form) parts.push(`Forme juridique: ${c.legal_form}`)
    if (c.naf_label) parts.push(`Activité NAF: ${c.naf_label}`)
    if (c.siret) parts.push(`SIRET: ${c.siret}`)

    // Financial info (rarely available)
    if (c.chiffre_affaires != null) {
      parts.push(`CA: ${c.chiffre_affaires.toLocaleString('fr-FR')} €`)
    }
    if (c.resultat_net != null) {
      parts.push(`Résultat net: ${c.resultat_net.toLocaleString('fr-FR')} €`)
    }
    if (c.effectif) parts.push(`Effectif: ${c.effectif}`)
    if (c.categorie_entreprise) parts.push(`Catégorie: ${c.categorie_entreprise}`)
    if (c.date_creation_entreprise) {
      parts.push(`Création: ${new Date(c.date_creation_entreprise).toLocaleDateString('fr-FR')}`)
    }

    // Social
    const socials: string[] = []
    if (c.social_facebook) socials.push('Facebook')
    if (c.social_instagram) socials.push('Instagram')
    if (socials.length > 0) {
      parts.push(`Réseaux sociaux: ${socials.join(', ')}`)
    } else {
      parts.push('Réseaux sociaux: aucun détecté')
    }

    if (c.description) parts.push(`Description: ${c.description}`)
    parts.push('')
  }

  if (ctx.contact) {
    const co = ctx.contact
    parts.push('=== FICHE CONTACT ===')
    const name = [co.first_name, co.last_name].filter(Boolean).join(' ')
    if (name) parts.push(`Nom: ${name}`)
    if (co.position) parts.push(`Poste: ${co.position}`)
    if (co.phone) parts.push(`Tél: ${co.phone}`)
    if (co.email) parts.push(`Email: ${co.email}`)
    parts.push(`Statut pipeline: ${co.status}`)
    parts.push(`Priorité: ${co.priority}`)
    if (co.deal_amount) parts.push(`Montant deal: ${co.deal_amount.toLocaleString('fr-FR')} €`)
    if (co.source) parts.push(`Source: ${co.source}`)
    if (co.next_followup_at) {
      parts.push(`Prochain suivi: ${new Date(co.next_followup_at).toLocaleDateString('fr-FR')}`)
    }
    if (co.notes) parts.push(`Notes: ${co.notes}`)
    parts.push('')
  }

  if (ctx.timeline && ctx.timeline.length > 0) {
    parts.push('=== HISTORIQUE RÉCENT (dernières interactions) ===')
    const recent = ctx.timeline.slice(0, 10)
    for (const ev of recent) {
      const date = new Date(ev.date).toLocaleDateString('fr-FR')
      if (ev.type === 'activity') {
        parts.push(`[${date}] ${ev.activityType?.toUpperCase()}: ${ev.subject}${ev.description ? ` — ${ev.description}` : ''}`)
      } else if (ev.type === 'status_change') {
        parts.push(`[${date}] Changement statut: ${ev.oldStatus} → ${ev.newStatus}`)
      } else {
        parts.push(`[${date}] Création du contact`)
      }
    }
    parts.push('')
  }

  if (ctx.quotes && ctx.quotes.length > 0) {
    parts.push('=== DEVIS EXISTANTS ===')
    for (const q of ctx.quotes) {
      const date = q.issued_at ? new Date(q.issued_at).toLocaleDateString('fr-FR') : 'brouillon'
      parts.push(`- ${q.reference} (${q.status}) — ${q.total_ht.toLocaleString('fr-FR')} € HT / ${q.total_ttc.toLocaleString('fr-FR')} € TTC — ${date}`)
    }
    parts.push('')
  }

  return parts.join('\n')
}

export function buildSystemPrompt(
  ctx: CopilotContext,
  tone: AiTone = 'professionnel',
  customInstructions?: string | null
): string {
  const sections: string[] = []

  // 1. Role & rules
  sections.push(`Tu es l'assistant commercial de KLUSTER, une agence web spécialisée dans la création de sites et le SEO pour les TPE/PME françaises.

RÈGLES FONDAMENTALES :
- Tu réponds TOUJOURS en français
- Tu es concis et actionnable — le commercial est souvent au téléphone
- Tu utilises les VRAIS prix du catalogue ci-dessous
- Les prix sont des références négociables ±10-15% selon le contexte
- Pour des prestations custom non listées, estime un prix en te basant sur des prestations similaires
- Propose les PACKS quand c'est pertinent (économies client)
- Pas de site web = opportunité MAJEURE, insiste dessus
- Site de mauvaise qualité = opportunité de refonte
- Le CA est RAREMENT connu, déduis le potentiel du contexte (secteur, ville, taille, forme juridique)
- Quand tu recommandes un devis, donne les prix unitaires ET le total
- ${TONE_INSTRUCTIONS[tone]}`)

  // 2. Catalog
  sections.push(buildCatalogPrompt())

  // 3. Prospect context
  const contextStr = formatContext(ctx)
  if (contextStr.trim()) {
    sections.push(contextStr)
  }

  // 4. Custom instructions
  if (customInstructions?.trim()) {
    sections.push(`=== INSTRUCTIONS PERSONNALISÉES ===\n${customInstructions}`)
  }

  return sections.join('\n\n')
}
