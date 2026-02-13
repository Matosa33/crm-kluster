import Link from 'next/link'
import { ContactForm } from '@/components/contacts/contact-form'
import { getCompanies } from '@/lib/actions/companies'
import { getAllUsers } from '@/lib/actions/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>
}) {
  const { company: defaultCompanyId } = await searchParams
  const [companies, users] = await Promise.all([
    getCompanies(),
    getAllUsers(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contacts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouveau contact</h1>
          <p className="text-muted-foreground mt-1">
            Ajouter un contact manuellement
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du contact</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm
            companies={companies}
            users={users}
            defaultCompanyId={defaultCompanyId}
          />
        </CardContent>
      </Card>
    </div>
  )
}
