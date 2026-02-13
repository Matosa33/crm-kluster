'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { quickCreateContact } from '@/lib/actions/contacts'
import { Plus } from 'lucide-react'
import { FuzzySelect } from '@/components/shared/fuzzy-select'
import type { ContactStatus } from '@/lib/types'

interface KanbanQuickAddProps {
  status: ContactStatus
  companies: { id: string; name: string }[]
}

export function KanbanQuickAdd({ status, companies }: KanbanQuickAddProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    await quickCreateContact({
      first_name: name.trim(),
      company_id: companyId || null,
      status,
    })
    setName('')
    setCompanyId('')
    setExpanded(false)
    setLoading(false)
    router.refresh()
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04] rounded-lg transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Ajouter
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card rounded-lg p-3 space-y-2"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom du contact"
        className="w-full text-sm bg-white/[0.06] border border-white/10 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50"
        autoFocus
      />
      <FuzzySelect
        options={companies.map((c) => ({ value: c.id, label: c.name }))}
        value={companyId}
        onChange={setCompanyId}
        placeholder="Rechercher entreprise..."
        emptyLabel="Entreprise (optionnel)"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex-1 text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded-md px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Créer'}
        </button>
        <button
          type="button"
          onClick={() => {
            setExpanded(false)
            setName('')
            setCompanyId('')
          }}
          className="text-xs text-muted-foreground hover:text-foreground px-2 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
