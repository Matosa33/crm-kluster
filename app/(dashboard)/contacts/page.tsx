import Link from 'next/link'
import { Suspense } from 'react'
import { getContacts, getContactsForKanban } from '@/lib/actions/contacts'
import { getCompanies } from '@/lib/actions/companies'
import { getAllUsers } from '@/lib/actions/auth'
import { ContactList } from '@/components/contacts/contact-list'
import { ContactFilters } from '@/components/contacts/contact-filters'
import { SearchBar } from '@/components/shared/search-bar'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { ViewToggle } from '@/components/kanban/view-toggle'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { ContactStatus } from '@/lib/types'

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    assignedTo?: string
    view?: string
  }>
}) {
  const params = await searchParams
  const view = params.view || 'kanban'

  if (view === 'kanban') {
    const [kanbanContacts, companies] = await Promise.all([
      getContactsForKanban(),
      getCompanies(),
    ])

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Pipeline</h1>
            <Suspense>
              <ViewToggle />
            </Suspense>
          </div>
          <Button asChild>
            <Link href="/contacts/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau contact
            </Link>
          </Button>
        </div>

        <KanbanBoard
          contacts={kanbanContacts}
          companies={companies.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>
    )
  }

  // Table view
  const [contacts, users] = await Promise.all([
    getContacts({
      search: params.search,
      status: params.status as ContactStatus | undefined,
      assignedTo: params.assignedTo,
    }),
    getAllUsers(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p className="text-muted-foreground mt-1">
              {contacts.length} contact{contacts.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Suspense>
            <ViewToggle />
          </Suspense>
        </div>
        <Button asChild>
          <Link href="/contacts/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau contact
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Suspense>
          <SearchBar placeholder="Rechercher un contact..." />
        </Suspense>
        <Suspense>
          <ContactFilters users={users} />
        </Suspense>
      </div>

      <ContactList contacts={contacts} />
    </div>
  )
}
