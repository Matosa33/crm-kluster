import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const variantStyles = {
  default: 'bg-indigo-500/20 text-indigo-400 glow-indigo',
  success: 'bg-emerald-500/20 text-emerald-400 glow-emerald',
  warning: 'bg-amber-500/20 text-amber-400 glow-amber',
  danger: 'bg-rose-500/20 text-rose-400 glow-rose',
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
}: StatsCardProps) {
  return (
    <div className="glass-card rounded-xl p-6 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl', variantStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
