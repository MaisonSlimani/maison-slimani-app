'use client'

import { useState } from 'react'
import { Button } from '@maison/ui'
import { SlidersHorizontal } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@maison/ui'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@maison/shared'
import { ColorFilter } from './ColorFilter'
import { SizeFilter } from './SizeFilter'
import { PriceFilter } from './PriceFilter'

import { FilterState } from '@/types/index'

interface ProductFilterProps {
  onFilterChange: (filters: FilterState) => void
  currentFilters: FilterState
  categoryName?: string
}

export default function ProductFilter({ onFilterChange, currentFilters, categoryName }: ProductFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters)

  const { data: options } = useQuery({
    queryKey: ['filter-options', categoryName],
    queryFn: async () => {
      const resp = await fetch(`/api/produits/filter-options${categoryName ? `?categorie=${categoryName}` : ''}`)
      const res = await resp.json()
      return res.data
    }
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn(Object.keys(currentFilters).length > 0 && 'bg-dore/10 border-dore')}>
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Filtrer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtres</DialogTitle>
          <DialogDescription>Affinez votre recherche</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8 py-6">
          {options?.couleurs && (
            <ColorFilter 
              options={options.couleurs} selected={localFilters.couleur || []} 
              onChange={(val) => setLocalFilters({...localFilters, couleur: val})} 
            />
          )}
          
          {options?.tailles && (
            <SizeFilter 
              options={options.tailles} selected={localFilters.taille || []} 
              onChange={(val) => setLocalFilters({...localFilters, taille: val})} 
            />
          )}

          {options && (
            <PriceFilter 
              min={options.minPrice} max={options.maxPrice} 
              currentMin={localFilters.minPrice} currentMax={localFilters.maxPrice}
              onChange={(min, max) => setLocalFilters({...localFilters, minPrice: min, maxPrice: max})}
            />
          )}

          <div className="flex gap-4 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => { setLocalFilters({}); onFilterChange({}); setIsOpen(false) }}>Réinitialiser</Button>
            <Button className="flex-1 bg-dore text-charbon" onClick={() => { onFilterChange(localFilters); setIsOpen(false) }}>Appliquer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
