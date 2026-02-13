'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createContact, updateContact } from '@/lib/actions/contacts'
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
import { FuzzySelect } from '@/components/shared/fuzzy-select'
import { STATUS_ORDER, STATUS_CONFIG } from '@/lib/constants/status-config'
import type { Contact, Company, Profile, ContactStatus, ContactPriority } from '@/lib/types'

interface ContactFormProps {
  contact?: Contact
  companies: Pick<Company, 'id' | 'name'>[]
  users: Pick<Profile, 'id' | 'full_name'>[]
}

export function ContactForm({ contact, companies, users }: ContactFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [companyId, setCompanyId] = useState(contact?.company_id || '')
  const [assignedTo, setAssignedTo] = useState(contact?.assigned_to || '')
  const [status, setStatus] = useState(contact?.status || 'a_contacter')
  const [priority, setPriority] = useState(contact?.priority || 'moyenne')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      first_name: (formData.get('first_name') as string) || null,
      last_name: (formData.get('last_name') as string) || null,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      position: (formData.get('position') as string) || null,
      notes: (formData.get('notes') as string) || null,
      company_id: companyId || null,
      assigned_to: assignedTo || null,
      status: status as Contact['status'],
      priority: priority as Contact['priority'],
      deal_amount: formData.get('deal_amount') ? parseFloat(formData.get('deal_amount') as string) : null,
      next_followup_at: (formData.get('next_followup_at') as string) ? new Date(formData.get('next_followup_at') as string).toISOString() : null,
      lost_reason: (formData.get('lost_reason') as string) || null,
    }

    try {
      if (contact) {
        await updateContact(contact.id, data)
      } else {
        await createContact(data)
      }
      router.push('/contacts')
      router.refresh()
    } catch {
      setError('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Prénom</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={contact?.first_name || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Nom</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={contact?.last_name || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={contact?.email || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={contact?.phone || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Poste / Fonction</Label>
          <Input
            id="position"
            name="position"
            placeholder="Gérant, Directeur..."
            defaultValue={contact?.position || ''}
          />
        </div>

        <div className="space-y-2">
          <Label>Entreprise</Label>
          <FuzzySelect
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
            value={companyId}
            onChange={setCompanyId}
            placeholder="Rechercher une entreprise..."
            emptyLabel="Aucune entreprise"
          />
        </div>

        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ContactStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priorité</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as ContactPriority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basse">Basse</SelectItem>
              <SelectItem value="moyenne">Moyenne</SelectItem>
              <SelectItem value="haute">Haute</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Assigné à</Label>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger>
              <SelectValue placeholder="Non assigné" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Notes sur le contact..."
            defaultValue={contact?.notes || ''}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informations commerciales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deal_amount">Montant du devis (€)</Label>
            <Input
              id="deal_amount"
              name="deal_amount"
              type="number"
              step="0.01"
              defaultValue={contact?.deal_amount ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_followup_at">Prochaine relance</Label>
            <Input
              id="next_followup_at"
              name="next_followup_at"
              type="date"
              defaultValue={
                contact?.next_followup_at
                  ? new Date(contact.next_followup_at).toISOString().split('T')[0]
                  : ''
              }
            />
          </div>

          {status === 'perdu' && (
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="lost_reason">Raison de la perte</Label>
              <Textarea
                id="lost_reason"
                name="lost_reason"
                rows={3}
                placeholder="Raison pour laquelle le contact a été perdu..."
                defaultValue={contact?.lost_reason || ''}
              />
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Enregistrement...'
            : contact
              ? 'Modifier'
              : 'Créer le contact'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
