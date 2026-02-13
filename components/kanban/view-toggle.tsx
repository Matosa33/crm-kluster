'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'

export function ViewToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') || 'kanban'

  function setView(view: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`/contacts?${params.toString()}`)
  }

  return (
    <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
      <button
        onClick={() => setView('kanban')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
          currentView === 'kanban'
            ? 'bg-primary/20 text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Pipeline
      </button>
      <button
        onClick={() => setView('table')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
          currentView === 'table'
            ? 'bg-primary/20 text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <List className="h-3.5 w-3.5" />
        Tableau
      </button>
    </div>
  )
}
