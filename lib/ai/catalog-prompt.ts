import {
  CATALOG_CATEGORIES,
  CATALOG_SUBCATEGORIES,
  CATALOG_ITEMS,
  CATALOG_PACKS,
} from '@/lib/constants/catalog'

export function buildCatalogPrompt(): string {
  const lines: string[] = [
    '=== CATALOGUE KLUSTER (Tarifs HT — Référence négociable ±10-15%) ===',
    '',
  ]

  for (const cat of CATALOG_CATEGORIES) {
    lines.push(`## ${cat.label.toUpperCase()}`)

    const subs = CATALOG_SUBCATEGORIES.filter((s) => s.categoryId === cat.id)
    for (const sub of subs) {
      lines.push(`### ${sub.label}`)

      const items = CATALOG_ITEMS.filter((i) => i.subcategoryId === sub.id)
      for (const item of items) {
        const price = item.priceHT
          ? `${item.priceHT.toLocaleString('fr-FR')} €${item.priceUnit || ''}`
          : 'Sur devis'
        const popular = item.isPopular ? ' [POPULAIRE]' : ''
        const delay = item.delay !== '-' ? ` | Délai: ${item.delay}` : ''

        lines.push(
          `- ${item.name}: ${price} HT${delay}${popular}`
        )

        if (item.deliverables.length > 0) {
          lines.push(`  Inclus: ${item.deliverables.slice(0, 4).join(', ')}`)
        }

        if (item.note) {
          lines.push(`  Note: ${item.note}`)
        }
      }
      lines.push('')
    }
  }

  lines.push('## PACKS CLÉS EN MAIN')
  for (const pack of CATALOG_PACKS) {
    if (pack.isAgency) continue // Skip agency packs for sales context

    lines.push(
      `- ${pack.name} (${pack.priceLabel}): ${pack.includes.join(' + ')}${
        pack.savings ? ` | Économie: ${pack.savings}` : ''
      }`
    )
    lines.push(`  Idéal pour: ${pack.idealFor}`)
  }

  lines.push('')
  lines.push(
    'IMPORTANT: Les prix ci-dessus sont des RÉFÉRENCES négociables ±10-15%. ' +
    'Les prestations "Sur devis" nécessitent un appel découverte. ' +
    'Pour des prestations sur-mesure non listées, estime le prix en te basant sur les prestations similaires du catalogue. ' +
    'Propose toujours les PACKS quand pertinent (économies pour le client).'
  )

  return lines.join('\n')
}
