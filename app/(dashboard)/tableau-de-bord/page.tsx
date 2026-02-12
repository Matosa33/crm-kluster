import { getDashboardStats } from '@/lib/actions/dashboard'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { STATUS_CONFIG } from '@/lib/constants/status-config'
import { Users, Building2, Target, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const statusData = [
    { key: 'a_contacter' as const, count: stats.toContact },
    { key: 'contacte' as const, count: stats.contacted },
    { key: 'rdv_planifie' as const, count: stats.rdvPlanned },
    { key: 'devis_envoye' as const, count: stats.quotesSent },
    { key: 'gagne' as const, count: stats.won },
    { key: 'perdu' as const, count: stats.lost },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d&apos;ensemble de votre activite commerciale
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Contacts totaux"
          value={stats.totalContacts}
          icon={Users}
        />
        <StatsCard
          title="Entreprises"
          value={stats.totalCompanies}
          icon={Building2}
        />
        <StatsCard
          title="A contacter"
          value={stats.toContact}
          icon={Target}
          variant="warning"
        />
        <StatsCard
          title="Gagnes"
          value={stats.won}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline commercial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statusData.map(({ key, count }) => {
                  const config = STATUS_CONFIG[key]
                  const maxCount = Math.max(
                    ...statusData.map((s) => s.count),
                    1
                  )
                  const width = (count / maxCount) * 100
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{config.label}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${config.bgColor}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <RecentActivity activities={stats.recentActivities} />
        </div>
      </div>
    </div>
  )
}
