import { CompanyForm } from '@/components/companies/company-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewCompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouvelle entreprise</h1>
        <p className="text-muted-foreground mt-1">
          Ajouter une entreprise manuellement
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyForm />
        </CardContent>
      </Card>
    </div>
  )
}
