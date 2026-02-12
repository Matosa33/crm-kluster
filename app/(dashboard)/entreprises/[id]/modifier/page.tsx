import { getCompany } from '@/lib/actions/companies'
import { CompanyForm } from '@/components/companies/company-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const company = await getCompany(id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier l&apos;entreprise</h1>
        <p className="text-muted-foreground mt-1">{company.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm company={company} />
        </CardContent>
      </Card>
    </div>
  )
}
