'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlidersHorizontal, X, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

export interface FilterState {
  minPrice?: number
  maxPrice?: number
  taille?: string[] // Multiple selections
  inStock?: boolean
  couleur?: string[] // Changed to array for multiple selections
  categorie?: string[] // Changed to array for multiple selections (only for global search)
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
    if (localFilters.couleur && localFilters.couleur.length > 0) count++
    if (localFilters.categorie && localFilters.categorie.length > 0 && !categoryName) count++ // Only count category if not in category page
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
          <DialogDescription>
            Sélectionnez les filtres pour affiner votre recherche
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Categories - Only for global search - Show first and prominently */}
          {!categoryName && filterOptions && filterOptions.categories && filterOptions.categories.length > 0 && (
            <div>
              <Label className="mb-3 block text-base font-semibold">Catégorie</Label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.categories.map((categorie: string) => {
                  const isSelected = localFilters.categorie?.includes(categorie) || false
                  return (
                    <button
                      key={categorie}
                      type="button"
                      onClick={() => {
                        const currentCategories = localFilters.categorie || []
                        if (isSelected) {
                          setLocalFilters({
                            ...localFilters,
                            categorie: currentCategories.filter((c) => c !== categorie),
                          })
                        } else {
                          setLocalFilters({
                            ...localFilters,
                            categorie: [...currentCategories, categorie],
                          })
                        }
                      }}
                      className={cn(
                        'px-4 py-2 rounded-lg border-2 font-medium transition-all text-sm hover:scale-105',
                        isSelected
                          ? 'bg-dore text-charbon border-dore shadow-md scale-105'
                          : 'bg-background text-foreground border-border hover:border-dore/50'
                      )}
                    >
                      {categorie}
                    </button>
                  )
                })}
              </div>
              {localFilters.categorie && localFilters.categorie.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => {
                    setLocalFilters({
                      ...localFilters,
                      categorie: undefined,
                    })
                  }}
                >
                  <X className="w-3 h-3 mr-1" />
                  Effacer les catégories
                </Button>
              )}
            </div>
          )}

          {/* Couleurs - Show as color swatches */}
          {filterOptions && filterOptions.couleurs && filterOptions.couleurs.length > 0 && (
            <div>
              <Label className="mb-3 block text-base font-semibold">Couleur</Label>
              <div className="flex flex-wrap gap-3">
                {filterOptions.couleurs.map((couleur: { nom: string; code: string } | string) => {
                  const couleurObj = typeof couleur === 'string' ? { nom: couleur, code: '#000000' } : couleur
                  const isSelected = localFilters.couleur?.includes(couleurObj.nom) || false
                  const colorCode = couleurObj.code || '#000000'
                  
                  return (
                    <button
                      key={couleurObj.nom}
                      type="button"
                      onClick={() => {
                        const currentCouleurs = localFilters.couleur || []
                        if (isSelected) {
                          setLocalFilters({
                            ...localFilters,
                            couleur: currentCouleurs.filter((c) => c !== couleurObj.nom),
                          })
                        } else {
                          setLocalFilters({
                            ...localFilters,
                            couleur: [...currentCouleurs, couleurObj.nom],
                          })
                        }
                      }}
                      className={cn(
                        'relative flex flex-col items-center gap-2 transition-all',
                        isSelected && 'scale-110'
                      )}
                      title={couleurObj.nom}
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-lg border-2 transition-all shadow-md',
                          isSelected
                            ? 'border-charbon shadow-lg ring-2 ring-charbon ring-offset-2'
                            : 'border-gray-300 hover:border-dore'
                        )}
                        style={{
                          backgroundColor: colorCode,
                        }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      <span className={cn(
                        'text-xs font-medium text-center max-w-[60px]',
                        isSelected ? 'text-charbon font-semibold' : 'text-foreground'
                      )}>
                        {couleurObj.nom}
                      </span>
                    </button>
                  )
                })}
              </div>
              {localFilters.couleur && localFilters.couleur.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => {
                    setLocalFilters({
                      ...localFilters,
                      couleur: undefined,
                    })
                  }}
                >
                  <X className="w-3 h-3 mr-1" />
                  Effacer les couleurs
                </Button>
              )}
            </div>
          )}

          {/* Taille - Show as buttons */}
          {filterOptions && filterOptions.tailles && filterOptions.tailles.length > 0 && (
            <div>
              <Label className="mb-3 block text-base font-semibold">Taille</Label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.tailles.map((taille: string) => {
                  const isChecked = localFilters.taille?.includes(taille) || false
                  return (
                    <button
                      key={taille}
                      type="button"
                      onClick={() => {
                        const currentTailles = localFilters.taille || []
                        if (isChecked) {
                          setLocalFilters({
                            ...localFilters,
                            taille: currentTailles.filter((t) => t !== taille),
                          })
                        } else {
                          setLocalFilters({
                            ...localFilters,
                            taille: [...currentTailles, taille],
                          })
                        }
                      }}
                      className={cn(
                        'w-12 h-12 rounded-lg border-2 font-medium transition-all hover:scale-105 text-sm',
                        isChecked
                          ? 'bg-dore text-charbon border-dore shadow-lg scale-105'
                          : 'bg-background text-foreground border-border hover:border-dore'
                      )}
                    >
                      {taille}
                    </button>
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
                  Effacer les tailles
                </Button>
              )}
            </div>
          )}

          {/* Price Range */}
          {filterOptions && (
            <div>
              <Label className="mb-3 block text-base font-semibold">Prix</Label>
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

          {/* Stock */}
          <div>
            <Label className="mb-3 block text-base font-semibold">Stock</Label>
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
                {localFilters.taille && localFilters.taille.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                    <span>Taille: {localFilters.taille.join(', ')}</span>
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
                {localFilters.couleur && localFilters.couleur.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                    <span>Couleur: {localFilters.couleur.join(', ')}</span>
                    <button
                      onClick={() => setLocalFilters({ ...localFilters, couleur: undefined })}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {localFilters.categorie && localFilters.categorie.length > 0 && !categoryName && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                    <span>Catégorie: {localFilters.categorie.join(', ')}</span>
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

