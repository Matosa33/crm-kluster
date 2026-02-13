'use server'

export type Dirigeant = {
  nom: string
  prenoms: string
  qualite: string | null
  type_dirigeant: string // "personne physique" | "personne morale"
}

export type SiretResult = {
  siret: string
  siren: string
  legalName: string
  legalForm: string
  nafCode: string
  nafLabel: string
  address: string
  city: string
  postalCode: string
  capital: string | null
  // Dirigeants
  dirigeants: Dirigeant[]
  // Données financières
  chiffreAffaires: number | null
  resultatNet: number | null
  effectif: string | null
  dateCreation: string | null
  categorieEntreprise: string | null
}

export type SiretSearchResult = {
  results: SiretResult[]
  error?: string
}

// Mapping INSEE employee bracket codes to readable labels
const EFFECTIF_LABELS: Record<string, string> = {
  'NN': 'Non renseigné',
  '00': '0 salarié',
  '01': '1-2 salariés',
  '02': '3-5 salariés',
  '03': '6-9 salariés',
  '11': '10-19 salariés',
  '12': '20-49 salariés',
  '21': '50-99 salariés',
  '22': '100-199 salariés',
  '31': '200-249 salariés',
  '32': '250-499 salariés',
  '41': '500-999 salariés',
  '42': '1000-1999 salariés',
  '51': '2000-4999 salariés',
  '52': '5000-9999 salariés',
  '53': '10000+ salariés',
}

function parseOpenDataResult(r: Record<string, unknown>): SiretResult {
  const siege = r.siege as Record<string, unknown> | undefined
  const finances = r.finances as Record<string, unknown> | null
  const dirigeantsRaw = r.dirigeants as Record<string, unknown>[] | undefined

  // Parse dirigeants (only physical persons)
  const dirigeants: Dirigeant[] = (dirigeantsRaw || [])
    .filter((d) => d.type_dirigeant === 'personne physique')
    .map((d) => ({
      nom: (d.nom as string) || '',
      prenoms: (d.prenoms as string) || '',
      qualite: (d.qualite as string) || null,
      type_dirigeant: (d.type_dirigeant as string) || 'personne physique',
    }))

  // Parse effectif code
  const effectifCode = (r.tranche_effectif_salarie as string) || ''
  const effectif = EFFECTIF_LABELS[effectifCode] || (effectifCode && effectifCode !== 'NN' ? effectifCode : null)

  return {
    siret: (siege?.siret as string) || '',
    siren: (r.siren as string) || '',
    legalName: (r.nom_complet as string) || '',
    legalForm: (r.nature_juridique as string) || '',
    nafCode: (r.activite_principale as string) || '',
    nafLabel: (r.libelle_activite_principale as string) || '',
    address: (siege?.adresse as string) || '',
    city: (siege?.commune as string) || '',
    postalCode: (siege?.code_postal as string) || '',
    capital: null,
    dirigeants,
    chiffreAffaires: finances?.ca != null ? Number(finances.ca) : null,
    resultatNet: finances?.resultat_net != null ? Number(finances.resultat_net) : null,
    effectif,
    dateCreation: (r.date_creation as string) || null,
    categorieEntreprise: (r.categorie_entreprise as string) || null,
  }
}

// Search company by SIRET number
export async function lookupSiret(siret: string): Promise<SiretSearchResult> {
  const cleaned = siret.replace(/\s/g, '')

  if (!/^\d{14}$/.test(cleaned)) {
    return { results: [], error: 'Le SIRET doit contenir 14 chiffres' }
  }

  // Always use the open data API - it has dirigeants + finances
  return lookupSiretOpenData(cleaned)
}

// Open data API (no auth needed, has dirigeants + finances)
async function lookupSiretOpenData(siret: string): Promise<SiretSearchResult> {
  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${siret}&page=1&per_page=5`
    )

    if (!res.ok) {
      return { results: [], error: 'API indisponible' }
    }

    const data = await res.json()
    const results: SiretResult[] = (data.results || []).map(
      (r: Record<string, unknown>) => parseOpenDataResult(r)
    )

    if (results.length === 0) {
      return { results: [], error: 'Aucun établissement trouvé pour ce SIRET' }
    }

    return { results }
  } catch {
    return { results: [], error: 'Erreur de connexion à l\'API' }
  }
}

// Search company by name (for autocomplete)
export async function searchCompanyBySiretOrName(query: string): Promise<SiretSearchResult> {
  const cleaned = query.trim()
  if (cleaned.length < 2) {
    return { results: [] }
  }

  // If it looks like a SIRET/SIREN number, use direct lookup
  const digitsOnly = cleaned.replace(/\s/g, '')
  if (/^\d{9,14}$/.test(digitsOnly)) {
    if (digitsOnly.length === 14) {
      return lookupSiret(digitsOnly)
    }
  }

  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(cleaned)}&page=1&per_page=5`
    )

    if (!res.ok) {
      return { results: [], error: 'API indisponible' }
    }

    const data = await res.json()
    const results: SiretResult[] = (data.results || []).map(
      (r: Record<string, unknown>) => parseOpenDataResult(r)
    )

    return { results }
  } catch {
    return { results: [], error: 'Erreur de connexion à l\'API' }
  }
}
