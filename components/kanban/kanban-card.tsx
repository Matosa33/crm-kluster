'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import Link from 'next/link'
import { updateContactField } from '@/lib/actions/contacts'
import { useRouter } from 'next/navigation'
import { Building2, Euro, CalendarClock } from 'lucide-react'
import type { ContactForKanban } from '@/lib/types'

interface KanbanCardProps {
  contact: ContactForKanban
  isDragOverlay?: boolean
}

export function KanbanCard({ contact, isDragOverlay }: KanbanCardProps) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: contact.id,
  })

  const [editingAmount, setEditingAmount] = useState(false)
  const [amount, setAmount] = useState(contact.deal_amount?.toString() || '')

  // Deal age indicator
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(contact.updated_at).getTime()) / 86400000
  )
  const ageColor =
    daysSinceUpdate > 14
      ? 'border-l-rose-500'
      : daysSinceUpdate > 7
        ? 'border-l-amber-500'
        : 'border-l-transparent'

  const priorityColors = {
    haute: 'bg-rose-500/20 text-rose-300',
    moyenne: 'bg-amber-500/20 text-amber-300',
    basse: 'bg-slate-500/20 text-slate-400',
  }

  const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Sans nom'

  async function saveAmount() {
    setEditingAmount(false)
    const newAmount = amount ? parseFloat(amount) : null
    if (newAmount !== contact.deal_amount) {
      await updateContactField(contact.id, 'deal_amount', newAmount)
      router.refresh()
    }
  }

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
      className={`glass-card rounded-lg p-3 cursor-grab active:cursor-grabbing border-l-4 ${ageColor} transition-all duration-150 hover:border-white/15 ${
        isDragging ? 'opacity-40' : ''
      } ${isDragOverlay ? 'shadow-2xl' : ''}`}
    >
      {/* Name + Priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/contacts/${contact.id}`}
          className="text-sm font-medium hover:text-primary transition-colors truncate"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {name}
        </Link>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium ${
            priorityColors[contact.priority as keyof typeof priorityColors] || priorityColors.moyenne
          }`}
        >
          {contact.priority === 'haute' ? '!!!' : contact.priority === 'moyenne' ? '!!' : '!'}
        </span>
      </div>

      {/* Company */}
      {contact.company && (
        <div className="flex items-center gap-1.5 mb-2">
          <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {contact.company.name}
          </span>
        </div>
      )}

      {/* Deal amount - inline editable */}
      <div className="flex items-center gap-1.5 mb-1">
        <Euro className="h-3 w-3 text-muted-foreground shrink-0" />
        {editingAmount ? (
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={saveAmount}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveAmount()
              if (e.key === 'Escape') {
                setEditingAmount(false)
                setAmount(contact.deal_amount?.toString() || '')
              }
            }}
            className="text-xs bg-white/[0.06] border border-white/10 rounded px-1.5 py-0.5 w-24 focus:outline-none focus:ring-1 focus:ring-primary/50"
            autoFocus
            placeholder="Montant"
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setEditingAmount(true)
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {contact.deal_amount
              ? `${contact.deal_amount.toLocaleString('fr-FR')} €`
              : 'Ajouter montant'}
          </button>
        )}
      </div>

      {/* Follow-up date */}
      {contact.next_followup_at && (
        <div className="flex items-center gap-1.5">
          <CalendarClock className="h-3 w-3 text-muted-foreground shrink-0" />
          <span
            className={`text-xs ${
              new Date(contact.next_followup_at) < new Date()
                ? 'text-rose-400 font-medium'
                : 'text-muted-foreground'
            }`}
          >
            {new Date(contact.next_followup_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
            })}
            {new Date(contact.next_followup_at) < new Date() && ' - En retard'}
          </span>
        </div>
      )}

      {/* Age indicator text */}
      {daysSinceUpdate > 7 && (
        <div className="mt-2 pt-1.5 border-t border-white/[0.05]">
          <span className={`text-[10px] ${daysSinceUpdate > 14 ? 'text-rose-400' : 'text-amber-400'}`}>
            Inactif depuis {daysSinceUpdate}j
          </span>
        </div>
      )}
    </div>
  )
}
