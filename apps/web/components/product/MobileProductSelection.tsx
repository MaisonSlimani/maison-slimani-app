'use client'

import React from 'react'
import { ShoppingBag, ShoppingCart, CheckCircle } from 'lucide-react'
import { Button } from '@maison/ui'
import { cn } from '@maison/shared'

import { ProductVariation } from '@maison/domain'

interface ProductSelectionProps {
  hasColors: boolean
  couleurs: ProductVariation[]
  selectedColor: string | null
  setSelectedColor: (c: string) => void
  taillesData: ProductVariation[]
  selectedTaille: string | null
  setSelectedTaille: (t: string) => void
  addedToCart: boolean
  onAddToCart: (checkout: boolean) => void
}

export function MobileProductSelection({
  hasColors, couleurs, selectedColor, setSelectedColor,
  taillesData, selectedTaille, setSelectedTaille,
  addedToCart, onAddToCart
}: ProductSelectionProps) {
  return (
    <div className="space-y-6">
      {hasColors && couleurs?.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm font-medium uppercase tracking-wider">Couleur: {selectedColor}</span>
          <div className="flex flex-wrap gap-3">
            {couleurs.map((c) => (
              <button key={c.nom} onClick={() => setSelectedColor(c.nom)} className={cn("w-12 h-12 rounded-xl border-2 transition-all p-0.5", selectedColor === c.nom ? "border-charbon scale-110" : "border-transparent")}>
                <div className="w-full h-full rounded-lg" style={{ backgroundColor: c.code || '#000' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {taillesData.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm font-medium uppercase tracking-wider">Taille</span>
          <div className="grid grid-cols-5 gap-2">
            {taillesData.map((t) => (
              <button key={t.nom} disabled={(t.stock ?? 0) <= 0} onClick={() => setSelectedTaille(t.nom)} className={cn("h-12 rounded-xl border-2 flex items-center justify-center font-medium transition-all", (t.stock ?? 0) <= 0 ? "opacity-30 border-dashed" : selectedTaille === t.nom ? "bg-charbon text-white border-charbon shadow-md" : "border-charbon/10 bg-white")}>{t.nom}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button className="flex-1 h-14 bg-dore text-charbon hover:bg-dore/90 text-lg rounded-2xl" onClick={() => onAddToCart(false)} disabled={addedToCart}>
          {addedToCart ? <CheckCircle className="mr-2" /> : <ShoppingBag className="mr-2" />}
          {addedToCart ? "Ajouté" : "Ajouter au panier"}
        </Button>
        <Button variant="outline" className="h-14 aspect-square rounded-2xl border-charbon/10" onClick={() => onAddToCart(true)}>
          <ShoppingCart className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
