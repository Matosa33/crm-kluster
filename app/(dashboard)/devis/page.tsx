import Link from 'next/link'
import { getQuotes } from '@/lib/actions/quotes'
import { QuoteList } from '@/components/quotes/quote-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Plus, Euro, Send, CheckCircle } from 'lucide-react'

export default async function DevisPage() {
  const quotes = await getQuotes()

  const stats = {
    total: quotes.length,
    brouillon: quotes.filter((q) => q.status === 'brouillon').length,
    envoye: quotes.filter((q) => q.status === 'envoye').length,
    accepte: quotes.filter((q) => q.status === 'accepte').length,
    caTotal: quotes
      .filter((q) => q.status === 'accepte')
      .reduce((sum, q) => sum + q.total_ttc, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Devis</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos devis et propositions commerciales
          </p>
        </div>
        <Button asChild>
          <Link href="/devis/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-500/15">
                <FileText className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total devis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/15">
                <Send className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.envoye}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/15">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.accepte}</p>
                <p className="text-xs text-muted-foreground">Acceptés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/15">
                <Euro className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.caTotal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </p>
                <p className="text-xs text-muted-foreground">CA signé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quote list */}
      <QuoteList quotes={quotes} />
    </div>
  )
}
