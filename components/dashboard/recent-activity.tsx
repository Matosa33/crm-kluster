import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, Calendar, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

const activityIcons = {
  appel: Phone,
  email: Mail,
  rdv: Calendar,
  note: FileText,
}

const activityLabels = {
  appel: 'Appel',
  email: 'Email',
  rdv: 'RDV',
  note: 'Note',
}

interface RecentActivityProps {
  activities: Array<{
    id: string
    type: 'appel' | 'email' | 'rdv' | 'note'
    subject: string
    created_at: string
    user: { id: string; full_name: string } | null
    contact: { id: string; first_name: string | null; last_name: string | null } | null
  }>
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activite recente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune activite recente
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type]
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activityLabels[activity.type]}
                      {activity.contact &&
                        ` - ${activity.contact.first_name || ''} ${activity.contact.last_name || ''}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
