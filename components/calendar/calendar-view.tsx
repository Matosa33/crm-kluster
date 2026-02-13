'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarMonth } from './calendar-month'
import { CalendarWeek } from './calendar-week'
import { CalendarDay } from './calendar-day'
import { EventDetailDialog } from './event-detail-dialog'
import { QuickAddEvent } from './quick-add-event'
import type { CalendarActivity } from '@/lib/types'

type ViewMode = 'month' | 'week' | 'day'

interface CalendarViewProps {
  activities: CalendarActivity[]
  contacts: { id: string; name: string }[]
  initialDate: string
  initialView: ViewMode
}

export function CalendarView({
  activities,
  contacts,
  initialDate,
  initialView,
}: CalendarViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, setView] = useState<ViewMode>(initialView)
  const [currentDate, setCurrentDate] = useState(new Date(initialDate))
  const [selectedEvent, setSelectedEvent] = useState<CalendarActivity | null>(null)
  const [quickAdd, setQuickAdd] = useState<{ date: Date; hour?: number } | null>(null)

  function navigate(direction: -1 | 1) {
    const next = new Date(currentDate)
    if (view === 'month') next.setMonth(next.getMonth() + direction)
    else if (view === 'week') next.setDate(next.getDate() + 7 * direction)
    else next.setDate(next.getDate() + direction)

    setCurrentDate(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', next.toISOString().split('T')[0])
    router.push(`/calendrier?${params.toString()}`)
  }

  function goToday() {
    const today = new Date()
    setCurrentDate(today)
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', today.toISOString().split('T')[0])
    router.push(`/calendrier?${params.toString()}`)
  }

  function changeView(v: ViewMode) {
    setView(v)
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', v)
    router.push(`/calendrier?${params.toString()}`)
  }

  function handleDayClick(date: Date) {
    setCurrentDate(date)
    setView('day')
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', date.toISOString().split('T')[0])
    params.set('view', 'day')
    router.push(`/calendrier?${params.toString()}`)
  }

  function handleSlotClick(date: Date, hour?: number) {
    setQuickAdd({ date, hour })
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ]

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

  let title = ''
  if (view === 'month') {
    title = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  } else if (view === 'week') {
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay() + 1)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    title = `${start.getDate()} - ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`
  } else {
    title = `${dayNames[currentDate.getDay()]} ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`
  }

  return (
    <div className="space-y-4">
      {/* Header navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] hover:bg-white/[0.06] transition-colors"
          >
            Aujourd&apos;hui
          </button>
          <div className="flex bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => changeView(v)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  view === v
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar body */}
      {view === 'month' && (
        <CalendarMonth
          currentDate={currentDate}
          activities={activities}
          onDayClick={handleDayClick}
          onEventClick={setSelectedEvent}
        />
      )}
      {view === 'week' && (
        <CalendarWeek
          currentDate={currentDate}
          activities={activities}
          onEventClick={setSelectedEvent}
          onSlotClick={handleSlotClick}
        />
      )}
      {view === 'day' && (
        <CalendarDay
          currentDate={currentDate}
          activities={activities}
          onEventClick={setSelectedEvent}
          onSlotClick={handleSlotClick}
        />
      )}

      {/* Event detail dialog */}
      <EventDetailDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Quick add dialog */}
      {quickAdd && (
        <QuickAddEvent
          date={quickAdd.date}
          hour={quickAdd.hour}
          contacts={contacts}
          onClose={() => setQuickAdd(null)}
        />
      )}
    </div>
  )
}
