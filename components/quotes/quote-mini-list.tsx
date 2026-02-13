import Link from 'next/link'
import { QUOTE_STATUS_CONFIG } from '@/lib/constants/quote-status'
import type { QuoteWithRelations } from '@/lib/actions/quotes'
import type { QuoteStatus } from '@/lib/types'
import { FileText } from 'lucide-react'

export function QuoteMiniList({
  quotes,
  newQuoteHref,
}: {
  quotes: QuoteWithRelations[]
  newQuoteHref: string
}) {
  return (
    <div>
      {quotes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun devis
        </p>
      ) : (
        <div className="space-y-1.5">
          {quotes.map((quote) => {
            const statusConfig = QUOTE_STATUS_CONFIG[quote.status as QuoteStatus]
            return (
              <Link
                key={quote.id}
                href={`/devis/${quote.id}`}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-mono font-medium">{quote.reference}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-5">
                    {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className="text-sm font-semibold shrink-0 ml-3">
                  {quote.total_ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </span>
              </Link>
            )
          })}
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-white/[0.06]">
        <Link
          href={newQuoteHref}
          className="text-xs text-primary hover:underline"
        >
          + Créer un devis
        </Link>
      </div>
    </div>
  )
}
