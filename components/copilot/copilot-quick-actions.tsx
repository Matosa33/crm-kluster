'use client'

import { QUICK_ACTIONS } from '@/lib/ai/types'

export function CopilotQuickActions({
  onSelect,
  compact,
}: {
  onSelect: (prompt: string) => void
  compact?: boolean
}) {
  if (compact) {
    return (
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelect(action.prompt)}
            className="shrink-0 rounded-full px-3 py-1 text-xs border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-muted-foreground hover:text-foreground"
          >
            {action.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelect(action.prompt)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-left border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] transition-colors group"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/15 transition-colors">
              <Icon className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {action.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
