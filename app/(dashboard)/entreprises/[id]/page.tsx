import Link from 'next/link'
import { getCompany } from '@/lib/actions/companies'
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
} from 'lucide-react'

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const company = await getCompany(id)

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
              Coordonnees
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
              <span className="text-muted-foreground">Ajoutee le</span>
              <span>
                {new Date(company.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
