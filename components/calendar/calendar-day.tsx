'use client'

import type { CalendarActivity } from '@/lib/types'
import { CalendarEventChip } from './calendar-event-chip'
import { Phone, Mail, Calendar, FileText, MapPin, Clock } from 'lucide-react'

interface CalendarDayProps {
  currentDate: Date
  activities: CalendarActivity[]
  onEventClick: (event: CalendarActivity) => void
  onSlotClick: (date: Date, hour: number) => void
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)

const TYPE_CONFIG = {
  appel: { icon: Phone, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  email: { icon: Mail, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  rdv: { icon: Calendar, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  note: { icon: FileText, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
}

export function CalendarDay({
  currentDate,
  activities,
  onEventClick,
  onSlotClick,
}: CalendarDayProps) {
  const dayActivities = activities.filter((a) => {
    const d = new Date(a.scheduled_at)
    return (
      d.getDate() === currentDate.getDate() &&
      d.getMonth() === currentDate.getMonth() &&
      d.getFullYear() === currentDate.getFullYear()
    )
  })

  function getActivitiesForHour(hour: number) {
    return dayActivities.filter((a) => new Date(a.scheduled_at).getHours() === hour)
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Summary bar */}
      {dayActivities.length > 0 && (
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {dayActivities.length} événement{dayActivities.length > 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            {(['rdv', 'appel', 'email', 'note'] as const).map((type) => {
              const count = dayActivities.filter((a) => a.type === type).length
              if (!count) return null
              const config = TYPE_CONFIG[type]
              const Icon = config.icon
              return (
                <span key={type} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  {count}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Time slots */}
      <div className="max-h-[600px] overflow-y-auto">
        {HOURS.map((hour) => {
          const hourActivities = getActivitiesForHour(hour)
          const now = new Date()
          const isCurrentHour =
            now.getHours() === hour &&
            now.getDate() === currentDate.getDate() &&
            now.getMonth() === currentDate.getMonth()

          return (
            <div
              key={hour}
              className={`grid grid-cols-[60px_1fr] border-b border-white/[0.04] ${
                isCurrentHour ? 'bg-primary/[0.04]' : ''
              }`}
            >
              <div className="py-3 px-3 text-xs text-muted-foreground text-right">
                {hour}:00
              </div>
              <button
                onClick={() => onSlotClick(currentDate, hour)}
                className="min-h-[60px] p-2 border-l border-white/[0.04] hover:bg-white/[0.03] transition-colors text-left"
              >
                {hourActivities.map((a) => {
                  const config = TYPE_CONFIG[a.type]
                  const Icon = config.icon
                  const contactName = a.contact
                    ? [a.contact.first_name, a.contact.last_name].filter(Boolean).join(' ')
                    : ''
                  const time = new Date(a.scheduled_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <div
                      key={a.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(a)
                      }}
                      className={`rounded-lg border p-2.5 mb-1.5 cursor-pointer hover:brightness-110 transition-all ${config.color}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-sm font-medium truncate">{a.subject}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs opacity-80">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {time}
                          {a.duration_minutes && ` · ${a.duration_minutes}min`}
                        </span>
                        {contactName && <span>{contactName}</span>}
                        {a.contact?.company && (
                          <span className="text-muted-foreground">
                            {a.contact.company.name}
                          </span>
                        )}
                        {a.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {a.location}
                          </span>
                        )}
                      </div>
                      {a.contact?.deal_amount && (
                        <div className="mt-1 text-xs font-medium">
                          {a.contact.deal_amount.toLocaleString('fr-FR')} €
                        </div>
                      )}
                    </div>
                  )
                })}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
