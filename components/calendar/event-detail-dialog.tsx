'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/actions/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Phone, Mail, Calendar, FileText,
  Clock, MapPin, User, Building2, Euro,
  Trash2, CheckCircle2, ExternalLink,
} from 'lucide-react'
import type { CalendarActivity } from '@/lib/types'

const TYPE_CONFIG = {
  appel: { icon: Phone, label: 'Appel', color: 'text-blue-400' },
  email: { icon: Mail, label: 'Email', color: 'text-slate-400' },
  rdv: { icon: Calendar, label: 'Rendez-vous', color: 'text-amber-400' },
  note: { icon: FileText, label: 'Note', color: 'text-emerald-400' },
}

interface EventDetailDialogProps {
  event: CalendarActivity | null
  onClose: () => void
}

export function EventDetailDialog({ event, onClose }: EventDetailDialogProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(event?.meeting_notes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!event) return null

  const config = TYPE_CONFIG[event.type]
  const Icon = config.icon
  const scheduledDate = new Date(event.scheduled_at)
  const contactName = event.contact
    ? [event.contact.first_name, event.contact.last_name].filter(Boolean).join(' ')
    : null

  async function handleSaveNotes() {
    if (!event) return
    setSavingNotes(true)
    await updateCalendarEvent(event.id, { meeting_notes: notes || null })
    setSavingNotes(false)
    router.refresh()
  }

  async function handleComplete() {
    if (!event) return
    await updateCalendarEvent(event.id, { completed_at: new Date().toISOString() })
    router.refresh()
    onClose()
  }

  async function handleDelete() {
    if (!event) return
    setDeleting(true)
    await deleteCalendarEvent(event.id)
    setDeleting(false)
    router.refresh()
    onClose()
  }

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
            {event.subject}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date & time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {scheduledDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
              {' à '}
              {scheduledDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {event.duration_minutes && ` · ${event.duration_minutes} min`}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}

          {/* Contact info ("prep meeting") */}
          {event.contact && (
            <div className="glass-card rounded-lg p-3 space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Préparation
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <Link
                    href={`/contacts/${event.contact.id}`}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {contactName || 'Contact'}
                    <ExternalLink className="h-3 w-3 inline ml-1 opacity-50" />
                  </Link>
                </div>
                {event.contact.deal_amount && (
                  <span className="flex items-center gap-1 text-sm">
                    <Euro className="h-3.5 w-3.5 text-muted-foreground" />
                    {event.contact.deal_amount.toLocaleString('fr-FR')} €
                  </span>
                )}
              </div>
              {event.contact.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <Link
                    href={`/entreprises/${event.contact.company.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {event.contact.company.name}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Meeting notes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Notes de réunion
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter des notes..."
              rows={4}
            />
            {notes !== (event.meeting_notes || '') && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? 'Sauvegarde...' : 'Sauvegarder les notes'}
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
            {!event.completed_at && (
              <Button size="sm" onClick={handleComplete}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Marquer comme fait
              </Button>
            )}
            {event.completed_at && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Terminé
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
