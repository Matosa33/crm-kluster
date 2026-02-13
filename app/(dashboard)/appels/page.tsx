import { getCallsData } from '@/lib/actions/calls'
import { CallsList } from '@/components/appels/calls-list'
import { Phone, AlertTriangle, UserPlus } from 'lucide-react'

export default async function AppelsPage() {
  const contacts = await getCallsData()

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const overdueCount = contacts.filter(
    (c) => c.next_followup_at && new Date(c.next_followup_at) < now
  ).length

  const toContactCount = contacts.filter(
    (c) => c.status === 'a_contacter'
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Phone className="h-8 w-8 text-primary" />
          Appels
        </h1>
        <p className="text-muted-foreground mt-1">
          {contacts.length} contact{contacts.length > 1 ? 's' : ''} à appeler
        </p>
      </div>

      {/* KPI chips */}
      <div className="flex gap-3 flex-wrap">
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">
              {overdueCount} relance{overdueCount > 1 ? 's' : ''} en retard
            </span>
          </div>
        )}
        {toContactCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <UserPlus className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              {toContactCount} à contacter
            </span>
          </div>
        )}
        {contacts.length === 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-sm font-medium text-emerald-400">
              Aucun appel en attente — bien joué !
            </span>
          </div>
        )}
      </div>

      <CallsList contacts={contacts} />
    </div>
  )
}
