'use server'

import { createClient } from '@/lib/supabase/server'

type SearchResult = {
  id: string
  type: 'contact' | 'company'
  name: string
  subtitle: string | null
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  const supabase = await createClient()
  const pattern = `%${query}%`

  const [{ data: contacts }, { data: companies }] = await Promise.all([
    supabase
      .from('contacts')
      .select(
        `id, first_name, last_name, status,
         company:companies!contacts_company_id_fkey(name)`
      )
      .or(`first_name.ilike.${pattern},last_name.ilike.${pattern}`)
      .limit(5),
    supabase
      .from('companies')
      .select('id, name, city, business_type')
      .or(`name.ilike.${pattern},city.ilike.${pattern}`)
      .limit(5),
  ])

  const results: SearchResult[] = []

  if (contacts) {
    for (const c of contacts as unknown as Array<{
      id: string
      first_name: string | null
      last_name: string | null
      status: string
      company: { name: string } | null
    }>) {
      results.push({
        id: c.id,
        type: 'contact',
        name: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Sans nom',
        subtitle: c.company?.name || null,
      })
    }
  }

  if (companies) {
    for (const c of companies as unknown as Array<{
      id: string
      name: string
      city: string | null
      business_type: string
    }>) {
      results.push({
        id: c.id,
        type: 'company',
        name: c.name,
        subtitle: [c.business_type, c.city].filter(Boolean).join(' · '),
      })
    }
  }

  return results
}
