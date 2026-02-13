'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QUOTE_STATUS_CONFIG } from '@/lib/constants/quote-status'
import { updateQuoteStatus, deleteQuote, duplicateQuote } from '@/lib/actions/quotes'
import type { QuoteWithRelations } from '@/lib/actions/quotes'
import type { QuoteStatus } from '@/lib/types'
import {
  Building2,
  User,
  FileText,
  Calendar,
  Check,
  X,
  Copy,
  Trash2,
  Loader2,
  ArrowLeft,
  Download,
  CircleDot,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'

export function QuoteDetail({ quote }: { quote: QuoteWithRelations }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showStatusPanel, setShowStatusPanel] = useState(false)
  const statusConfig = QUOTE_STATUS_CONFIG[quote.status as QuoteStatus]

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    setLoading(newStatus)
    await updateQuoteStatus(quote.id, newStatus)
    setLoading(null)
    setShowStatusPanel(false)
    router.refresh()
  }

  const handleDuplicate = async () => {
    setLoading('duplicate')
    const result = await duplicateQuote(quote.id)
    router.push(`/devis/${result.id}`)
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer ce devis ?')) return
    setLoading('delete')
    await deleteQuote(quote.id)
    router.push('/devis')
  }

  const handleDownloadPDF = async () => {
    setLoading('pdf')
    const { generateQuotePDF } = await import('@/lib/utils/generate-quote-pdf')
    generateQuotePDF(quote)
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/devis">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-mono">{quote.reference}</h1>
            <span className={`text-sm px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Créé le {new Date(quote.created_at).toLocaleDateString('fr-FR')}
            {quote.created_by_user && ` par ${quote.created_by_user.full_name}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* PDF Download */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={loading !== null}
          >
            {loading === 'pdf' ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" />
            )}
            Télécharger PDF
          </Button>

          {/* Duplicate */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            disabled={loading !== null}
          >
            {loading === 'duplicate' ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" />
            )}
            Dupliquer
          </Button>

          {/* Delete (brouillon only) */}
          {quote.status === 'brouillon' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={loading !== null}
              className="text-red-400 hover:text-red-300"
            >
              {loading === 'delete' ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {/* Status change card */}
      {(quote.status === 'brouillon' || quote.status === 'envoye') && (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="pt-6">
            {quote.status === 'brouillon' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CircleDot className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ce devis est en brouillon</p>
                    <p className="text-xs text-muted-foreground">
                      Marquez-le comme envoyé une fois transmis au client
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleStatusChange('envoye')}
                  disabled={loading !== null}
                >
                  {loading === 'envoye' ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Marquer comme envoyé
                </Button>
              </div>
            )}

            {quote.status === 'envoye' && !showStatusPanel && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CircleDot className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">Devis envoyé — en attente de réponse</p>
                    <p className="text-xs text-muted-foreground">
                      Le client a-t-il répondu ?
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowStatusPanel(true)}
                >
                  Mettre à jour le statut
                </Button>
              </div>
            )}

            {quote.status === 'envoye' && showStatusPanel && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Quelle est la réponse du client ?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusChange('accepte')}
                    disabled={loading !== null}
                    className="flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                  >
                    {loading === 'accepte' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-5 w-5" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium">Accepté</p>
                      <p className="text-[11px] text-emerald-400/70">Le client a signé</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleStatusChange('refuse')}
                    disabled={loading !== null}
                    className="flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-colors"
                  >
                    {loading === 'refuse' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ThumbsDown className="h-5 w-5" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium">Refusé</p>
                      <p className="text-[11px] text-red-400/70">Le client a décliné</p>
                    </div>
                  </button>
                </div>
                <button
                  onClick={() => setShowStatusPanel(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prestations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-4">Prestation</th>
                      <th className="pb-2 pr-4 text-right">Qté</th>
                      <th className="pb-2 pr-4 text-right">Prix unit.</th>
                      <th className="pb-2 pr-4 text-right">Remise</th>
                      <th className="pb-2 text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {(quote.lines || []).map((line) => (
                      <tr key={line.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium">{line.label}</p>
                          {line.description && (
                            <p className="text-xs text-muted-foreground">{line.description}</p>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right whitespace-nowrap">
                          {line.quantity} {line.unit_label}
                        </td>
                        <td className="py-3 pr-4 text-right whitespace-nowrap">
                          {line.unit_price_ht.toLocaleString('fr-FR')} €
                        </td>
                        <td className="py-3 pr-4 text-right whitespace-nowrap">
                          {line.discount_percent > 0 ? `-${line.discount_percent}%` : '—'}
                        </td>
                        <td className="py-3 text-right font-medium whitespace-nowrap">
                          {line.total_ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Conditions */}
          {quote.conditions && (
            <Card>
              <CardHeader>
                <CardTitle>Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.conditions}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {quote.client_name && (
                <p className="font-medium">{quote.client_name}</p>
              )}
              {quote.client_address && (
                <p className="text-muted-foreground">{quote.client_address}</p>
              )}
              {quote.client_siret && (
                <p className="text-muted-foreground">SIRET : {quote.client_siret}</p>
              )}
              {quote.company && (
                <Link
                  href={`/entreprises/${quote.company.id}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Building2 className="h-3 w-3" />
                  {quote.company.name}
                </Link>
              )}
              {quote.contact && (
                <Link
                  href={`/contacts/${quote.contact.id}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <User className="h-3 w-3" />
                  {quote.contact.first_name} {quote.contact.last_name}
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Totaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total HT</span>
                <span>{quote.total_ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
              {quote.discount_percent > 0 && (
                <>
                  <div className="flex justify-between text-emerald-400">
                    <span>Remise ({quote.discount_percent}%)</span>
                    <span>-{quote.discount_amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Après remise</span>
                    <span>{quote.total_after_discount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">TVA ({quote.tva_rate}%)</span>
                <span>{quote.total_tva.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/[0.06]">
                <span>Total TTC</span>
                <span className="text-primary">
                  {quote.total_ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span>{new Date(quote.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              {quote.issued_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envoyé le</span>
                  <span>{new Date(quote.issued_at).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              {quote.valid_until && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valide jusqu&apos;au</span>
                  <span className={new Date(quote.valid_until) < new Date() ? 'text-red-400' : ''}>
                    {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              {quote.accepted_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accepté le</span>
                  <span className="text-emerald-400">
                    {new Date(quote.accepted_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
