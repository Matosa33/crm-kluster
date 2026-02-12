'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createActivity } from '@/lib/actions/activities'
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
import { Phone, Mail, Calendar, FileText, Plus } from 'lucide-react'
import type { ActivityType } from '@/lib/types'

const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: typeof Phone }[] = [
  { value: 'appel', label: 'Appel', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'rdv', label: 'Rendez-vous', icon: Calendar },
  { value: 'note', label: 'Note', icon: FileText },
]

interface ActivityFormProps {
  contactId: string
}

export function ActivityForm({ contactId }: ActivityFormProps) {
  const router = useRouter()
  const [type, setType] = useState<ActivityType>('note')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    await createActivity({
      contact_id: contactId,
      type,
      subject: formData.get('subject') as string,
      description: (formData.get('description') as string) || null,
      scheduled_at: (formData.get('scheduled_at') as string) || null,
    })

    e.currentTarget.reset()
    setExpanded(false)
    setLoading(false)
    router.refresh()
  }

  if (!expanded) {
    return (
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setExpanded(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Ajouter une activite
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-muted/50 rounded-lg border"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as ActivityType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((t) => (
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

        {(type === 'rdv' || type === 'appel') && (
          <div className="space-y-2">
            <Label htmlFor="scheduled_at">Date prevue</Label>
            <Input
              id="scheduled_at"
              name="scheduled_at"
              type="datetime-local"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Sujet *</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="Appel de suivi, Envoi devis..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Details de l'activite..."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm">
          {loading ? 'Ajout...' : 'Ajouter'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(false)}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
