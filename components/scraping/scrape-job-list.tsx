import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react'
import type { ScrapeJob, Profile } from '@/lib/types'

type ScrapeJobRow = ScrapeJob & {
  created_by_user: Pick<Profile, 'id' | 'full_name'> | null
}

interface ScrapeJobListProps {
  jobs: ScrapeJobRow[]
}

const statusConfig = {
  pending: {
    label: 'En attente',
    icon: Clock,
    variant: 'secondary' as const,
  },
  running: {
    label: 'En cours',
    icon: Loader2,
    variant: 'default' as const,
  },
  completed: {
    label: 'Terminé',
    icon: CheckCircle,
    variant: 'default' as const,
  },
  failed: {
    label: 'Échoué',
    icon: XCircle,
    variant: 'destructive' as const,
  },
}

export function ScrapeJobList({ jobs }: ScrapeJobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune recherche effectuée</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead>Recherche</TableHead>
            <TableHead>Ville</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Résultats</TableHead>
            <TableHead className="hidden md:table-cell">API</TableHead>
            <TableHead className="hidden md:table-cell">Créé par</TableHead>
            <TableHead className="hidden lg:table-cell">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const config = statusConfig[job.status]
            const StatusIcon = config.icon
            return (
              <TableRow key={job.id} className="border-white/[0.04] hover:bg-white/[0.03]">
                <TableCell className="font-medium">{job.query}</TableCell>
                <TableCell>{job.city}</TableCell>
                <TableCell>
                  <Badge variant={config.variant} className="gap-1">
                    <StatusIcon
                      className={`h-3 w-3 ${job.status === 'running' ? 'animate-spin' : ''}`}
                    />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {job.status === 'completed' ? job.results_count : '-'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {job.api_used ? (
                    <Badge variant="outline">{job.api_used}</Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {job.created_by_user?.full_name || '-'}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {new Date(job.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
