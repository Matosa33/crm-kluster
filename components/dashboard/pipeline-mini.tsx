import Link from 'next/link'
import { STATUS_CONFIG } from '@/lib/constants/status-config'
import type { ContactStatus } from '@/lib/types'

const STATUS_ORDER: ContactStatus[] = [
  'a_contacter', 'contacte', 'rdv_planifie', 'devis_envoye', 'gagne', 'perdu',
]

interface PipelineMiniProps {
  statusCounts: Record<string, number>
  pipelineValue: number
}

export function PipelineMini({ statusCounts, pipelineValue }: PipelineMiniProps) {
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Pipeline</h3>
        <span className="text-xs text-muted-foreground">
          {pipelineValue.toLocaleString('fr-FR')} € en cours
        </span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-white/[0.04]">
        {STATUS_ORDER.map((status) => {
          const count = statusCounts[status] || 0
          const width = (count / total) * 100
          if (!count) return null
          return (
            <div
              key={status}
              className={`${STATUS_CONFIG[status].accent} transition-all duration-500`}
              style={{ width: `${width}%` }}
              title={`${STATUS_CONFIG[status].label}: ${count}`}
            />
          )
        })}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 gap-2">
        {STATUS_ORDER.filter((s) => s !== 'perdu').map((status) => {
          const count = statusCounts[status] || 0
          const config = STATUS_CONFIG[status]
          return (
            <Link
              key={status}
              href={`/contacts?view=table&status=${status}`}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${config.accent}`} />
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
              <span className="text-xs font-medium">{count}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
