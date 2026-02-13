'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useRouter } from 'next/navigation'
import { updateContactStatus } from '@/lib/actions/contacts'
import { STATUS_ORDER } from '@/lib/constants/status-config'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { StatusChangeDialog } from './status-change-dialog'
import type { ContactForKanban, ContactStatus } from '@/lib/types'

interface KanbanBoardProps {
  contacts: ContactForKanban[]
  companies: { id: string; name: string }[]
}

export function KanbanBoard({ contacts, companies }: KanbanBoardProps) {
  const router = useRouter()
  const [items, setItems] = useState(contacts)
  const [activeCard, setActiveCard] = useState<ContactForKanban | null>(null)
  const [pendingMove, setPendingMove] = useState<{
    contactId: string
    newStatus: ContactStatus
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const grouped = STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = items.filter((c) => c.status === status)
      return acc
    },
    {} as Record<ContactStatus, ContactForKanban[]>
  )

  function handleDragStart(event: DragStartEvent) {
    const card = items.find((c) => c.id === event.active.id)
    setActiveCard(card || null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return

    const contactId = active.id as string
    const newStatus = over.id as ContactStatus

    if (!STATUS_ORDER.includes(newStatus)) return

    const contact = items.find((c) => c.id === contactId)
    if (!contact || contact.status === newStatus) return

    // Optimistic update
    setItems((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, status: newStatus } : c))
    )

    setPendingMove({ contactId, newStatus })
  }

  async function confirmMove(note: string) {
    if (!pendingMove) return

    await updateContactStatus(pendingMove.contactId, pendingMove.newStatus, note)
    setPendingMove(null)
    router.refresh()
  }

  function cancelMove() {
    if (!pendingMove) return
    setItems(contacts)
    setPendingMove(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 min-h-[calc(100vh-220px)] scrollbar-thin">
        {STATUS_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            contacts={grouped[status]}
            companies={companies}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="opacity-90 rotate-2 scale-105">
            <KanbanCard contact={activeCard} isDragOverlay />
          </div>
        ) : null}
      </DragOverlay>

      <StatusChangeDialog
        open={!!pendingMove}
        onConfirm={confirmMove}
        onCancel={cancelMove}
        contactId={pendingMove?.contactId}
        newStatus={pendingMove?.newStatus}
      />
    </DndContext>
  )
}
