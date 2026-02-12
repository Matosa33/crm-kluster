import Link from 'next/link'
import { getContact, getStatusChanges } from '@/lib/actions/contacts'
import { getActivities } from '@/lib/actions/activities'
import { StatusSelect } from '@/components/contacts/status-select'
import { StatusBadge } from '@/components/contacts/status-badge'
import { ActivityForm } from '@/components/activities/activity-form'
import { ActivityList } from '@/components/activities/activity-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Mail,
  Phone,
  Pencil,
  ArrowLeft,
  User,
  Clock,
  Activity,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [contact, statusChanges, activities] = await Promise.all([
    getContact(id),
    getStatusChanges(id),
    getActivities(id),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contacts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {contact.first_name || ''} {contact.last_name || ''}
          </h1>
          {contact.position && (
            <p className="text-muted-foreground mt-1">{contact.position}</p>
          )}
        </div>
        <Button asChild>
          <Link href={`/contacts/${id}/modifier`}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusSelect
                contactId={contact.id}
                currentStatus={contact.status}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <Link
                    href={`/entreprises/${contact.company.id}`}
                    className="hover:underline"
                  >
                    {contact.company.name}
                  </Link>
                </div>
              )}

              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              )}

              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={`tel:${contact.phone}`}
                    className="hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}

              {contact.assigned_user && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    Assigne a{' '}
                    <Badge variant="outline">
                      {contact.assigned_user.full_name}
                    </Badge>
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Priorite :
                </span>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {contact.notes || 'Aucune note'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityForm contactId={id} />
              <ActivityList activities={activities} contactId={id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historique des statuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusChanges.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun changement de statut
                </p>
              ) : (
                <div className="space-y-4">
                  {statusChanges.map((change) => (
                    <div key={change.id} className="border-l-2 border-border pl-4 pb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {change.old_status && (
                          <>
                            <StatusBadge status={change.old_status} />
                            <span className="text-xs">→</span>
                          </>
                        )}
                        <StatusBadge status={change.new_status} />
                      </div>
                      {change.note && (
                        <p className="text-sm mt-1">{change.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {change.user?.full_name} -{' '}
                        {formatDistanceToNow(new Date(change.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
