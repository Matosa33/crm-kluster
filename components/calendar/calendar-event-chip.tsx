'use client'

import { Phone, Mail, Calendar, FileText } from 'lucide-react'
import type { CalendarActivity } from '@/lib/types'

const TYPE_STYLES = {
  appel: { icon: Phone, bg: 'bg-blue-500/20 text-blue-300' },
  email: { icon: Mail, bg: 'bg-slate-500/20 text-slate-300' },
  rdv: { icon: Calendar, bg: 'bg-amber-500/20 text-amber-300' },
  note: { icon: FileText, bg: 'bg-emerald-500/20 text-emerald-300' },
}

interface CalendarEventChipProps {
  event: CalendarActivity
  showTime?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function CalendarEventChip({ event, showTime, onClick }: CalendarEventChipProps) {
  const style = TYPE_STYLES[event.type]
  const Icon = style.icon
  const time = new Date(event.scheduled_at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer hover:brightness-110 transition-all ${style.bg}`}
    >
      <Icon className="h-2.5 w-2.5 shrink-0" />
      {showTime && <span>{time}</span>}
      <span className="truncate">{event.subject}</span>
    </div>
  )
}
