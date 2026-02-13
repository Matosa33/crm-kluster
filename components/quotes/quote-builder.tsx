'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createQuote, type CreateQuoteInput } from '@/lib/actions/quotes'
import {
  CATALOG_CATEGORIES,
  CATALOG_SUBCATEGORIES,
  CATALOG_ITEMS,
  CATALOG_PACKS,
  type CatalogItem,
  type CatalogPack,
} from '@/lib/constants/catalog'
import { CatalogPicker } from './catalog-picker'
import { QuoteLineEditor } from './quote-line-editor'
import { SiretLookup } from './siret-lookup'
import { fuzzySearchItems } from '@/lib/utils/fuzzy-search'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Building2,
  ShoppingCart,
  Calculator,
  Loader2,
  Plus,
  Package,
  Users,
} from 'lucide-react'

type QuoteLine = {
  id: string
  catalogItemId?: string | null
  label: string
  description: string
  quantity: number
  unitPriceHT: number
  discountPercent: number
  unitLabel: string
  section: string
}

type ClientInfo = {
  companyId: string | null
  contactId: string | null
  clientName: string
  clientAddress: string
  clientSiret: string
  clientVatNumber: string
}

const STEPS = [
  { id: 'client', label: 'Client', icon: Building2 },
  { id: 'prestations', label: 'Prestations', icon: ShoppingCart },
  { id: 'recap', label: 'Récapitulatif', icon: Calculator },
] as const

type Step = (typeof STEPS)[number]['id']

export function QuoteBuilder({
  companies,
  contacts,
  preselectedCompanyId,
  preselectedContactId,
}: {
  companies: { id: string; name: string; siret?: string | null; address?: string | null; city?: string; vat_number?: string | null }[]
  contacts: { id: string; first_name: string | null; last_name: string | null; company_id: string | null }[]
  preselectedCompanyId?: string
  preselectedContactId?: string
}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('client')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Client info
  const [client, setClient] = useState<ClientInfo>(() => {
    const company = companies.find((c) => c.id === preselectedCompanyId)
    return {
      companyId: preselectedCompanyId || null,
      contactId: preselectedContactId || null,
      clientName: company?.name || '',
      clientAddress: company?.address ? `${company.address}, ${company.city || ''}` : '',
      clientSiret: company?.siret || '',
      clientVatNumber: company?.vat_number || '',
    }
  })

  // Fuzzy search state
  const [companySearch, setCompanySearch] = useState('')
  const [showCompanies, setShowCompanies] = useState(false)
  const companyRef = useRef<HTMLDivElement>(null)

  const [contactSearch, setContactSearch] = useState('')
  const [showContacts, setShowContacts] = useState(false)
  const contactRef = useRef<HTMLDivElement>(null)

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setShowCompanies(false)
      }
      if (contactRef.current && !contactRef.current.contains(e.target as Node)) {
        setShowContacts(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fuzzy search results
  const filteredCompanies = fuzzySearchItems(
    companySearch,
    companies,
    (c) => [c.name, c.siret || '', c.city || ''],
    10
  )

  // Lines
  const [lines, setLines] = useState<QuoteLine[]>([])

  // Global discount
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [tvaRate, setTvaRate] = useState(20)
  const [notes, setNotes] = useState('')

  // Track which catalog items are already added
  const addedItemIds = new Set(
    lines.map((l) => l.catalogItemId).filter((id): id is string => id != null)
  )

  // Computed totals
  const totalHT = lines.reduce((sum, l) => {
    const lineTotal = l.quantity * l.unitPriceHT * (1 - l.discountPercent / 100)
    return sum + lineTotal
  }, 0)
  const discountAmount = totalHT * globalDiscount / 100
  const totalAfterDiscount = totalHT - discountAmount
  const totalTVA = totalAfterDiscount * tvaRate / 100
  const totalTTC = totalAfterDiscount + totalTVA

  // Add items from catalog
  const addCatalogItem = useCallback((item: CatalogItem) => {
    const category = CATALOG_CATEGORIES.find((c) => c.id === item.categoryId)
    setLines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        catalogItemId: item.id,
        label: item.name,
        description: item.subtitle,
        quantity: 1,
        unitPriceHT: item.priceHT || 0,
        discountPercent: 0,
        unitLabel: item.priceUnit?.replace('/', '') || 'unité',
        section: category?.label || '',
      },
    ])
  }, [])

  // Add pack
  const addPack = useCallback((pack: CatalogPack) => {
    // Try to resolve pack items to catalog items
    const newLines: QuoteLine[] = pack.includes.map((includeName) => {
      // Find matching catalog item
      const match = CATALOG_ITEMS.find((item) =>
        includeName.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(includeName.toLowerCase().replace(/ \(.*\)/, ''))
      )

      return {
        id: crypto.randomUUID(),
        catalogItemId: match?.id || null,
        label: includeName,
        description: '',
        quantity: 1,
        unitPriceHT: 0, // Will be overridden by pack pricing
        discountPercent: 0,
        unitLabel: 'unité',
        section: `Pack ${pack.name}`,
      }
    })

    // Add pack as a single line
    setLines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        catalogItemId: null,
        label: pack.name,
        description: pack.subtitle + ' — ' + pack.includes.join(' + '),
        quantity: 1,
        unitPriceHT: pack.priceHT,
        discountPercent: 0,
        unitLabel: 'unité',
        section: 'Packs',
      },
    ])

    // Suppress unused variable warning
    void newLines
  }, [])

  // Add custom line
  const addCustomLine = useCallback(() => {
    setLines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        catalogItemId: null,
        label: '',
        description: '',
        quantity: 1,
        unitPriceHT: 0,
        discountPercent: 0,
        unitLabel: 'unité',
        section: 'Personnalisé',
      },
    ])
  }, [])

  // Update line
  const updateLine = useCallback((id: string, updates: Partial<QuoteLine>) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    )
  }, [])

  // Remove line
  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }, [])

  // Company select handler
  const handleCompanySelect = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId)
    if (company) {
      setClient((prev) => ({
        ...prev,
        companyId,
        clientName: company.name,
        clientAddress: company.address ? `${company.address}, ${company.city || ''}` : prev.clientAddress,
        clientSiret: company.siret || prev.clientSiret,
        clientVatNumber: company.vat_number || prev.clientVatNumber,
      }))
    }
  }

  // SIRET lookup handler
  const handleSiretFound = (data: {
    siret: string
    legalName: string
    address: string
    city: string
    postalCode: string
    nafCode: string
    nafLabel: string
  }) => {
    // Compute TVA intracommunautaire from SIREN (first 9 digits of SIRET)
    const siren = data.siret.replace(/\s/g, '').slice(0, 9)
    let vatNumber = ''
    if (/^\d{9}$/.test(siren)) {
      const sirenNum = parseInt(siren, 10)
      const key = (12 + 3 * (sirenNum % 97)) % 97
      vatNumber = `FR${key.toString().padStart(2, '0')}${siren}`
    }

    setClient((prev) => ({
      ...prev,
      clientName: data.legalName || prev.clientName,
      clientAddress: data.address ? `${data.address}, ${data.postalCode} ${data.city}` : prev.clientAddress,
      clientSiret: data.siret,
      clientVatNumber: vatNumber || prev.clientVatNumber,
    }))
  }

  // Submit
  const handleSubmit = async () => {
    if (lines.length === 0) {
      setError('Ajoutez au moins une prestation')
      return
    }

    setLoading(true)
    setError(null)

    const input: CreateQuoteInput = {
      companyId: client.companyId,
      contactId: client.contactId,
      clientName: client.clientName,
      clientAddress: client.clientAddress,
      clientSiret: client.clientSiret,
      clientVatNumber: client.clientVatNumber,
      notes,
      discountPercent: globalDiscount,
      tvaRate,
      lines: lines.map((l) => ({
        catalogItemId: l.catalogItemId,
        label: l.label,
        description: l.description,
        quantity: l.quantity,
        unitPriceHT: l.unitPriceHT,
        discountPercent: l.discountPercent,
        unitLabel: l.unitLabel,
        section: l.section,
      })),
    }

    const result = await createQuote(input)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(`/devis/${result.id}`)
  }

  const canProceed = step === 'client'
    ? client.clientName.length > 0
    : step === 'prestations'
      ? lines.length > 0
      : true

  const companyContacts = client.companyId
    ? contacts.filter((c) => c.company_id === client.companyId)
    : contacts

  const filteredContacts = fuzzySearchItems(
    contactSearch,
    companyContacts,
    (c) => [`${c.first_name || ''} ${c.last_name || ''}`.trim()],
    10
  )

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const isCurrent = s.id === step
          const isPast = STEPS.findIndex((x) => x.id === step) > i
          return (
            <div key={s.id} className="flex items-center gap-2">
              {i > 0 && <div className={`h-px w-8 ${isPast ? 'bg-primary' : 'bg-white/10'}`} />}
              <button
                onClick={() => {
                  const currentIdx = STEPS.findIndex((x) => x.id === step)
                  if (i <= currentIdx) setStep(s.id)
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isCurrent
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : isPast
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-muted-foreground'
                }`}
              >
                {isPast ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <s.icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Step: Client */}
      {step === 'client' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Company select */}
              <div className="space-y-2" ref={companyRef}>
                <Label>Entreprise existante (optionnel)</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={client.companyId
                      ? companies.find((c) => c.id === client.companyId)?.name || companySearch
                      : companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value)
                      if (client.companyId) {
                        setClient((prev) => ({ ...prev, companyId: null }))
                      }
                      setShowCompanies(true)
                    }}
                    onFocus={() => setShowCompanies(true)}
                    placeholder="Rechercher une entreprise..."
                    className="pl-10"
                  />
                  {showCompanies && filteredCompanies.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 rounded-lg border border-white/10 overflow-hidden max-h-60 overflow-y-auto bg-[oklch(0.15_0.02_280)] shadow-xl">
                      {filteredCompanies.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/[0.08] transition-colors flex items-center gap-3"
                          onClick={() => {
                            handleCompanySelect(c.id)
                            setCompanySearch('')
                            setShowCompanies(false)
                          }}
                        >
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{c.name}</span>
                          {c.city && (
                            <span className="text-muted-foreground ml-auto text-xs shrink-0">
                              {c.city}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SIRET Lookup */}
              <SiretLookup onSelect={handleSiretFound} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du client / Raison sociale *</Label>
                  <Input
                    value={client.clientName}
                    onChange={(e) => setClient((prev) => ({ ...prev, clientName: e.target.value }))}
                    placeholder="ACME Corporation"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>SIRET</Label>
                  <Input
                    value={client.clientSiret}
                    onChange={(e) => setClient((prev) => ({ ...prev, clientSiret: e.target.value }))}
                    placeholder="123 456 789 00012"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  value={client.clientAddress}
                  onChange={(e) => setClient((prev) => ({ ...prev, clientAddress: e.target.value }))}
                  placeholder="12 rue de la Paix, 75002 Paris"
                />
              </div>

              <div className="space-y-2">
                <Label>N° TVA intracommunautaire</Label>
                <Input
                  value={client.clientVatNumber}
                  onChange={(e) => setClient((prev) => ({ ...prev, clientVatNumber: e.target.value }))}
                  placeholder="FR12345678901"
                />
              </div>

              {/* Contact select */}
              {companyContacts.length > 0 && (
                <div className="space-y-2" ref={contactRef}>
                  <Label>Contact associé (optionnel)</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={client.contactId
                        ? (() => {
                            const c = contacts.find((c) => c.id === client.contactId)
                            return c ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : contactSearch
                          })()
                        : contactSearch}
                      onChange={(e) => {
                        setContactSearch(e.target.value)
                        if (client.contactId) {
                          setClient((prev) => ({ ...prev, contactId: null }))
                        }
                        setShowContacts(true)
                      }}
                      onFocus={() => setShowContacts(true)}
                      placeholder="Rechercher un contact..."
                      className="pl-10"
                    />
                    {showContacts && filteredContacts.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 rounded-lg border border-white/10 overflow-hidden max-h-60 overflow-y-auto bg-[oklch(0.15_0.02_280)] shadow-xl">
                        {filteredContacts.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/[0.08] transition-colors flex items-center gap-3"
                            onClick={() => {
                              setClient((prev) => ({ ...prev, contactId: c.id }))
                              setContactSearch('')
                              setShowContacts(false)
                            }}
                          >
                            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">
                              {c.first_name} {c.last_name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Prestations */}
      {step === 'prestations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Catalog picker */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              <CatalogPicker
                categories={CATALOG_CATEGORIES}
                subcategories={CATALOG_SUBCATEGORIES}
                items={CATALOG_ITEMS}
                packs={CATALOG_PACKS}
                onAddItem={addCatalogItem}
                onAddPack={addPack}
                addedItemIds={addedItemIds}
              />
            </div>

            {/* Right: Added lines */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Lignes du devis ({lines.length})
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={addCustomLine}>
                    <Plus className="mr-1 h-3 w-3" />
                    Ligne libre
                  </Button>
                </CardHeader>
                <CardContent>
                  {lines.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Sélectionnez des prestations dans le catalogue
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {lines.map((line) => (
                        <QuoteLineEditor
                          key={line.id}
                          line={line}
                          onUpdate={(updates) => updateLine(line.id, updates)}
                          onRemove={() => removeLine(line.id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Running total */}
              {lines.length > 0 && (
                <div className="sticky bottom-0 rounded-lg border border-white/[0.08] bg-[oklch(0.15_0.02_280)]/95 backdrop-blur-sm p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {lines.length} prestation{lines.length > 1 ? 's' : ''}
                      </span>
                      <span className="text-muted-foreground">
                        Total HT : <span className="text-foreground font-medium">{totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                      </span>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      {totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € TTC
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step: Recap */}
      {step === 'recap' && (
        <div className="space-y-6">
          {/* Client summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{client.clientName}</p>
              {client.clientAddress && <p className="text-muted-foreground">{client.clientAddress}</p>}
              {client.clientSiret && <p className="text-muted-foreground">SIRET : {client.clientSiret}</p>}
            </CardContent>
          </Card>

          {/* Lines summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Prestations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-white/[0.06]">
                {lines.map((line) => {
                  const lineTotal = line.quantity * line.unitPriceHT * (1 - line.discountPercent / 100)
                  return (
                    <div key={line.id} className="flex justify-between py-2.5 text-sm">
                      <div>
                        <p className="font-medium">{line.label}</p>
                        {line.description && (
                          <p className="text-xs text-muted-foreground">{line.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {line.quantity} x {line.unitPriceHT.toLocaleString('fr-FR')} €
                          {line.discountPercent > 0 && ` (-${line.discountPercent}%)`}
                        </p>
                      </div>
                      <span className="font-medium shrink-0 ml-4">
                        {lineTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Financial summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Totaux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Remise globale (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taux TVA</Label>
                  <div className="flex gap-2">
                    {[
                      { rate: 20, label: '20%', desc: 'Standard' },
                      { rate: 10, label: '10%', desc: 'Intermédiaire' },
                      { rate: 5.5, label: '5,5%', desc: 'Réduit' },
                      { rate: 0, label: '0%', desc: 'Exonéré / Autoliq.' },
                    ].map((opt) => (
                      <button
                        key={opt.rate}
                        type="button"
                        onClick={() => setTvaRate(opt.rate)}
                        className={`flex-1 py-2 px-1 rounded-lg border text-center transition-colors ${
                          tvaRate === opt.rate
                            ? 'bg-primary/15 text-primary border-primary/30'
                            : 'border-white/10 text-muted-foreground hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className="text-sm font-medium block">{opt.label}</span>
                        <span className="text-[10px] block mt-0.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes / Conditions particulières</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[80px] rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm resize-y"
                  placeholder="Notes à ajouter au devis..."
                />
              </div>

              <div className="border-t border-white/[0.06] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total HT</span>
                  <span>{totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
                {globalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>Remise ({globalDiscount}%)</span>
                    <span>-{discountAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                  </div>
                )}
                {globalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total après remise</span>
                    <span>{totalAfterDiscount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA ({tvaRate}%)</span>
                  <span>{totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/[0.06]">
                  <span>Total TTC</span>
                  <span className="text-primary">
                    {totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm px-4 py-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const idx = STEPS.findIndex((s) => s.id === step)
            if (idx > 0) setStep(STEPS[idx - 1].id)
            else router.back()
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 'client' ? 'Annuler' : 'Précédent'}
        </Button>

        {step === 'recap' ? (
          <Button onClick={handleSubmit} disabled={loading || !canProceed}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Créer le devis
              </>
            )}
          </Button>
        ) : (
          <Button onClick={() => {
            const idx = STEPS.findIndex((s) => s.id === step)
            setStep(STEPS[idx + 1].id)
          }} disabled={!canProceed}>
            Suivant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
