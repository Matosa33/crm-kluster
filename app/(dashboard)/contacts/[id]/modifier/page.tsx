import { getContact } from '@/lib/actions/contacts'
import { getCompanies } from '@/lib/actions/companies'
import { getAllUsers } from '@/lib/actions/auth'
import { ContactForm } from '@/components/contacts/contact-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [contact, companies, users] = await Promise.all([
    getContact(id),
    getCompanies(),
    getAllUsers(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier le contact</h1>
        <p className="text-muted-foreground mt-1">
          {contact.first_name} {contact.last_name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du contact</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm
            contact={contact}
            companies={companies}
            users={users}
          />
        </CardContent>
      </Card>
    </div>
  )
}
