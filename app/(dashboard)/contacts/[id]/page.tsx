import Link from 'next/link'
import { getContact } from '@/lib/actions/contacts'
import { getContactTimeline } from '@/lib/actions/timeline'
import { StatusSelect } from '@/components/contacts/status-select'
import { ActivityForm } from '@/components/activities/activity-form'
import { ContactTimeline } from '@/components/timeline/contact-timeline'
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
  Euro,
  CalendarClock,
  Activity,
} from 'lucide-react'

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [contact, timeline] = await Promise.all([
    getContact(id),
    getContactTimeline(id),
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
        {/* Left column: Status + Timeline */}
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

          {/* Unified timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityForm contactId={id} />
              <ContactTimeline events={timeline} />
            </CardContent>
          </Card>
        </div>

        {/* Right column: Contact info */}
        <div className="space-y-6">
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
                    Assigné à{' '}
                    <Badge variant="outline">
                      {contact.assigned_user.full_name}
                    </Badge>
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Priorité :
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
              <CardTitle>Commercial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  {contact.deal_amount != null
                    ? `${contact.deal_amount.toLocaleString('fr-FR')} EUR`
                    : 'Non défini'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                {contact.next_followup_at ? (() => {
                  const followupDate = new Date(contact.next_followup_at)
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const isOverdue = followupDate < today
                  return (
                    <span className={isOverdue ? 'text-sm text-destructive font-medium' : 'text-sm'}>
                      {followupDate.toLocaleDateString('fr-FR')}
                      {isOverdue && ' - En retard'}
                    </span>
                  )
                })() : (
                  <span className="text-sm text-muted-foreground">
                    Aucune relance planifiée
                  </span>
                )}
              </div>

              {contact.status === 'perdu' && contact.lost_reason && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Raison de la perte</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {contact.lost_reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
