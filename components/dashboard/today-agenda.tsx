'use client'

import Link from 'next/link'
import { Phone, Mail, Calendar, FileText, Clock, MapPin, Euro } from 'lucide-react'
import type { CalendarActivity } from '@/lib/types'

const TYPE_CONFIG = {
  appel: { icon: Phone, label: 'Appel', color: 'bg-blue-500/20 text-blue-300 border-blue-500/20' },
  email: { icon: Mail, label: 'Email', color: 'bg-slate-500/20 text-slate-300 border-slate-500/20' },
  rdv: { icon: Calendar, label: 'RDV', color: 'bg-amber-500/20 text-amber-300 border-amber-500/20' },
  note: { icon: FileText, label: 'Note', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20' },
}

interface TodayAgendaProps {
  activities: CalendarActivity[]
}

export function TodayAgenda({ activities }: TodayAgendaProps) {
  if (activities.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Agenda du jour
        </h3>
        <p className="text-sm text-muted-foreground text-center py-6">
          Aucun événement prévu aujourd&apos;hui
        </p>
        <Link
          href="/calendrier"
          className="block text-center text-xs text-primary hover:underline mt-2"
        >
          Ouvrir le calendrier
        </Link>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        Agenda du jour
        <span className="text-xs text-muted-foreground bg-white/[0.06] rounded-full px-2 py-0.5">
          {activities.length}
        </span>
      </h3>

      <div className="space-y-2">
        {activities.map((a) => {
          const config = TYPE_CONFIG[a.type]
          const Icon = config.icon
          const time = new Date(a.scheduled_at).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })
          const contactName = a.contact
            ? [a.contact.first_name, a.contact.last_name].filter(Boolean).join(' ')
            : null

          return (
            <div
              key={a.id}
              className={`rounded-lg border p-3 transition-all hover:brightness-110 ${config.color}`}
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
                {contactName && (
                  <Link
                    href={`/contacts/${a.contact_id}`}
                    className="hover:underline"
                  >
                    {contactName}
                  </Link>
                )}
                {a.contact?.deal_amount && (
                  <span className="flex items-center gap-1">
                    <Euro className="h-3 w-3" />
                    {a.contact.deal_amount.toLocaleString('fr-FR')} €
                  </span>
                )}
                {a.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {a.location}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Link
        href="/calendrier"
        className="block text-center text-xs text-primary hover:underline mt-3"
      >
        Voir le calendrier complet
      </Link>
    </div>
  )
}
