import { ContactForm } from '@/components/contacts/contact-form'
import { getCompanies } from '@/lib/actions/companies'
import { getAllUsers } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewContactPage() {
  const [companies, users] = await Promise.all([
    getCompanies(),
    getAllUsers(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouveau contact</h1>
        <p className="text-muted-foreground mt-1">
          Ajouter un contact manuellement
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du contact</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm companies={companies} users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
