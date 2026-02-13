'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { CopilotContext } from '@/lib/ai/types'
import { CopilotPanel } from './copilot-panel'

type CopilotState = {
  isOpen: boolean
  context: CopilotContext
  initialPrompt: string | null
  open: (prompt?: string) => void
  close: () => void
}

const CopilotCtx = createContext<CopilotState | null>(null)

export function useCopilot() {
  const ctx = useContext(CopilotCtx)
  if (!ctx) throw new Error('useCopilot must be used within CopilotProvider')
  return ctx
}

export function CopilotProvider({
  context,
  children,
}: {
  context: CopilotContext
  children: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null)

  const open = useCallback((prompt?: string) => {
    setInitialPrompt(prompt || null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setInitialPrompt(null)
  }, [])

  return (
    <CopilotCtx.Provider value={{ isOpen, context, initialPrompt, open, close }}>
      {children}
      <CopilotPanel />
    </CopilotCtx.Provider>
  )
}
