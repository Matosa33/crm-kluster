'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Bot, RotateCcw } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useCopilot } from './copilot-provider'
import { CopilotMessage } from './copilot-message'
import { CopilotQuickActions } from './copilot-quick-actions'
import { CopilotInput } from './copilot-input'

function getMessageText(msg: { parts: Array<{ type: string; text?: string }> }): string {
  return msg.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text || '')
    .join('')
}

export function CopilotPanel() {
  const { isOpen, close, context, initialPrompt } = useCopilot()
  const scrollRef = useRef<HTMLDivElement>(null)
  const initialPromptSent = useRef(false)
  const [input, setInput] = useState('')

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/chat',
        body: { context },
      }),
    [context]
  )

  const {
    messages,
    sendMessage,
    status,
    setMessages,
  } = useChat({ transport })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages])

  // Handle initial prompt (from quick actions on trigger)
  useEffect(() => {
    if (isOpen && initialPrompt && !initialPromptSent.current) {
      initialPromptSent.current = true
      sendMessage({ text: initialPrompt })
    }
    if (!isOpen) {
      initialPromptSent.current = false
    }
  }, [isOpen, initialPrompt, sendMessage])

  const handleQuickAction = (prompt: string) => {
    sendMessage({ text: prompt })
  }

  const handleReset = () => {
    setMessages([])
    setInput('')
  }

  const onSubmit = () => {
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const hasMessages = messages.length > 0

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="right"
        showCloseButton
        className="w-full sm:max-w-[480px] p-0 flex flex-col bg-[oklch(0.13_0.02_280)] border-l border-white/[0.08]"
      >
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/20">
                <Bot className="h-4 w-4 text-indigo-400" />
              </div>
              Copilot IA
            </SheetTitle>
            {hasMessages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Nouvelle conversation
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0" ref={scrollRef}>
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {!hasMessages && (
                <div className="flex flex-col items-center text-center pt-8 pb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
                    <Bot className="h-7 w-7 text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-medium mb-1">
                    Assistant commercial KLUSTER
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs mb-6">
                    Je connais le catalogue, les prix et le contexte de ce
                    prospect. Pose-moi tes questions !
                  </p>
                  <CopilotQuickActions onSelect={handleQuickAction} />
                </div>
              )}

              {messages.map((msg) => (
                <CopilotMessage
                  key={msg.id}
                  role={msg.role as 'user' | 'assistant'}
                  content={getMessageText(msg)}
                />
              ))}

              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/20 mt-1">
                    <Bot className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] px-5 py-3.5">
                    <div className="typing-dots flex items-center gap-1">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {hasMessages && !isLoading && (
              <div className="px-4 pb-2">
                <CopilotQuickActions onSelect={handleQuickAction} compact />
              </div>
            )}
          </ScrollArea>
        </div>

        <CopilotInput
          value={input}
          onChange={setInput}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </SheetContent>
    </Sheet>
  )
}
