'use client'

import React from 'react'
import { Button } from '@maison/ui'
import { ShoppingBag, Heart, ShoppingCart, CheckCircle } from 'lucide-react'
import { cn } from '@maison/shared'

interface Variation { nom: string; code?: string; stock?: number }

interface ProductSelectionProps {
  hasColors: boolean
  couleurs: Variation[]
  selectedColor: string | null
  setSelectedColor: (c: string) => void
  taillesData: Variation[]
  selectedTaille: string | null
  setSelectedTaille: (t: string) => void
  addedToCart: boolean
  inWishlist: boolean
  onAddToCart: (checkout: boolean) => void
  onToggleWishlist: () => void
}

export function ProductSelection({ 
  hasColors, couleurs, selectedColor, setSelectedColor, 
  taillesData, selectedTaille, setSelectedTaille, 
  addedToCart, inWishlist, onAddToCart, onToggleWishlist 
}: ProductSelectionProps) {
  return (
    <div className="space-y-8 pt-8 border-t border-charbon/5">
      {hasColors && (
        <div className="space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider">Couleurs disponibles</span>
          <div className="flex gap-4">
            {couleurs.map((c) => (
              <button key={c.nom} onClick={() => setSelectedColor(c.nom)} className={cn("group relative flex flex-col items-center gap-2 transition-all p-1 rounded-xl border-2", selectedColor === c.nom ? "border-charbon scale-105" : "border-transparent")}>
                <div className="w-14 h-14 rounded-lg shadow-inner ring-1 ring-charbon/5" style={{ backgroundColor: c.code || '#000' }} />
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">{c.nom}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {taillesData.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold uppercase tracking-wider">Tailles</span>
            <button className="text-xs text-muted-foreground underline">Guide des tailles</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {taillesData.map((t) => (
              <button key={t.nom} disabled={(t.stock ?? 0) <= 0} onClick={() => setSelectedTaille(t.nom)} className={cn("w-14 h-14 rounded-xl border-2 font-serif text-lg flex items-center justify-center transition-all", (t.stock ?? 0) <= 0 ? "opacity-30 cursor-not-allowed bg-muted" : selectedTaille === t.nom ? "bg-charbon text-white border-charbon shadow-xl scale-105" : "hover:border-dore hover:text-dore")}>{t.nom}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button size="lg" className={cn("flex-1 h-20 text-xl font-serif rounded-2xl transition-all shadow-xl", addedToCart ? "bg-green-600 hover:bg-green-700" : "bg-dore text-charbon hover:bg-dore/90")} onClick={() => onAddToCart(false)} disabled={addedToCart}>
          {addedToCart ? <CheckCircle className="mr-3 w-6 h-6" /> : <ShoppingBag className="mr-3 w-6 h-6" />}
          {addedToCart ? "Ajouté avec succès" : "Ajouter au panier"}
        </Button>
        <Button variant="outline" size="lg" className={cn("h-20 w-20 p-0 rounded-2xl border-2", inWishlist ? "text-dore border-dore bg-dore/5" : "border-charbon/10")} onClick={onToggleWishlist}><Heart className={cn("w-8 h-8", inWishlist && "fill-dore")} /></Button>
        <Button variant="outline" size="lg" className="h-20 rounded-2xl border-2 px-8 flex flex-col justify-center items-center gap-1 group overflow-hidden" onClick={() => onAddToCart(true)}><ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" /><span className="text-[10px] font-bold uppercase tracking-tighter">Achat Immédiat</span></Button>
      </div>
    </div>
  )
}
