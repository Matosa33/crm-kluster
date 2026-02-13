import { getCompanies } from '@/lib/actions/companies'
import { QuoteBuilder } from '@/components/quotes/quote-builder'
import { createClient } from '@/lib/supabase/server'

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; contact?: string }>
}) {
  const params = await searchParams
  const companiesData = await getCompanies()

  // Get minimal company data for the builder
  const companies = companiesData.map((c) => ({
    id: c.id,
    name: c.name,
    siret: c.siret,
    address: c.address,
    city: c.city,
    vat_number: c.vat_number,
  }))

  // Get all contacts
  const supabase = await createClient()
  const { data: contactsRaw } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, company_id')
    .order('last_name', { ascending: true })

  const contacts = (contactsRaw as unknown as { id: string; first_name: string | null; last_name: string | null; company_id: string | null }[]) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouveau devis</h1>
        <p className="text-muted-foreground mt-1">
          Construisez votre devis depuis le catalogue KLUSTER
        </p>
      </div>

      <QuoteBuilder
        companies={companies}
        contacts={contacts}
        preselectedCompanyId={params.company}
        preselectedContactId={params.contact}
      />
    </div>
  )
}
