'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const mdComponents = {
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="copilot-table-wrap">
      <table {...props} />
    </div>
  ),
}

export function CopilotMessage({
  role,
  content,
}: {
  role: 'user' | 'assistant'
  content: string
}) {
  if (role === 'user') {
    return (
      <div className="flex justify-end gap-2">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary/15 border border-primary/20 px-4 py-2.5 text-sm">
          {content}
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/20 mt-1">
        <Bot className="h-3.5 w-3.5 text-indigo-400" />
      </div>
      <div className="copilot-prose min-w-0 flex-1 max-w-[90%] rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm">
        <ReactMarkdown components={mdComponents}>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
