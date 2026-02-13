'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteCompany } from '@/lib/actions/companies'
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
import { MoreHorizontal, Eye, Pencil, Trash2, Globe, Phone } from 'lucide-react'
import type { CompanyWithStatus } from '@/lib/actions/companies'
import type { ContactStatus } from '@/lib/types'
import { WEBSITE_STATUS_CONFIG } from '@/lib/constants/website-config'
import { STATUS_CONFIG } from '@/lib/constants/status-config'

interface CompanyListProps {
  companies: CompanyWithStatus[]
}

export function CompanyList({ companies }: CompanyListProps) {
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette entreprise ?')) return
    await deleteCompany(id)
    router.refresh()
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucune entreprise trouvée</p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead>Nom</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Ville</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="hidden sm:table-cell">Site</TableHead>
            <TableHead className="hidden md:table-cell">Téléphone</TableHead>
            <TableHead className="hidden lg:table-cell">Site web</TableHead>
            <TableHead className="hidden lg:table-cell">Source</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id} className="border-white/[0.04] hover:bg-white/[0.03]">
              <TableCell>
                <Link
                  href={`/entreprises/${company.id}`}
                  className="font-medium hover:underline"
                >
                  {company.name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{company.business_type}</Badge>
              </TableCell>
              <TableCell>{company.city}</TableCell>
              <TableCell>
                {company.bestContactStatus ? (() => {
                  const config = STATUS_CONFIG[company.bestContactStatus as ContactStatus]
                  return (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}
                    >
                      {config.label}
                    </span>
                  )
                })() : (
                  <span className="text-xs text-muted-foreground/50">—</span>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {(() => {
                  const status = company.website_status || 'inconnu'
                  const config = WEBSITE_STATUS_CONFIG[status]
                  return (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.color} ${config.bgColor}`}
                    >
                      {config.label}
                    </span>
                  )
                })()}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {company.phone ? (
                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-center gap-1 text-sm hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    {company.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm hover:underline"
                  >
                    <Globe className="h-3 w-3" />
                    Voir
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant="outline">{company.source_api || 'manual'}</Badge>
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
                      <Link href={`/entreprises/${company.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/entreprises/${company.id}/modifier`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(company.id)}
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
