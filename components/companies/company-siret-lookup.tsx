'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { searchCompanyBySiretOrName, type SiretResult } from '@/lib/actions/siret'
import { updateCompanySiret } from '@/lib/actions/companies'
import { Search, Loader2, Building2, ShieldCheck, User, TrendingUp } from 'lucide-react'

interface CompanySiretLookupProps {
  companyId: string
  companyName: string
  companyCity?: string
}

function InfoRow({
  label,
  value,
  mono,
  highlight,
}: {
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-right ${mono ? 'font-mono text-xs' : ''} ${highlight ? 'text-emerald-400 font-semibold' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace('.0', '')} M€`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} k€`
  }
  return `${value.toLocaleString('fr-FR')} €`
}

export function CompanySiretLookup({
  companyId,
  companyName,
  companyCity,
}: CompanySiretLookupProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SiretResult[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [selected, setSelected] = useState<SiretResult | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (value: string) => {
    setQuery(value)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (value.length < 3) {
      setResults([])
      setShowResults(false)
      return
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)

      const res = await searchCompanyBySiretOrName(value)

      if (res.error) {
        setError(res.error)
        setResults([])
      } else {
        setResults(res.results)
      }

      setShowResults(true)
      setLoading(false)
    }, 400)
  }

  const handleSelect = (result: SiretResult) => {
    setSelected(result)
    setShowResults(false)
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    if (!selected) return
    setSaving(true)

    const dirigeant = selected.dirigeants.length > 0 ? selected.dirigeants[0] : null

    try {
      await updateCompanySiret(companyId, {
        siret: selected.siret,
        siren: selected.siren,
        legal_name: selected.legalName,
        legal_form: selected.legalForm,
        naf_code: selected.nafCode,
        naf_label: selected.nafLabel,
        headquarters_address: selected.address,
        chiffre_affaires: selected.chiffreAffaires,
        resultat_net: selected.resultatNet,
        effectif: selected.effectif,
        date_creation_entreprise: selected.dateCreation,
        categorie_entreprise: selected.categorieEntreprise,
        dirigeant: dirigeant
          ? {
              nom: dirigeant.nom,
              prenoms: dirigeant.prenoms,
              qualite: dirigeant.qualite,
            }
          : null,
      })
      setShowConfirm(false)
      setQuery('')
      router.refresh()
    } catch {
      setError('Erreur lors de la sauvegarde')
      setSaving(false)
    }
  }

  const dirigeant = selected?.dirigeants?.[0]
  const hasFinances = selected?.chiffreAffaires != null || selected?.effectif || selected?.categorieEntreprise

  return (
    <>
      <div className="space-y-2" ref={containerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={`Rechercher "${companyName}" ou un SIRET...`}
            className="pl-9"
            onFocus={() => {
              if (results.length > 0) setShowResults(true)
              if (!query) handleSearch(companyCity ? `${companyName} ${companyCity}` : companyName)
            }}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}

          {showResults && (results.length > 0 || error) && (
            <div className="absolute z-50 w-full mt-1 rounded-lg border border-white/10 overflow-hidden max-h-72 overflow-y-auto bg-[oklch(0.15_0.02_280)] shadow-xl">
              {error && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  {error}
                </div>
              )}
              {results.map((result, i) => (
                <button
                  key={`${result.siret}-${i}`}
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm hover:bg-white/[0.08] transition-colors"
                  onClick={() => handleSelect(result)}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{result.legalName}</p>
                      <p className="text-xs text-muted-foreground">
                        SIRET : {result.siret}
                        {result.nafLabel && ` — ${result.nafLabel}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.address && `${result.address}, `}
                        {result.postalCode} {result.city}
                      </p>
                      {result.dirigeants.length > 0 && (
                        <p className="text-xs text-primary/70 mt-0.5">
                          {result.dirigeants[0].qualite || 'Dirigeant'} : {result.dirigeants[0].prenoms} {result.dirigeants[0].nom}
                        </p>
                      )}
                    </div>
                    {result.chiffreAffaires != null && (
                      <span className="text-xs text-emerald-400 font-medium shrink-0">
                        CA {formatCurrency(result.chiffreAffaires)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {results.length === 0 && !error && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  Aucun résultat trouvé
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          API entreprise.data.gouv.fr — Données publiques INSEE
        </p>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Confirmer les informations SIRET
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-sm py-2">
              <p className="text-muted-foreground text-xs">
                Voulez-vous associer ces informations légales à{' '}
                <strong className="text-foreground">{companyName}</strong> ?
              </p>

              {/* Legal info */}
              <div className="space-y-2">
                <InfoRow label="Raison sociale" value={selected.legalName} />
                <InfoRow label="SIRET" value={selected.siret} mono />
                <InfoRow label="SIREN" value={selected.siren} mono />
                <InfoRow label="Forme juridique" value={selected.legalForm} />
                {selected.nafCode && (
                  <InfoRow
                    label="Code NAF"
                    value={`${selected.nafCode}${selected.nafLabel ? ` — ${selected.nafLabel}` : ''}`}
                  />
                )}
                <InfoRow
                  label="Adresse siège"
                  value={`${selected.address}, ${selected.postalCode} ${selected.city}`}
                />
              </div>

              {/* Dirigeant */}
              {dirigeant && (
                <>
                  <Separator className="bg-white/[0.06]" />
                  <div className="space-y-2">
                    <p className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      Dirigeant — sera créé comme contact
                    </p>
                    <InfoRow
                      label={dirigeant.qualite || 'Dirigeant'}
                      value={`${dirigeant.prenoms} ${dirigeant.nom}`}
                    />
                  </div>
                </>
              )}

              {/* Financial data */}
              {hasFinances && (
                <>
                  <Separator className="bg-white/[0.06]" />
                  <div className="space-y-2">
                    <p className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Données financières
                    </p>
                    {selected.chiffreAffaires != null && (
                      <InfoRow
                        label="Chiffre d'affaires"
                        value={formatCurrency(selected.chiffreAffaires)}
                        highlight
                      />
                    )}
                    {selected.resultatNet != null && (
                      <InfoRow
                        label="Résultat net"
                        value={formatCurrency(selected.resultatNet)}
                        highlight={selected.resultatNet > 0}
                      />
                    )}
                    {selected.effectif && (
                      <InfoRow label="Effectif" value={selected.effectif} />
                    )}
                    {selected.categorieEntreprise && (
                      <InfoRow
                        label="Catégorie"
                        value={selected.categorieEntreprise}
                      />
                    )}
                    {selected.dateCreation && (
                      <InfoRow
                        label="Création"
                        value={new Date(selected.dateCreation).toLocaleDateString('fr-FR')}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={handleConfirm} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Confirmer et enregistrer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
