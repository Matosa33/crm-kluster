import Link from 'next/link'
import { Suspense } from 'react'
import { getCompanies } from '@/lib/actions/companies'
import { CompanyList } from '@/components/companies/company-list'
import { SearchBar } from '@/components/shared/search-bar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; city?: string; type?: string }>
}) {
  const params = await searchParams
  const companies = await getCompanies({
    search: params.search,
    city: params.city,
    businessType: params.type,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entreprises</h1>
          <p className="text-muted-foreground mt-1">
            {companies.length} entreprise{companies.length > 1 ? 's' : ''} au
            total
          </p>
        </div>
        <Button asChild>
          <Link href="/entreprises/nouvelle">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle entreprise
          </Link>
        </Button>
      </div>

      <Suspense>
        <SearchBar placeholder="Rechercher une entreprise..." />
      </Suspense>

      <CompanyList companies={companies} />
    </div>
  )
}
