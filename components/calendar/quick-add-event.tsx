'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCalendarEvent } from '@/lib/actions/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Phone, Mail, Calendar, FileText } from 'lucide-react'
import { FuzzySelect } from '@/components/shared/fuzzy-select'
import type { ActivityType } from '@/lib/types'

const TYPES: { value: ActivityType; label: string; icon: typeof Phone }[] = [
  { value: 'rdv', label: 'Rendez-vous', icon: Calendar },
  { value: 'appel', label: 'Appel', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'note', label: 'Note', icon: FileText },
]

interface QuickAddEventProps {
  date: Date
  hour?: number
  contacts: { id: string; name: string }[]
  onClose: () => void
}

export function QuickAddEvent({ date, hour, contacts, onClose }: QuickAddEventProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<ActivityType>('rdv')
  const [contactId, setContactId] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [duration, setDuration] = useState('60')

  // Pre-fill datetime
  const defaultDate = new Date(date)
  if (hour !== undefined) defaultDate.setHours(hour, 0, 0, 0)
  else defaultDate.setHours(9, 0, 0, 0)

  const [scheduledAt, setScheduledAt] = useState(
    defaultDate.toISOString().slice(0, 16)
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contactId || !subject.trim()) return

    setLoading(true)
    await createCalendarEvent({
      contact_id: contactId,
      type,
      subject: subject.trim(),
      description: description || null,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: duration ? parseInt(duration) : null,
      location: location || null,
    })
    setLoading(false)
    router.refresh()
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel événement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label>Contact *</Label>
              <FuzzySelect
                options={contacts.map((c) => ({ value: c.id, label: c.name }))}
                value={contactId}
                onChange={setContactId}
                placeholder="Rechercher un contact..."
                emptyLabel="Choisir un contact..."
              />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Sujet *</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="RDV de présentation, Appel de suivi..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date & time */}
            <div className="space-y-2">
              <Label>Date et heure</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Durée (min)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1h</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                  <SelectItem value="120">2h</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          {(type === 'rdv') && (
            <div className="space-y-2">
              <Label>Lieu</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bureau, Visio, Restaurant..."
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !contactId || !subject.trim()}>
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
