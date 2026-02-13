'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { rescheduleFollowup, logQuickActivity } from '@/lib/actions/dashboard'
import {
  CalendarClock, Phone, CalendarPlus, CheckCircle2, Building2, Euro,
} from 'lucide-react'

interface FollowupContact {
  id: string
  first_name: string | null
  last_name: string | null
  next_followup_at: string
  status: string
  deal_amount: number | null
  company: { id: string; name: string } | null
  assigned_user: { id: string; full_name: string } | null
}

interface OverdueFollowupsProps {
  followups: FollowupContact[]
}

export function OverdueFollowups({ followups }: OverdueFollowupsProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleCall(contact: FollowupContact) {
    setLoadingId(contact.id)
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
    await logQuickActivity(contact.id, 'appel', `Appel de relance - ${name}`)
    setLoadingId(null)
    router.refresh()
  }

  async function handlePostpone(contact: FollowupContact) {
    setLoadingId(contact.id)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    await rescheduleFollowup(contact.id, tomorrow.toISOString())
    setLoadingId(null)
    router.refresh()
  }

  if (followups.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-amber-400" />
          Relances
        </h3>
        <p className="text-sm text-muted-foreground text-center py-6">
          Aucune relance en attente
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-amber-400" />
        Relances
        <span className="text-xs text-rose-400 bg-rose-500/10 rounded-full px-2 py-0.5">
          {followups.length} en retard
        </span>
      </h3>

      <div className="space-y-2">
        {followups.map((contact) => {
          const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Sans nom'
          const daysOverdue = Math.floor(
            (Date.now() - new Date(contact.next_followup_at).getTime()) / 86400000
          )
          const isLoading = loadingId === contact.id

          return (
            <div
              key={contact.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/contacts/${contact.id}`}
                  className="text-sm font-medium hover:text-primary transition-colors truncate block"
                >
                  {name}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {contact.company && (
                    <span className="flex items-center gap-1 truncate">
                      <Building2 className="h-3 w-3 shrink-0" />
                      {contact.company.name}
                    </span>
                  )}
                  {contact.deal_amount && (
                    <span className="flex items-center gap-1">
                      <Euro className="h-3 w-3" />
                      {contact.deal_amount.toLocaleString('fr-FR')}
                    </span>
                  )}
                  <span className="text-rose-400 font-medium">
                    -{daysOverdue}j
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2 shrink-0">
                <button
                  onClick={() => handleCall(contact)}
                  disabled={isLoading}
                  className="p-1.5 rounded-md hover:bg-blue-500/20 text-blue-400 transition-colors disabled:opacity-50"
                  title="Marquer comme appelé"
                >
                  <Phone className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handlePostpone(contact)}
                  disabled={isLoading}
                  className="p-1.5 rounded-md hover:bg-amber-500/20 text-amber-400 transition-colors disabled:opacity-50"
                  title="Reporter à demain"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
