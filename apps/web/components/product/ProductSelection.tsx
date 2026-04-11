'use client'

import React from 'react'
import { Button } from '@maison/ui'
import { ShoppingBag, Heart, ShoppingCart, ArrowRight } from 'lucide-react'
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
  isInCart: boolean
  inWishlist: boolean
  onAddToCart: (checkout: boolean) => void
  onToggleWishlist: () => void
}

export function ProductSelection({ 
  hasColors, couleurs, selectedColor, setSelectedColor, 
  taillesData, selectedTaille, setSelectedTaille, 
  isInCart, inWishlist, onAddToCart, onToggleWishlist 
}: ProductSelectionProps) {
  return (
    <div className="space-y-8 pt-8 border-t border-charbon/5">
      {hasColors && (
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-charbon/60">Couleurs disponibles</span>
          <div className="flex gap-4">
            {couleurs.map((c) => (
              <button key={c.nom} onClick={() => setSelectedColor(c.nom)} className={cn("group relative flex flex-col items-center gap-2 transition-all p-0.5 rounded-lg border", selectedColor === c.nom ? "border-charbon scale-110" : "border-transparent")}>
                <div className="w-12 h-12 rounded-md shadow-inner ring-1 ring-charbon/5" style={{ backgroundColor: c.code || '#000' }} />
                <span className="text-[9px] font-medium absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{c.nom}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {taillesData.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-charbon/60">Tailles</span>
            <button className="text-[11px] text-muted-foreground underline hover:text-charbon transition-colors">Guide des tailles</button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {taillesData.map((t) => (
              <button key={t.nom} disabled={(t.stock ?? 0) <= 0} onClick={() => setSelectedTaille(t.nom)} className={cn("w-12 h-12 rounded-lg border font-medium text-sm flex items-center justify-center transition-all", (t.stock ?? 0) <= 0 ? "opacity-20 cursor-not-allowed bg-muted" : selectedTaille === t.nom ? "bg-charbon text-white border-charbon shadow-md" : "hover:border-charbon/40 hover:text-charbon")}>{t.nom}</button>
            ))}
          </div>
        </div>
      )}

      <SelectionButtons 
        isInCart={isInCart} 
        inWishlist={inWishlist} 
        onAddToCart={onAddToCart} 
        onToggleWishlist={onToggleWishlist} 
      />
    </div>
  )
}

function SelectionButtons({ 
  isInCart, inWishlist, onAddToCart, onToggleWishlist 
}: { 
  isInCart: boolean; 
  inWishlist: boolean; 
  onAddToCart: (checkout: boolean) => void; 
  onToggleWishlist: () => void 
}) {
  return (
    <div className="flex gap-4 pt-4">
      <Button 
        size="lg" 
        className={cn(
          "flex-[2.5] h-14 text-base font-medium rounded-xl transition-all duration-300 border-0 shadow-sm", 
          isInCart ? "bg-charbon text-white" : "bg-dore text-charbon hover:bg-charbon hover:text-white"
        )} 
        onClick={() => isInCart ? window.dispatchEvent(new CustomEvent('openCartDrawer')) : onAddToCart(false)}
      >
        <div className="flex items-center">
          {isInCart ? <ArrowRight className="mr-2 w-5 h-5" /> : <ShoppingBag className="mr-2 w-5 h-5" />}
          <span>{isInCart ? "Voir le panier" : "Ajouter au panier"}</span>
        </div>
      </Button>
      <Button 
        variant="outline" 
        size="lg" 
        className={cn(
          "h-14 w-14 p-0 rounded-xl border transition-colors", 
          inWishlist ? "text-red-500 border-red-500 bg-red-50" : "border-charbon/10 hover:border-charbon/30"
        )} 
        onClick={onToggleWishlist}
      >
        <Heart className={cn("w-6 h-6", inWishlist && "fill-current")} />
      </Button>
      <Button 
        variant="outline" 
        size="lg" 
        className="flex-1 h-14 rounded-xl border px-6 flex items-center justify-center gap-2 hover:bg-charbon hover:text-white transition-all group active:scale-95" 
        onClick={() => onAddToCart(true)}
      >
        <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-bold uppercase tracking-tight">Achat Immédiat</span>
      </Button>
    </div>
  )
}
