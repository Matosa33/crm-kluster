'use client'

import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCopilot } from './copilot-provider'

export function CopilotTrigger({ className }: { className?: string }) {
  const { open } = useCopilot()

  return (
    <Button
      variant="outline"
      onClick={() => open()}
      className={`gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 ${className || ''}`}
    >
      <Bot className="h-4 w-4" />
      Copilot IA
    </Button>
  )
}
