'use client'

import { useRouter } from 'next/navigation'
import { completeActivity, deleteActivity } from '@/lib/actions/activities'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, Calendar, FileText, Check, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Activity, Profile } from '@/lib/types'

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

type ActivityRow = Activity & {
  user: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

interface ActivityListProps {
  activities: ActivityRow[]
  contactId: string
}

export function ActivityList({ activities, contactId }: ActivityListProps) {
  const router = useRouter()

  async function handleComplete(id: string) {
    await completeActivity(id, contactId)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette activite ?')) return
    await deleteActivity(id, contactId)
    router.refresh()
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Aucune activite enregistree
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type]
        const isCompleted = !!activity.completed_at

        return (
          <div
            key={activity.id}
            className={`flex gap-3 p-3 rounded-lg border ${isCompleted ? 'bg-muted/30 opacity-75' : 'bg-card'}`}
          >
            <div className="p-2 rounded-full bg-muted h-fit">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {activityLabels[activity.type]}
                </Badge>
                {isCompleted && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    Termine
                  </Badge>
                )}
              </div>
              <p className="font-medium text-sm mt-1">{activity.subject}</p>
              {activity.description && (
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {activity.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>
                  {activity.user?.full_name} -{' '}
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
                {activity.scheduled_at && (
                  <span>
                    | Prevu le{' '}
                    {new Date(activity.scheduled_at).toLocaleDateString(
                      'fr-FR',
                      {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {!isCompleted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Marquer comme termine"
                  onClick={() => handleComplete(activity.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                title="Supprimer"
                onClick={() => handleDelete(activity.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
