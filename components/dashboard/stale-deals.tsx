import Link from 'next/link'
import { AlertTriangle, Building2, Euro } from 'lucide-react'

interface StaleDeal {
  id: string
  first_name: string | null
  last_name: string | null
  status: string
  deal_amount: number | null
  updated_at: string
  company: { id: string; name: string } | null
}

interface StaleDealsProps {
  deals: StaleDeal[]
}

export function StaleDeals({ deals }: StaleDealsProps) {
  if (deals.length === 0) return null

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        Deals dormants
        <span className="text-xs text-muted-foreground bg-white/[0.06] rounded-full px-2 py-0.5">
          {deals.length}
        </span>
      </h3>

      <div className="space-y-2">
        {deals.map((deal) => {
          const name = [deal.first_name, deal.last_name].filter(Boolean).join(' ') || 'Sans nom'
          const daysSince = Math.floor(
            (Date.now() - new Date(deal.updated_at).getTime()) / 86400000
          )
          const ageColor = daysSince > 14 ? 'text-rose-400' : 'text-amber-400'

          return (
            <div
              key={deal.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/contacts/${deal.id}`}
                  className="text-sm font-medium hover:text-primary transition-colors truncate block"
                >
                  {name}
                </Link>
                {deal.company && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    {deal.company.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 ml-2 shrink-0">
                {deal.deal_amount && (
                  <span className="flex items-center gap-1 text-xs">
                    <Euro className="h-3 w-3 text-muted-foreground" />
                    {deal.deal_amount.toLocaleString('fr-FR')}
                  </span>
                )}
                <span className={`text-xs font-medium ${ageColor}`}>
                  {daysSince}j
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
