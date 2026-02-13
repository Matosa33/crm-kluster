'use client'

import { useDroppable } from '@dnd-kit/core'
import { STATUS_CONFIG } from '@/lib/constants/status-config'
import { KanbanCard } from './kanban-card'
import { KanbanQuickAdd } from './kanban-quick-add'
import type { ContactForKanban, ContactStatus } from '@/lib/types'

interface KanbanColumnProps {
  status: ContactStatus
  contacts: ContactForKanban[]
  companies: { id: string; name: string }[]
}

export function KanbanColumn({ status, contacts, companies }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const config = STATUS_CONFIG[status]

  const totalDeal = contacts.reduce((sum, c) => sum + (c.deal_amount || 0), 0)

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] w-[280px] shrink-0 rounded-xl transition-all duration-200 ${
        isOver ? `${config.dropColor} bg-white/[0.03]` : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${config.accent}`} />
          <span className={`text-sm font-semibold ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground bg-white/[0.06] rounded-full px-2 py-0.5">
            {contacts.length}
          </span>
        </div>
        {totalDeal > 0 && (
          <span className="text-xs text-muted-foreground">
            {totalDeal.toLocaleString('fr-FR')} €
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto space-y-2 px-1.5 pb-2 min-h-[100px] scrollbar-on-hover">
        {contacts.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground/50">
            Aucun contact
          </div>
        )}
        {contacts.map((contact) => (
          <KanbanCard key={contact.id} contact={contact} />
        ))}
      </div>

      {/* Quick add */}
      <div className="px-1.5 pb-2">
        <KanbanQuickAdd status={status} companies={companies} />
      </div>
    </div>
  )
}
