import { getScrapeJobs } from '@/lib/actions/scraping'
import { ScrapeForm } from '@/components/scraping/scrape-form'
import { ScrapeJobList } from '@/components/scraping/scrape-job-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, History } from 'lucide-react'

export default async function ScrapingPage() {
  const jobs = await getScrapeJobs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recherche de leads</h1>
        <p className="text-muted-foreground mt-1">
          Trouvez de nouvelles entreprises via Google Maps
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Nouvelle recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrapeForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Historique des recherches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrapeJobList jobs={jobs} />
        </CardContent>
      </Card>
    </div>
  )
}
