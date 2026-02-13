'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { searchAll } from '@/lib/actions/search'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Users, Building2, LayoutDashboard, Calendar, Search as SearchIcon,
  Settings, Plus, Phone, FileText,
} from 'lucide-react'

type SearchResult = {
  id: string
  type: 'contact' | 'company'
  name: string
  subtitle: string | null
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  // Ctrl+K / Cmd+K to open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setSearching(true)
      const data = await searchAll(query)
      setResults(data)
      setSearching(false)
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false)
      setQuery('')
      setResults([])
      command()
    },
    []
  )

  const contacts = results.filter((r) => r.type === 'contact')
  const companies = results.filter((r) => r.type === 'company')

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Rechercher contacts, entreprises, actions..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {searching ? 'Recherche...' : 'Aucun résultat.'}
        </CommandEmpty>

        {/* Search results */}
        {contacts.length > 0 && (
          <CommandGroup heading="Contacts">
            {contacts.map((r) => (
              <CommandItem
                key={r.id}
                onSelect={() => runCommand(() => router.push(`/contacts/${r.id}`))}
              >
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <div>
                  <span>{r.name}</span>
                  {r.subtitle && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {r.subtitle}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {companies.length > 0 && (
          <CommandGroup heading="Entreprises">
            {companies.map((r) => (
              <CommandItem
                key={r.id}
                onSelect={() => runCommand(() => router.push(`/entreprises/${r.id}`))}
              >
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <div>
                  <span>{r.name}</span>
                  {r.subtitle && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {r.subtitle}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Quick actions */}
        {!query && (
          <>
            <CommandGroup heading="Actions rapides">
              <CommandItem
                onSelect={() => runCommand(() => router.push('/contacts/nouveau'))}
              >
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                Nouveau contact
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/entreprises/nouvelle'))}
              >
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                Nouvelle entreprise
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/calendrier?view=day'))}
              >
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                Voir l&apos;agenda du jour
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => runCommand(() => router.push('/tableau-de-bord'))}
              >
                <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                Tableau de bord
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/contacts'))}
              >
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                Contacts
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/entreprises'))}
              >
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                Entreprises
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/calendrier'))}
              >
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                Calendrier
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/scraping'))}
              >
                <SearchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Scraping
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/parametres'))}
              >
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                Paramètres
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
