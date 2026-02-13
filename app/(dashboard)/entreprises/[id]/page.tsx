import Link from 'next/link'
import { getCompany } from '@/lib/actions/companies'
import { getContactsByCompany } from '@/lib/actions/contacts'
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
} from 'lucide-react'
import {
  WEBSITE_STATUS_CONFIG,
  WEBSITE_QUALITY_CONFIG,
} from '@/lib/constants/website-config'
import { STATUS_CONFIG } from '@/lib/constants/status-config'
import type { ContactStatus } from '@/lib/types'

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [company, contacts] = await Promise.all([
    getCompany(id),
    getContactsByCompany(id),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/entreprises">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{company.business_type}</Badge>
            <Badge variant="outline">{company.source_api || 'manual'}</Badge>
            {company.rating && (
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {company.rating}
              </Badge>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/entreprises/${id}/modifier`}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </CardContent>
        </Card>

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
                    <span className="text-sm text-muted-foreground">Qualité du site</span>
                    {(() => {
                      const config = WEBSITE_QUALITY_CONFIG[company.website_quality]
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contacts liés ({contacts.length})
            </CardTitle>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/contacts/nouveau`}>+ Ajouter</Link>
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
                  const statusConfig = STATUS_CONFIG[contact.status as ContactStatus]
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
                        {contact.job_title && (
                          <p className="text-xs text-muted-foreground truncate">
                            {contact.job_title}
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
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
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
      </div>
    </div>
  )
}
