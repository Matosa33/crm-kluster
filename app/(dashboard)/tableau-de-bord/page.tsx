import { getMorningCockpitData } from '@/lib/actions/dashboard'
import { StatsCard } from '@/components/dashboard/stats-card'
import { TodayAgenda } from '@/components/dashboard/today-agenda'
import { OverdueFollowups } from '@/components/dashboard/overdue-followups'
import { StaleDeals } from '@/components/dashboard/stale-deals'
import { PipelineMini } from '@/components/dashboard/pipeline-mini'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import {
  Euro,
  CheckCircle,
  CalendarClock,
  Users,
} from 'lucide-react'

export default async function DashboardPage() {
  const data = await getMorningCockpitData()

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ]
  const today = new Date()
  const dateStr = `${dayNames[today.getDay()]} ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Bonjour {data.userName.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">{dateStr}</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pipeline en cours"
          value={`${data.pipelineValue.toLocaleString('fr-FR')} \u20ac`}
          icon={Euro}
        />
        <StatsCard
          title="CA gagné"
          value={`${data.wonValue.toLocaleString('fr-FR')} \u20ac`}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Relances à faire"
          value={data.followups.length}
          icon={CalendarClock}
          variant="warning"
        />
        <StatsCard
          title="RDV aujourd'hui"
          value={data.todayActivities.length}
          icon={Users}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <TodayAgenda activities={data.todayActivities} />
          <PipelineMini
            statusCounts={data.statusCounts}
            pipelineValue={data.pipelineValue}
          />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <OverdueFollowups followups={data.followups} />
          <StaleDeals deals={data.staleDeals} />
        </div>
      </div>

      {/* Recent activity */}
      <RecentActivity activities={data.recentActivities} />
    </div>
  )
}
