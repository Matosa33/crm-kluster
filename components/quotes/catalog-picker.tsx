'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type {
  CatalogCategory,
  CatalogSubcategory,
  CatalogItem,
  CatalogPack,
} from '@/lib/constants/catalog'
import { Search, Plus, Star, ChevronDown, ChevronRight, Package, Check } from 'lucide-react'

export function CatalogPicker({
  categories,
  subcategories,
  items,
  packs,
  onAddItem,
  onAddPack,
  addedItemIds,
}: {
  categories: CatalogCategory[]
  subcategories: CatalogSubcategory[]
  items: CatalogItem[]
  packs: CatalogPack[]
  onAddItem: (item: CatalogItem) => void
  onAddPack: (pack: CatalogPack) => void
  addedItemIds: Set<string>
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [showPacks, setShowPacks] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const toggleSub = (id: string) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Animated add feedback
  const handleAddItem = useCallback((item: CatalogItem) => {
    onAddItem(item)
    setJustAdded(item.id)
    setTimeout(() => setJustAdded(null), 1200)
  }, [onAddItem])

  const handleAddPack = useCallback((pack: CatalogPack) => {
    onAddPack(pack)
    setJustAdded(pack.id)
    setTimeout(() => setJustAdded(null), 1200)
  }, [onAddPack])

  // Search filter
  const searchLower = search.toLowerCase()
  const filteredItems = search.length > 1
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.subtitle.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      )
    : null

  const filteredPacks = packs.filter((p) => !p.isAgency)

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une prestation..."
            className="pl-10"
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Search results */}
        {filteredItems && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {filteredItems.length} résultat(s)
            </p>
            {filteredItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune prestation trouvée
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-on-hover">
                {filteredItems.map((item) => (
                  <CatalogItemRow
                    key={item.id}
                    item={item}
                    onAdd={() => handleAddItem(item)}
                    isAdded={addedItemIds.has(item.id)}
                    justAdded={justAdded === item.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category tabs + Packs */}
        {!filteredItems && (
          <>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                    setShowPacks(false)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    selectedCategory === cat.id
                      ? cat.color + ' border-current'
                      : 'border-white/10 text-muted-foreground hover:bg-white/[0.04]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setShowPacks(!showPacks)
                  setSelectedCategory(null)
                }}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-1.5 ${
                  showPacks
                    ? 'bg-violet-500/15 text-violet-400 border-violet-500/20'
                    : 'border-white/10 text-muted-foreground hover:bg-white/[0.04]'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                Packs
              </button>
            </div>

            {/* Packs view */}
            {showPacks && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-on-hover">
                {filteredPacks.map((pack) => {
                  const isJustAdded = justAdded === pack.id
                  return (
                    <div
                      key={pack.id}
                      className={`flex items-start justify-between p-3 rounded-lg border transition-all ${
                        isJustAdded
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{pack.name}</p>
                          {pack.isPopular && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              Populaire
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{pack.subtitle}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {pack.includes.join(' + ')}
                        </p>
                        {pack.savings && (
                          <p className="text-xs text-emerald-400 mt-1">
                            Économie : {pack.savings}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-sm font-semibold">{pack.priceLabel}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddPack(pack)}
                          className={isJustAdded ? 'border-emerald-500/30 text-emerald-400' : ''}
                        >
                          {isJustAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* No category selected hint */}
            {!selectedCategory && !showPacks && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Choisissez une catégorie pour parcourir le catalogue
              </p>
            )}

            {/* Subcategories + items */}
            {selectedCategory && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-on-hover">
                {subcategories
                  .filter((sub) => sub.categoryId === selectedCategory)
                  .map((sub) => {
                    const subItems = items.filter((i) => i.subcategoryId === sub.id)
                    const isExpanded = expandedSubs.has(sub.id)
                    const addedCount = subItems.filter((i) => addedItemIds.has(i.id)).length

                    return (
                      <div key={sub.id} className="border border-white/[0.06] rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleSub(sub.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-white/[0.04] transition-colors text-left"
                        >
                          <div>
                            <p className="text-sm font-medium">{sub.label}</p>
                            <p className="text-xs text-muted-foreground">{sub.subtitle}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {addedCount > 0 && (
                              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                {addedCount} ajouté{addedCount > 1 ? 's' : ''}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px]">
                              {subItems.length}
                            </Badge>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-white/[0.06] divide-y divide-white/[0.04]">
                            {subItems.map((item) => (
                              <CatalogItemRow
                                key={item.id}
                                item={item}
                                onAdd={() => handleAddItem(item)}
                                isAdded={addedItemIds.has(item.id)}
                                justAdded={justAdded === item.id}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function CatalogItemRow({
  item,
  onAdd,
  isAdded,
  justAdded,
}: {
  item: CatalogItem
  onAdd: () => void
  isAdded: boolean
  justAdded: boolean
}) {
  return (
    <div className={`flex items-start justify-between p-3 transition-all ${
      justAdded
        ? 'bg-emerald-500/10'
        : isAdded
          ? 'bg-white/[0.02]'
          : 'hover:bg-white/[0.04]'
    }`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${isAdded && !justAdded ? 'text-muted-foreground' : ''}`}>
            {item.name}
          </p>
          {item.isPopular && (
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          )}
          {isAdded && !justAdded && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
              dans le devis
            </span>
          )}
          {justAdded && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 animate-pulse">
              Ajouté !
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="text-sm font-semibold whitespace-nowrap">{item.priceLabel}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={onAdd}
          disabled={item.priceHT === null}
          className={justAdded ? 'border-emerald-500/30 text-emerald-400' : ''}
        >
          {justAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  )
}
