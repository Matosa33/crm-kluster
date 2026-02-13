'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
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
  }
) {
  const supabase = await createClient()

  const { error } = await supabase.from('companies').update(data as never).eq('id', id)

  if (error) throw error
  revalidatePath('/entreprises')
  revalidatePath(`/entreprises/${id}`)
}

export async function deleteCompany(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('companies').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/entreprises')
}
