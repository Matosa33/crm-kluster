'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { QUOTE_STATUS_CONFIG } from '@/lib/constants/quote-status'
import type { QuoteWithRelations } from '@/lib/actions/quotes'
import type { QuoteStatus } from '@/lib/types'
import { FileText, Building2, User, Calendar } from 'lucide-react'

export function QuoteList({ quotes }: { quotes: QuoteWithRelations[] }) {
  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">Aucun devis</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {quotes.map((quote) => {
        const statusConfig = QUOTE_STATUS_CONFIG[quote.status as QuoteStatus]
        return (
          <Link
            key={quote.id}
            href={`/devis/${quote.id}`}
            className="flex items-center justify-between p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-semibold">{quote.reference}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {quote.client_name && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {quote.client_name}
                  </span>
                )}
                {quote.contact && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {quote.contact.first_name} {quote.contact.last_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-sm font-semibold">
                {quote.total_ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </p>
              <p className="text-xs text-muted-foreground">TTC</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
