import { Suspense } from 'react'
import { getCalendarActivities } from '@/lib/actions/calendar'
import { getContacts } from '@/lib/actions/contacts'
import { CalendarView } from '@/components/calendar/calendar-view'
import { Calendar } from 'lucide-react'

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string
    view?: string
  }>
}) {
  const params = await searchParams
  const dateStr = params.date || new Date().toISOString().split('T')[0]
  const view = (params.view as 'month' | 'week' | 'day') || 'week'

  // Fetch a wide window of activities (current month ± 1 month)
  const currentDate = new Date(dateStr)
  const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0)

  const [activities, contacts] = await Promise.all([
    getCalendarActivities(start.toISOString(), end.toISOString()),
    getContacts(),
  ])

  const contactList = contacts.map((c) => ({
    id: c.id,
    name: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Sans nom',
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Calendrier</h1>
      </div>

      <Suspense>
        <CalendarView
          activities={activities}
          contacts={contactList}
          initialDate={dateStr}
          initialView={view}
        />
      </Suspense>
    </div>
  )
}
