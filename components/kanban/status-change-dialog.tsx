'use client'

import { useState } from 'react'
import { STATUS_CONFIG } from '@/lib/constants/status-config'
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

interface StatusChangeDialogProps {
  open: boolean
  onConfirm: (note: string) => Promise<void>
  onCancel: () => void
  contactId?: string
  newStatus?: ContactStatus
}

export function StatusChangeDialog({
  open,
  onConfirm,
  onCancel,
  newStatus,
}: StatusChangeDialogProps) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await onConfirm(note)
    setNote('')
    setLoading(false)
  }

  function handleCancel() {
    setNote('')
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le statut</DialogTitle>
          <DialogDescription>
            {newStatus && (
              <>
                Déplacer vers{' '}
                <span className={`font-medium ${STATUS_CONFIG[newStatus].color}`}>
                  {STATUS_CONFIG[newStatus].label}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Raison du changement..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Enregistrement...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
