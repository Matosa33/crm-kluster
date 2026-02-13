import {
  Phone, Mail, Calendar, FileText,
  ArrowRight, Plus, Clock, MapPin, CheckCircle2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { STATUS_CONFIG } from '@/lib/constants/status-config'
import type { TimelineEvent as TimelineEventType } from '@/lib/actions/timeline'
import type { ContactStatus } from '@/lib/types'

const ACTIVITY_STYLES = {
  appel: { icon: Phone, color: 'bg-blue-500/20 text-blue-400 ring-blue-500/30' },
  email: { icon: Mail, color: 'bg-slate-500/20 text-slate-400 ring-slate-500/30' },
  rdv: { icon: Calendar, color: 'bg-amber-500/20 text-amber-400 ring-amber-500/30' },
  note: { icon: FileText, color: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30' },
}

interface TimelineEventProps {
  event: TimelineEventType
}

export function TimelineEvent({ event }: TimelineEventProps) {
  const timeAgo = formatDistanceToNow(new Date(event.date), {
    addSuffix: true,
    locale: fr,
  })

  // Activity event
  if (event.type === 'activity' && event.activityType) {
    const style = ACTIVITY_STYLES[event.activityType]
    const Icon = style.icon
    const labels = { appel: 'Appel', email: 'Email', rdv: 'RDV', note: 'Note' }

    return (
      <div className="relative flex gap-3 pl-0">
        <div
          className={`relative z-10 flex items-center justify-center w-[30px] h-[30px] rounded-full ring-2 shrink-0 ${style.color}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{event.subject}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-muted-foreground">
              {labels[event.activityType]}
            </span>
            {event.completed_at && (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </div>

          {event.description && (
            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
              {event.description}
            </p>
          )}

          {/* Meeting details */}
          {(event.duration_minutes || event.location) && (
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              {event.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.duration_minutes} min
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
            </div>
          )}

          {/* Meeting notes */}
          {event.meeting_notes && (
            <div className="mt-2 p-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-xs text-muted-foreground whitespace-pre-wrap">
              {event.meeting_notes}
            </div>
          )}

          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
            {event.userName && <span>{event.userName}</span>}
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    )
  }

  // Status change event
  if (event.type === 'status_change') {
    const oldConfig = event.oldStatus
      ? STATUS_CONFIG[event.oldStatus as ContactStatus]
      : null
    const newConfig = event.newStatus
      ? STATUS_CONFIG[event.newStatus as ContactStatus]
      : null

    return (
      <div className="relative flex gap-3 pl-0">
        <div className="relative z-10 flex items-center justify-center w-[30px] h-[30px] rounded-full ring-2 bg-violet-500/20 text-violet-400 ring-violet-500/30 shrink-0">
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="text-muted-foreground">Statut changé</span>
            {oldConfig && (
              <span className={`text-xs font-medium ${oldConfig.color}`}>
                {oldConfig.label}
              </span>
            )}
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            {newConfig && (
              <span className={`text-xs font-medium ${newConfig.color}`}>
                {newConfig.label}
              </span>
            )}
          </div>
          {event.note && (
            <p className="text-xs text-muted-foreground mt-1">{event.note}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
            {event.userName && <span>{event.userName}</span>}
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    )
  }

  // Creation event
  if (event.type === 'creation') {
    return (
      <div className="relative flex gap-3 pl-0">
        <div className="relative z-10 flex items-center justify-center w-[30px] h-[30px] rounded-full ring-2 bg-primary/20 text-primary ring-primary/30 shrink-0">
          <Plus className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <span className="text-sm text-muted-foreground">Contact créé</span>
          <div className="text-[10px] text-muted-foreground mt-1">
            {timeAgo}
          </div>
        </div>
      </div>
    )
  }

  return null
}
