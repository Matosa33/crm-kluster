'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateContactStatus } from '@/lib/actions/contacts'
import { STATUS_CONFIG, STATUS_ORDER } from '@/lib/constants/status-config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { ContactStatus } from '@/lib/types'

interface StatusSelectProps {
  contactId: string
  currentStatus: ContactStatus
}

export function StatusSelect({ contactId, currentStatus }: StatusSelectProps) {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<ContactStatus | null>(
    null
  )
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  function handleStatusChange(status: string) {
    if (status === currentStatus) return
    setSelectedStatus(status as ContactStatus)
  }

  async function confirmStatusChange() {
    if (!selectedStatus) return

    setLoading(true)
    await updateContactStatus(contactId, selectedStatus, note)
    setLoading(false)
    setSelectedStatus(null)
    setNote('')
    router.refresh()
  }

  return (
    <>
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_ORDER.map((status) => (
            <SelectItem key={status} value={status}>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[status].bgColor} ${STATUS_CONFIG[status].color}`}
              >
                {STATUS_CONFIG[status].label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog
        open={!!selectedStatus}
        onOpenChange={() => setSelectedStatus(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
            <DialogDescription>
              Passer de &quot;{STATUS_CONFIG[currentStatus].label}&quot; à
              &quot;
              {selectedStatus && STATUS_CONFIG[selectedStatus].label}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note (optionnel)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Raison du changement de statut..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedStatus(null)}
            >
              Annuler
            </Button>
            <Button onClick={confirmStatusChange} disabled={loading}>
              {loading ? 'Enregistrement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
