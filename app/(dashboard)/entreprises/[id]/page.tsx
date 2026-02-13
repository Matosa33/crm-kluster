import Link from 'next/link'
import { getCompany } from '@/lib/actions/companies'
import { getContactsByCompany } from '@/lib/actions/contacts'
import { getQuotesByCompany } from '@/lib/actions/quotes'
import { QuoteMiniList } from '@/components/quotes/quote-mini-list'
import { CompanySiretLookup } from '@/components/companies/company-siret-lookup'
import { CopilotProvider } from '@/components/copilot/copilot-provider'
import { CopilotTrigger } from '@/components/copilot/copilot-trigger'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Pencil,
  ArrowLeft,
  Monitor,
  Smartphone,
  Users,
  FileText,
  ShieldCheck,
  Share2,
  Tag,
  TrendingUp,
  CalendarDays,
} from 'lucide-react'
import {
  WEBSITE_STATUS_CONFIG,
  WEBSITE_QUALITY_CONFIG,
} from '@/lib/constants/website-config'
import { STATUS_CONFIG } from '@/lib/constants/status-config'
import { getGmbScoreConfig } from '@/lib/utils/gmb-score'
import type { ContactStatus } from '@/lib/types'
import type { CopilotContext } from '@/lib/ai/types'

const SOCIAL_LINKS = [
  { key: 'social_facebook', label: 'Facebook', prefix: 'https://facebook.com/' },
  { key: 'social_instagram', label: 'Instagram', prefix: 'https://instagram.com/' },
  { key: 'social_twitter', label: 'X / Twitter', prefix: 'https://twitter.com/' },
  { key: 'social_linkedin', label: 'LinkedIn', prefix: 'https://linkedin.com/' },
  { key: 'social_youtube', label: 'YouTube', prefix: 'https://youtube.com/' },
] as const

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [company, contacts, quotes] = await Promise.all([
    getCompany(id),
    getContactsByCompany(id),
    getQuotesByCompany(id),
  ])

  const gmbScore = company.gmb_score ?? 0
  const gmbConfig = getGmbScoreConfig(gmbScore)

  const hasSocial = !!(
    company.social_facebook ||
    company.social_instagram ||
    company.social_twitter ||
    company.social_linkedin ||
    company.social_youtube
  )

  const hasFinances = !!(
    company.chiffre_affaires != null ||
    company.resultat_net != null ||
    company.effectif ||
    company.categorie_entreprise ||
    company.date_creation_entreprise
  )

  function formatCurrency(value: number): string {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace('.0', '')} M€`
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)} k€`
    }
    return `${value.toLocaleString('fr-FR')} €`
  }

  const copilotCtx: CopilotContext = {
    type: 'company',
    company: {
      id: company.id,
      name: company.name,
      business_type: company.business_type,
      city: company.city,
      phone: company.phone,
      email: company.email,
      website: company.website,
      website_status: company.website_status,
      website_quality: company.website_quality,
      rating: company.rating,
      review_count: company.review_count,
      gmb_score: company.gmb_score,
      siret: company.siret,
      legal_name: company.legal_name,
      legal_form: company.legal_form,
      naf_label: company.naf_label,
      chiffre_affaires: company.chiffre_affaires,
      resultat_net: company.resultat_net,
      effectif: company.effectif,
      categorie_entreprise: company.categorie_entreprise,
      date_creation_entreprise: company.date_creation_entreprise,
      description: company.description,
      social_facebook: company.social_facebook,
      social_instagram: company.social_instagram,
    },
    quotes: quotes.map((q) => ({
      id: q.id,
      reference: q.reference,
      status: q.status,
      total_ht: q.total_ht,
      total_ttc: q.total_ttc,
      issued_at: q.issued_at,
    })),
  }

  return (
    <CopilotProvider context={copilotCtx}>
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/entreprises">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary">{company.business_type}</Badge>
            <Badge variant="outline">{company.source_api || 'manual'}</Badge>
            {company.rating && (
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {company.rating}
              </Badge>
            )}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${gmbConfig.color} ${gmbConfig.bgColor}`}
            >
              GMB {gmbScore}% — {gmbConfig.label}
            </span>
          </div>
        </div>
        <CopilotTrigger />
        <Button asChild>
          <Link href={`/entreprises/${id}/modifier`}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      {/* Description */}
      {company.description && (
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">{company.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {company.categories && company.categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {company.categories.map((cat) => (
            <Badge key={cat} variant="outline" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coordonnees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Coordonnées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p>{company.address}</p>
                  <p>
                    {company.postal_code} {company.city}
                  </p>
                </div>
              </div>
            )}
            {!company.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <p>{company.city}</p>
              </div>
            )}

            {company.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a href={`tel:${company.phone}`} className="hover:underline">
                  {company.phone}
                </a>
              </div>
            )}

            {company.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a href={`mailto:${company.email}`} className="hover:underline">
                  {company.email}
                </a>
              </div>
            )}

            {company.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}

            {company.google_maps_url && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <a
                  href={company.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-sm"
                >
                  Voir sur Google Maps
                </a>
              </div>
            )}

            {/* Reseaux sociaux */}
            {hasSocial && (
              <div className="pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">
                    Réseaux sociaux
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map(({ key, label, prefix }) => {
                    const value = company[key]
                    if (!value) return null
                    const url = value.startsWith('http') ? value : prefix + value
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {label}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analyse site web */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Analyse site web
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Statut site web</span>
              {(() => {
                const status = company.website_status || 'inconnu'
                const config = WEBSITE_STATUS_CONFIG[status]
                return (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bgColor}`}
                  >
                    {config.label}
                  </span>
                )
              })()}
            </div>

            {company.website_status === 'site_existant' && (
              <>
                {company.website_quality && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Qualité du site
                    </span>
                    {(() => {
                      const config =
                        WEBSITE_QUALITY_CONFIG[company.website_quality]
                      return (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bgColor}`}
                        >
                          {config.label}
                        </span>
                      )
                    })()}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4" />
                    Mobile-friendly
                  </span>
                  <span className="text-sm">
                    {company.is_mobile_friendly === true
                      ? 'Oui'
                      : company.is_mobile_friendly === false
                        ? 'Non'
                        : 'Non vérifié'}
                  </span>
                </div>
              </>
            )}

            {company.website_notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{company.website_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SIRET / Informations legales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Informations légales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {company.siret ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SIRET</span>
                  <span className="font-mono">{company.siret}</span>
                </div>
                {company.siren && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SIREN</span>
                    <span className="font-mono">{company.siren}</span>
                  </div>
                )}
                {company.legal_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Raison sociale</span>
                    <span>{company.legal_name}</span>
                  </div>
                )}
                {company.legal_form && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Forme juridique
                    </span>
                    <span>{company.legal_form}</span>
                  </div>
                )}
                {company.naf_label && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Activité</span>
                    <span>{company.naf_label}</span>
                  </div>
                )}
                {company.vat_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TVA intracom.</span>
                    <span className="font-mono text-xs">
                      {company.vat_number}
                    </span>
                  </div>
                )}
                {company.headquarters_address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Adresse siège</span>
                    <span className="text-right max-w-[60%]">
                      {company.headquarters_address}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Aucun SIRET associé. Recherchez l&apos;entreprise pour associer
                  ses informations légales.
                </p>
                <CompanySiretLookup
                  companyId={company.id}
                  companyName={company.name}
                  companyCity={company.city}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Données financières */}
        {hasFinances && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Données financières
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {company.chiffre_affaires != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chiffre d&apos;affaires</span>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(company.chiffre_affaires)}
                  </span>
                </div>
              )}
              {company.resultat_net != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Résultat net</span>
                  <span
                    className={`font-semibold ${company.resultat_net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {formatCurrency(company.resultat_net)}
                  </span>
                </div>
              )}
              {company.effectif && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Effectif</span>
                  <span>{company.effectif}</span>
                </div>
              )}
              {company.categorie_entreprise && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Catégorie</span>
                  <span>{company.categorie_entreprise}</span>
                </div>
              )}
              {company.date_creation_entreprise && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Création
                  </span>
                  <span>
                    {new Date(company.date_creation_entreprise).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              {/* Indicateur lead chaud: gros CA + pas de site */}
              {company.chiffre_affaires != null &&
                company.chiffre_affaires >= 100_000 &&
                !company.website && (
                  <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-400 font-medium">
                      CA &ge; 100k€ sans site web — lead potentiel prioritaire
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Infos complementaires */}
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {company.rating !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Note Google</span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {company.rating}/5 ({company.review_count} avis)
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Score GMB</span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${gmbConfig.color} ${gmbConfig.bgColor}`}
              >
                {gmbScore}% — {gmbConfig.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source</span>
              <span>{company.source_api || 'Ajout manuel'}</span>
            </div>
            {company.scraped_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date scraping</span>
                <span>
                  {new Date(company.scraped_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ajoutée le</span>
              <span>
                {new Date(company.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contacts lies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contacts liés ({contacts.length})
            </CardTitle>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/contacts/nouveau?company=${id}`}>+ Ajouter</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun contact lié à cette entreprise
              </p>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => {
                  const statusConfig =
                    STATUS_CONFIG[contact.status as ContactStatus]
                  return (
                    <Link
                      key={contact.id}
                      href={`/contacts/${contact.id}`}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {contact.position && (
                          <p className="text-xs text-muted-foreground truncate">
                            {contact.position}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {contact.deal_amount && (
                          <span className="text-xs font-medium">
                            {contact.deal_amount.toLocaleString('fr-FR')} €
                          </span>
                        )}
                        {statusConfig && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Devis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Devis ({quotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuoteMiniList
              quotes={quotes}
              newQuoteHref={`/devis/nouveau?company=${id}`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
    </CopilotProvider>
  )
}
