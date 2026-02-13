'use client'

import type { CalendarActivity } from '@/lib/types'
import { CalendarEventChip } from './calendar-event-chip'

interface CalendarWeekProps {
  currentDate: Date
  activities: CalendarActivity[]
  onEventClick: (event: CalendarActivity) => void
  onSlotClick: (date: Date, hour: number) => void
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8h-20h

export function CalendarWeek({
  currentDate,
  activities,
  onEventClick,
  onSlotClick,
}: CalendarWeekProps) {
  // Get Monday of current week
  const monday = new Date(currentDate)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })

  const today = new Date()
  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()

  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  function getActivitiesForDayHour(date: Date, hour: number) {
    return activities.filter((a) => {
      const aDate = new Date(a.scheduled_at)
      return (
        aDate.getDate() === date.getDate() &&
        aDate.getMonth() === date.getMonth() &&
        aDate.getFullYear() === date.getFullYear() &&
        aDate.getHours() === hour
      )
    })
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/[0.06]">
        <div />
        {weekDays.map((d, i) => (
          <div
            key={i}
            className={`py-2 text-center border-l border-white/[0.04] ${
              isToday(d) ? 'bg-primary/10' : ''
            }`}
          >
            <div className="text-[10px] text-muted-foreground uppercase">
              {dayLabels[i]}
            </div>
            <div
              className={`text-sm font-medium ${
                isToday(d) ? 'text-primary' : ''
              }`}
            >
              {d.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="max-h-[600px] overflow-y-auto">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/[0.04]"
          >
            <div className="py-2 px-2 text-[10px] text-muted-foreground text-right">
              {hour}:00
            </div>
            {weekDays.map((d, i) => {
              const hourActivities = getActivitiesForDayHour(d, hour)
              return (
                <button
                  key={i}
                  onClick={() => onSlotClick(d, hour)}
                  className={`min-h-[48px] p-0.5 border-l border-white/[0.04] hover:bg-white/[0.03] transition-colors ${
                    isToday(d) ? 'bg-primary/[0.02]' : ''
                  }`}
                >
                  {hourActivities.map((a) => (
                    <CalendarEventChip
                      key={a.id}
                      event={a}
                      showTime
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(a)
                      }}
                    />
                  ))}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
