'use server'

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
}

export type SiretSearchResult = {
  results: SiretResult[]
  error?: string
}

// Search company by SIRET number
export async function lookupSiret(siret: string): Promise<SiretSearchResult> {
  const cleaned = siret.replace(/\s/g, '')

  if (!/^\d{14}$/.test(cleaned)) {
    return { results: [], error: 'Le SIRET doit contenir 14 chiffres' }
  }

  try {
    const res = await fetch(
      `https://api.insee.fr/entreprises/sirene/V3.11/siret/${cleaned}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.INSEE_API_TOKEN}`,
          Accept: 'application/json',
        },
      }
    )

    // Fallback to open data API if INSEE fails
    if (!res.ok) {
      return lookupSiretOpenData(cleaned)
    }

    const data = await res.json()
    const etab = data?.etablissement
    if (!etab) {
      return lookupSiretOpenData(cleaned)
    }

    const unit = etab.uniteLegale || {}
    const addr = etab.adresseEtablissement || {}

    return {
      results: [
        {
          siret: cleaned,
          siren: cleaned.slice(0, 9),
          legalName: unit.denominationUniteLegale || `${unit.prenomUsuelUniteLegale || ''} ${unit.nomUniteLegale || ''}`.trim(),
          legalForm: unit.categorieJuridiqueUniteLegale || '',
          nafCode: etab.periodesEtablissement?.[0]?.activitePrincipaleEtablissement || '',
          nafLabel: '',
          address: `${addr.numeroVoieEtablissement || ''} ${addr.typeVoieEtablissement || ''} ${addr.libelleVoieEtablissement || ''}`.trim(),
          city: addr.libelleCommuneEtablissement || '',
          postalCode: addr.codePostalEtablissement || '',
          capital: unit.capitalSocialUniteLegale || null,
        },
      ],
    }
  } catch {
    return lookupSiretOpenData(cleaned)
  }
}

// Fallback: use open data API (no auth needed)
async function lookupSiretOpenData(siret: string): Promise<SiretSearchResult> {
  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${siret}&page=1&per_page=5`
    )

    if (!res.ok) {
      return { results: [], error: 'API indisponible' }
    }

    const data = await res.json()
    const results: SiretResult[] = (data.results || []).map((r: Record<string, unknown>) => {
      const siege = r.siege as Record<string, unknown> | undefined
      return {
        siret: (siege?.siret as string) || siret,
        siren: (r.siren as string) || siret.slice(0, 9),
        legalName: (r.nom_complet as string) || '',
        legalForm: (r.nature_juridique as string) || '',
        nafCode: (r.activite_principale as string) || '',
        nafLabel: (r.libelle_activite_principale as string) || '',
        address: (siege?.adresse as string) || '',
        city: (siege?.commune as string) || '',
        postalCode: (siege?.code_postal as string) || '',
        capital: null,
      }
    })

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
    // Might be a SIREN, search by it
  }

  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(cleaned)}&page=1&per_page=5`
    )

    if (!res.ok) {
      return { results: [], error: 'API indisponible' }
    }

    const data = await res.json()
    const results: SiretResult[] = (data.results || []).map((r: Record<string, unknown>) => {
      const siege = r.siege as Record<string, unknown> | undefined
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
      }
    })

    return { results }
  } catch {
    return { results: [], error: 'Erreur de connexion à l\'API' }
  }
}
