'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlidersHorizontal, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

export interface FilterState {
  minPrice?: number
  maxPrice?: number
  taille?: string[] // Changed to array for multiple selections
  inStock?: boolean
  couleur?: string
  categorie?: string // Only for global search
}

interface ProductFilterProps {
  onFilterChange: (filters: FilterState) => void
  currentFilters: FilterState
  categoryName?: string // If provided, this is a category-specific filter
  basePath?: string // For global search
}

export default function ProductFilter({
  onFilterChange,
  currentFilters,
  categoryName,
  basePath = '',
}: ProductFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters)
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  // Fetch filter options dynamically
  const { data: filterOptions } = useQuery({
    queryKey: ['filter-options', categoryName],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (categoryName) {
        params.set('categorie', categoryName)
      }
      const response = await fetch(`/api/produits/filter-options?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch filter options')
      const result = await response.json()
      return result.data
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Count active filters
  useEffect(() => {
    let count = 0
    if (localFilters.minPrice !== undefined && localFilters.minPrice > 0) count++
    if (localFilters.maxPrice !== undefined && localFilters.maxPrice < (filterOptions?.maxPrice || Infinity)) count++
    if (localFilters.taille && localFilters.taille.length > 0) count++
    if (localFilters.inStock !== undefined) count++
    if (localFilters.couleur) count++
    if (localFilters.categorie && !categoryName) count++ // Only count category if not in category page
    setActiveFilterCount(count)
  }, [localFilters, filterOptions, categoryName])

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
    setIsOpen(false)
  }

  const handleResetFilters = () => {
    const resetFilters: FilterState = {}
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
    setIsOpen(false)
  }

  const hasActiveFilters = activeFilterCount > 0

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'relative',
            hasActiveFilters && 'bg-dore/10 border-dore'
          )}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filtrer
          {hasActiveFilters && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-dore text-charbon rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtres</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Price Range */}
          {filterOptions && (
            <div>
              <Label className="mb-3 block">Prix</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor="minPrice" className="text-xs text-muted-foreground mb-1 block">
                    Min
                  </Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder={`${filterOptions.minPrice} DH`}
                    value={localFilters.minPrice || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        minPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    min={filterOptions.minPrice}
                    max={filterOptions.maxPrice}
                  />
                </div>
                <div className="pt-6">-</div>
                <div className="flex-1">
                  <Label htmlFor="maxPrice" className="text-xs text-muted-foreground mb-1 block">
                    Max
                  </Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder={`${filterOptions.maxPrice} DH`}
                    value={localFilters.maxPrice || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        maxPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    min={filterOptions.minPrice}
                    max={filterOptions.maxPrice}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Taille - Multiple selection with checkboxes */}
          {filterOptions && filterOptions.tailles && filterOptions.tailles.length > 0 && (
            <div>
              <Label>Taille</Label>
              <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto">
                {filterOptions.tailles.map((taille: string) => {
                  const isChecked = localFilters.taille?.includes(taille) || false
                  return (
                    <div key={taille} className="flex items-center gap-2">
                      <Checkbox
                        id={`taille-${taille}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const currentTailles = localFilters.taille || []
                          if (checked) {
                            setLocalFilters({
                              ...localFilters,
                              taille: [...currentTailles, taille],
                            })
                          } else {
                            setLocalFilters({
                              ...localFilters,
                              taille: currentTailles.filter((t) => t !== taille),
                            })
                          }
                        }}
                      />
                      <Label
                        htmlFor={`taille-${taille}`}
                        className="font-normal cursor-pointer text-sm"
                      >
                        {taille}
                      </Label>
                    </div>
                  )
                })}
              </div>
              {localFilters.taille && localFilters.taille.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => {
                    setLocalFilters({
                      ...localFilters,
                      taille: undefined,
                    })
                  }}
                >
                  <X className="w-3 h-3 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          )}

          {/* Stock */}
          <div>
            <Label>Stock</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="inStock"
                  checked={localFilters.inStock === true}
                  onCheckedChange={(checked) =>
                    setLocalFilters({
                      ...localFilters,
                      inStock: checked === true ? true : undefined,
                    })
                  }
                />
                <Label htmlFor="inStock" className="font-normal cursor-pointer">
                  En stock
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="outOfStock"
                  checked={localFilters.inStock === false}
                  onCheckedChange={(checked) =>
                    setLocalFilters({
                      ...localFilters,
                      inStock: checked === true ? false : undefined,
                    })
                  }
                />
                <Label htmlFor="outOfStock" className="font-normal cursor-pointer">
                  Rupture de stock
                </Label>
              </div>
            </div>
          </div>

          {/* Couleurs */}
          {filterOptions && filterOptions.couleurs && filterOptions.couleurs.length > 0 && (
            <div>
              <Label htmlFor="couleur">Couleur</Label>
              <Select
                value={localFilters.couleur || 'all'}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    couleur: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger id="couleur">
                  <SelectValue placeholder="Toutes les couleurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les couleurs</SelectItem>
                  {filterOptions.couleurs.map((couleur: string) => (
                    <SelectItem key={couleur} value={couleur}>
                      {couleur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Categories - Only for global search */}
          {!categoryName && filterOptions && filterOptions.categories && filterOptions.categories.length > 0 && (
            <div>
              <Label htmlFor="categorie">Catégorie</Label>
              <Select
                value={localFilters.categorie || 'all'}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    categorie: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger id="categorie">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {filterOptions.categories.map((categorie: string) => (
                    <SelectItem key={categorie} value={categorie}>
                      {categorie}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {localFilters.minPrice !== undefined && localFilters.minPrice > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                    <span>Prix min: {localFilters.minPrice} DH</span>
                    <button
                      onClick={() =>
                        setLocalFilters({ ...localFilters, minPrice: undefined })
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {localFilters.maxPrice !== undefined && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                    <span>Prix max: {localFilters.maxPrice} DH</span>
                    <button
                      onClick={() =>
                        setLocalFilters({ ...localFilters, maxPrice: undefined })
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {localFilters.taille && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                    <span>Taille: {localFilters.taille}</span>
                    <button
                      onClick={() => setLocalFilters({ ...localFilters, taille: undefined })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {localFilters.inStock !== undefined && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                    <span>{localFilters.inStock ? 'En stock' : 'Rupture'}</span>
                    <button
                      onClick={() => setLocalFilters({ ...localFilters, inStock: undefined })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {localFilters.couleur && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                    <span>Couleur: {localFilters.couleur}</span>
                    <button
                      onClick={() => setLocalFilters({ ...localFilters, couleur: undefined })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {localFilters.categorie && !categoryName && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                    <span>Catégorie: {localFilters.categorie}</span>
                    <button
                      onClick={() => setLocalFilters({ ...localFilters, categorie: undefined })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="flex-1"
            >
              Réinitialiser
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1 bg-dore text-charbon hover:bg-dore/90">
              Appliquer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

