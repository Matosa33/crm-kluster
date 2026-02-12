'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteContact } from '@/lib/actions/contacts'
import { StatusBadge } from './status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Contact, Company, Profile } from '@/lib/types'

type ContactRow = Contact & {
  company: Pick<Company, 'id' | 'name' | 'city' | 'business_type'> | null
  assigned_user: Pick<Profile, 'id' | 'full_name'> | null
}

interface ContactListProps {
  contacts: ContactRow[]
}

export function ContactList({ contacts }: ContactListProps) {
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce contact ?')) return
    await deleteContact(id)
    router.refresh()
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun contact trouve</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Entreprise</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="hidden md:table-cell">Assigne a</TableHead>
            <TableHead className="hidden lg:table-cell">Priorite</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <Link
                  href={`/contacts/${contact.id}`}
                  className="font-medium hover:underline"
                >
                  {contact.first_name || ''} {contact.last_name || ''}
                </Link>
                {contact.email && (
                  <p className="text-xs text-muted-foreground">
                    {contact.email}
                  </p>
                )}
              </TableCell>
              <TableCell>
                {contact.company ? (
                  <Link
                    href={`/entreprises/${contact.company.id}`}
                    className="hover:underline text-sm"
                  >
                    {contact.company.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={contact.status} />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {contact.assigned_user ? (
                  <Badge variant="outline">
                    {contact.assigned_user.full_name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Non assigne
                  </span>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge
                  variant={
                    contact.priority === 'haute'
                      ? 'destructive'
                      : contact.priority === 'moyenne'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {contact.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/contacts/${contact.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/contacts/${contact.id}/modifier`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
