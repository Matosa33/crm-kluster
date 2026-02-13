'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logCall, rescheduleCall, type CallContact } from '@/lib/actions/calls'
import { CopilotProvider } from '@/components/copilot/copilot-provider'
import { CopilotTrigger } from '@/components/copilot/copilot-trigger'
import { Button } from '@/components/ui/button'
import { STATUS_CONFIG } from '@/lib/constants/status-config'
import type { CopilotContext } from '@/lib/ai/types'
import type { ContactStatus } from '@/lib/types'
import {
  Phone,
  PhoneCall,
  Mail,
  Building2,
  Globe,
  ChevronDown,
  ChevronUp,
  CalendarPlus,
  CheckCircle2,
  ExternalLink,
  Loader2,
  StickyNote,
  Euro,
} from 'lucide-react'

function getDaysOverdue(date: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

function getTomorrow9am(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

export function CallsList({ contacts }: { contacts: CallContact[] }) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleLogCall = async (contact: CallContact) => {
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Contact'
    setLoadingAction(`call-${contact.id}`)
    try {
      await logCall(
        contact.id,
        `Appel commercial — ${name}`,
        getTomorrow9am()
      )
      setExpandedId(null)
      router.refresh()
    } catch {
      // Silently fail, the UI will still be up
    }
    setLoadingAction(null)
  }

  const handleReschedule = async (contact: CallContact) => {
    setLoadingAction(`reschedule-${contact.id}`)
    try {
      await rescheduleCall(contact.id, getTomorrow9am())
      setExpandedId(null)
      router.refresh()
    } catch {
      // Silently fail
    }
    setLoadingAction(null)
  }

  if (contacts.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <PhoneCall className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
        <p className="text-muted-foreground">Aucun appel planifié</p>
        <p className="text-xs text-muted-foreground mt-1">
          Les contacts avec des relances ou le statut &quot;À contacter&quot; apparaîtront ici
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {contacts.map((contact) => {
        const isExpanded = expandedId === contact.id
        const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Sans nom'
        const statusConfig = STATUS_CONFIG[contact.status as ContactStatus]
        const daysOverdue = contact.next_followup_at
          ? getDaysOverdue(contact.next_followup_at)
          : null

        return (
          <div key={contact.id} className="glass-card rounded-xl overflow-hidden">
            {/* Collapsed row */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : contact.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
            >
              {/* Phone icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Phone className="h-4 w-4 text-primary" />
              </div>

              {/* Name + company */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{name}</p>
                {contact.company && (
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.company.name} — {contact.company.city}
                  </p>
                )}
              </div>

              {/* Status badge */}
              {statusConfig && (
                <span
                  className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
              )}

              {/* Overdue indicator */}
              {daysOverdue !== null && daysOverdue > 0 && (
                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">
                  -{daysOverdue}j
                </span>
              )}

              {/* Deal amount */}
              {contact.deal_amount != null && (
                <span className="shrink-0 text-xs font-medium text-emerald-400">
                  {contact.deal_amount.toLocaleString('fr-FR')} €
                </span>
              )}

              {/* Quick call button */}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  title={`Appeler ${contact.phone}`}
                >
                  <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                </a>
              )}

              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <ExpandedCard
                contact={contact}
                name={name}
                loadingAction={loadingAction}
                onLogCall={() => handleLogCall(contact)}
                onReschedule={() => handleReschedule(contact)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ExpandedCard({
  contact,
  name,
  loadingAction,
  onLogCall,
  onReschedule,
}: {
  contact: CallContact
  name: string
  loadingAction: string | null
  onLogCall: () => void
  onReschedule: () => void
}) {
  const copilotCtx: CopilotContext = {
    type: 'contact',
    contact: {
      id: contact.id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      phone: contact.phone,
      email: contact.email,
      position: contact.position,
      status: contact.status,
      priority: contact.priority,
      source: contact.source,
      notes: contact.notes,
      deal_amount: contact.deal_amount,
      next_followup_at: contact.next_followup_at,
    },
    company: contact.company
      ? {
          id: contact.company.id,
          name: contact.company.name,
          business_type: contact.company.business_type,
          city: contact.company.city,
          phone: contact.company.phone,
          email: contact.company.email,
          website: contact.company.website,
          website_status: contact.company.website_status,
          website_quality: contact.company.website_quality,
          rating: contact.company.rating,
          review_count: contact.company.review_count,
          gmb_score: contact.company.gmb_score,
          siret: contact.company.siret,
          legal_name: contact.company.legal_name,
          legal_form: contact.company.legal_form,
          naf_label: contact.company.naf_label,
          chiffre_affaires: contact.company.chiffre_affaires,
          resultat_net: contact.company.resultat_net,
          effectif: contact.company.effectif,
          categorie_entreprise: contact.company.categorie_entreprise,
          date_creation_entreprise: contact.company.date_creation_entreprise,
          description: contact.company.description,
          social_facebook: contact.company.social_facebook,
          social_instagram: contact.company.social_instagram,
        }
      : null,
  }

  return (
    <CopilotProvider context={copilotCtx}>
      <div className="px-4 pb-4 pt-1 border-t border-white/[0.04]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact info */}
          <div className="space-y-2.5">
            {contact.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-sm hover:underline text-primary">
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.deal_amount != null && (
              <div className="flex items-center gap-2.5">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {contact.deal_amount.toLocaleString('fr-FR')} €
                </span>
              </div>
            )}
            {contact.notes && (
              <div className="flex items-start gap-2.5">
                <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {contact.notes}
                </p>
              </div>
            )}
          </div>

          {/* Company info */}
          {contact.company && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Link
                  href={`/entreprises/${contact.company.id}`}
                  className="text-sm hover:underline"
                >
                  {contact.company.name}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {contact.company.business_type}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {contact.company.website ? (
                  <a
                    href={contact.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline truncate"
                  >
                    {contact.company.website}
                  </a>
                ) : (
                  <span className="text-sm text-amber-400">Pas de site web</span>
                )}
              </div>
              {contact.company.rating != null && (
                <p className="text-xs text-muted-foreground">
                  Google: {contact.company.rating}/5 ({contact.company.review_count} avis)
                  {contact.company.gmb_score != null && ` — GMB ${contact.company.gmb_score}%`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <CopilotTrigger className="text-xs h-8" />

          <Button
            size="sm"
            className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500"
            onClick={onLogCall}
            disabled={loadingAction === `call-${contact.id}`}
          >
            {loadingAction === `call-${contact.id}` ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Appel effectué
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            onClick={onReschedule}
            disabled={loadingAction === `reschedule-${contact.id}`}
          >
            {loadingAction === `reschedule-${contact.id}` ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CalendarPlus className="h-3.5 w-3.5" />
            )}
            Reporter à demain
          </Button>

          <Button size="sm" variant="ghost" className="h-8 gap-1.5" asChild>
            <Link href={`/contacts/${contact.id}`}>
              <ExternalLink className="h-3.5 w-3.5" />
              Fiche complète
            </Link>
          </Button>
        </div>
      </div>
    </CopilotProvider>
  )
}
