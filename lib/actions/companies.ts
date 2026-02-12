'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Company } from '@/lib/types'

export async function getCompanies(filters?: {
  search?: string
  city?: string
  businessType?: string
}): Promise<Company[]> {
  const supabase = await createClient()

  let query = supabase
    .from('companies')
    .select('*')
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
  return (data as Company[]) || []
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
