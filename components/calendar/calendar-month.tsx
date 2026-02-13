'use client'

import type { CalendarActivity } from '@/lib/types'
import { CalendarEventChip } from './calendar-event-chip'

interface CalendarMonthProps {
  currentDate: Date
  activities: CalendarActivity[]
  onDayClick: (date: Date) => void
  onEventClick: (event: CalendarActivity) => void
}

export function CalendarMonth({
  currentDate,
  activities,
  onDayClick,
  onEventClick,
}: CalendarMonthProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // First day of month (Monday = 0 in our grid)
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7 // Monday-based

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Build grid: 6 rows x 7 cols
  const days: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, 1 - startOffset + i)
    days.push(d)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }
  while (days.length < 42) {
    const d = new Date(year, month + 1, days.length - startOffset - daysInMonth + 1)
    days.push(d)
  }

  const today = new Date()
  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()

  const isCurrentMonth = (d: Date) => d.getMonth() === month

  function getActivitiesForDay(d: Date) {
    return activities.filter((a) => {
      const aDate = new Date(a.scheduled_at)
      return (
        aDate.getDate() === d.getDate() &&
        aDate.getMonth() === d.getMonth() &&
        aDate.getFullYear() === d.getFullYear()
      )
    })
  }

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-white/[0.06]">
        {weekDays.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          if (!date) return <div key={i} />
          const dayActivities = getActivitiesForDay(date)
          const inMonth = isCurrentMonth(date)

          return (
            <button
              key={i}
              onClick={() => onDayClick(date)}
              className={`min-h-[100px] p-1.5 border-b border-r border-white/[0.04] text-left hover:bg-white/[0.03] transition-colors ${
                !inMonth ? 'opacity-30' : ''
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${
                  isToday(date)
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'text-foreground'
                }`}
              >
                {date.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayActivities.slice(0, 3).map((a) => (
                  <CalendarEventChip
                    key={a.id}
                    event={a}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(a)
                    }}
                  />
                ))}
                {dayActivities.length > 3 && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    +{dayActivities.length - 3} autres
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
