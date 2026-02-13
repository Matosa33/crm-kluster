'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { computeGmbScore } from '@/lib/utils/gmb-score'
import type { Company } from '@/lib/types'
import type { ContactStatus } from '@/lib/types'

// Pipeline order for computing best status (higher index = more advanced)
const PIPELINE_RANK: Record<string, number> = {
  a_contacter: 0,
  contacte: 1,
  rdv_planifie: 2,
  devis_envoye: 3,
  gagne: 4,
  perdu: -1, // treated separately
}

export type CompanyWithStatus = Company & {
  bestContactStatus: ContactStatus | null
  contactCount: number
}

export async function getCompanies(filters?: {
  search?: string
  city?: string
  businessType?: string
}): Promise<CompanyWithStatus[]> {
  const supabase = await createClient()

  let query = supabase
    .from('companies')
    .select('*, contacts(status)')
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }
  if (filters?.city) {
    query = query.eq('city', filters.city)
  }
  if (filters?.businessType) {
    query = query.eq('business_type', filters.businessType)
  }

  const { data, error } = await query

  if (error) throw error

  type RawCompany = Company & { contacts: { status: string }[] }
  const rows = (data as unknown as RawCompany[]) || []

  return rows.map((row) => {
    const statuses = row.contacts?.map((c) => c.status) || []
    let best: ContactStatus | null = null

    if (statuses.length > 0) {
      // If all contacts are "perdu", result is perdu
      const allPerdu = statuses.every((s) => s === 'perdu')
      if (allPerdu) {
        best = 'perdu'
      } else {
        // Pick the most advanced non-perdu status
        let bestRank = -1
        for (const s of statuses) {
          const rank = PIPELINE_RANK[s] ?? -1
          if (rank > bestRank) {
            bestRank = rank
            best = s as ContactStatus
          }
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contacts: _contacts, ...company } = row
    return { ...company, bestContactStatus: best, contactCount: statuses.length }
  })
}

export async function getCompany(id: string): Promise<Company> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Company
}

export async function createCompany(data: {
  name: string
  business_type: string
  address?: string | null
  city: string
  postal_code?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  source_api?: 'serper' | 'serpapi' | 'manual' | null
  website_status?: 'pas_de_site' | 'site_existant' | 'inconnu'
  website_quality?: 'bonne' | 'correcte' | 'mauvaise' | 'obsolete' | null
  is_mobile_friendly?: boolean | null
  website_notes?: string | null
  description?: string | null
  social_facebook?: string | null
  social_instagram?: string | null
  social_twitter?: string | null
  social_linkedin?: string | null
  social_youtube?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('companies').insert({
    ...data,
    created_by: user?.id,
    source_api: data.source_api || 'manual',
  } as never)

  if (error) throw error
  revalidatePath('/entreprises')
}

export async function updateCompany(
  id: string,
  data: {
    name?: string
    business_type?: string
    address?: string | null
    city?: string
    postal_code?: string | null
    phone?: string | null
    email?: string | null
    website?: string | null
    website_status?: 'pas_de_site' | 'site_existant' | 'inconnu'
    website_quality?: 'bonne' | 'correcte' | 'mauvaise' | 'obsolete' | null
    is_mobile_friendly?: boolean | null
    website_notes?: string | null
    description?: string | null
    social_facebook?: string | null
    social_instagram?: string | null
    social_twitter?: string | null
    social_linkedin?: string | null
    social_youtube?: string | null
  }
) {
  const supabase = await createClient()

  // Fetch current company to merge data for GMB score recalculation
  const { data: current } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  const merged = { ...(current as unknown as Company), ...data }
  const gmb_score = computeGmbScore(merged)

  const { error } = await supabase
    .from('companies')
    .update({ ...data, gmb_score } as never)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/entreprises')
  revalidatePath(`/entreprises/${id}`)
}

export async function updateCompanySiret(
  id: string,
  data: {
    siret: string
    siren: string
    legal_name: string
    legal_form: string
    naf_code: string
    naf_label: string
    headquarters_address?: string
    // Financial data
    chiffre_affaires?: number | null
    resultat_net?: number | null
    effectif?: string | null
    date_creation_entreprise?: string | null
    categorie_entreprise?: string | null
    // Dirigeant to auto-create as contact
    dirigeant?: {
      nom: string
      prenoms: string
      qualite: string | null
    } | null
  }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Compute TVA intracommunautaire from SIREN
  const sirenNum = parseInt(data.siren)
  const vatKey = (12 + 3 * (sirenNum % 97)) % 97
  const vat_number = `FR${String(vatKey).padStart(2, '0')}${data.siren}`

  const updateData: Record<string, unknown> = {
    siret: data.siret,
    siren: data.siren,
    legal_name: data.legal_name,
    legal_form: data.legal_form,
    naf_code: data.naf_code,
    naf_label: data.naf_label,
    headquarters_address: data.headquarters_address || null,
    vat_number,
  }

  // Only include financial fields if provided (don't overwrite with null)
  if (data.chiffre_affaires != null) updateData.chiffre_affaires = data.chiffre_affaires
  if (data.resultat_net != null) updateData.resultat_net = data.resultat_net
  if (data.effectif) updateData.effectif = data.effectif
  if (data.date_creation_entreprise) updateData.date_creation_entreprise = data.date_creation_entreprise
  if (data.categorie_entreprise) updateData.categorie_entreprise = data.categorie_entreprise

  const { error } = await supabase
    .from('companies')
    .update(updateData as never)
    .eq('id', id)

  if (error) throw error

  // Auto-create contact from dirigeant if provided
  if (data.dirigeant) {
    // Check if contact already exists (same name + same company)
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('company_id', id)
      .ilike('last_name', data.dirigeant.nom)
      .limit(1)

    if (!existing || existing.length === 0) {
      await supabase.from('contacts').insert({
        company_id: id,
        first_name: data.dirigeant.prenoms,
        last_name: data.dirigeant.nom,
        position: data.dirigeant.qualite || 'Dirigeant',
        status: 'a_contacter',
        priority: 'moyenne',
        source: 'siret_api',
        created_by: user?.id,
      } as never)
    }
  }

  // Recalculate GMB score with updated data
  const { data: updated } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (updated) {
    const gmb_score = computeGmbScore(updated as unknown as Company)
    await supabase
      .from('companies')
      .update({ gmb_score } as never)
      .eq('id', id)
  }

  revalidatePath('/entreprises')
  revalidatePath(`/entreprises/${id}`)
  revalidatePath('/contacts')
}

export async function deleteCompany(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('companies').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/entreprises')
}
