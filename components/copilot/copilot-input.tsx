'use client'

import { useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CopilotInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [value])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) onSubmit()
    }
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="flex items-end gap-2 border-t border-white/[0.06] p-3 bg-white/[0.02]">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Pose ta question..."
        rows={1}
        className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/30"
      />
      <Button
        size="icon"
        onClick={onSubmit}
        disabled={!value.trim() || isLoading}
        className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}
