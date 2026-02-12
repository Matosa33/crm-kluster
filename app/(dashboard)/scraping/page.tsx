import { getScrapeJobs } from '@/lib/actions/scraping'
import { ScrapeForm } from '@/components/scraping/scrape-form'
import { ScrapeJobList } from '@/components/scraping/scrape-job-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ScrapingPage() {
  const jobs = await getScrapeJobs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scraping</h1>
        <p className="text-muted-foreground mt-1">
          Rechercher des entreprises via les APIs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrapeForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des recherches</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrapeJobList jobs={jobs} />
        </CardContent>
      </Card>
    </div>
  )
}
