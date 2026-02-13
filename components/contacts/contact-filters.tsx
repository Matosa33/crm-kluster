'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { STATUS_ORDER, STATUS_CONFIG } from '@/lib/constants/status-config'
import { X } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface ContactFiltersProps {
  users: Pick<Profile, 'id' | 'full_name'>[]
}

export function ContactFilters({ users }: ContactFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.replace(`${pathname}?${params.toString()}`)
  }

  function clearFilters() {
    router.replace(pathname)
  }

  const hasFilters =
    searchParams.get('status') || searchParams.get('assignedTo')

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select
        value={searchParams.get('status') || 'all'}
        onValueChange={(v) => updateFilter('status', v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {STATUS_ORDER.map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_CONFIG[status].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('assignedTo') || 'all'}
        onValueChange={(v) => updateFilter('assignedTo', v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Tous les commerciaux" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les commerciaux</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}
