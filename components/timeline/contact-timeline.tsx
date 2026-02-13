import { TimelineEvent as TimelineEventComponent } from './timeline-event'
import type { TimelineEvent } from '@/lib/actions/timeline'

interface ContactTimelineProps {
  events: TimelineEvent[]
}

export function ContactTimeline({ events }: ContactTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Aucune activité enregistrée
      </p>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.06]" />

      <div className="space-y-4">
        {events.map((event) => (
          <TimelineEventComponent key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
