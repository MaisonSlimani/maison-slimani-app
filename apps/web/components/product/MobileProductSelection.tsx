'use client'

import React from 'react'
import { ShoppingBag, ShoppingCart, CheckCircle } from 'lucide-react'
import { Button } from '@maison/ui'
import { cn } from '@maison/shared'

import { ProductVariation } from '@maison/domain'

interface ProductSize {
  name: string;
  stock?: number | null;
}

interface MobileProductSelectionProps {
  hasColors: boolean
  colors: ProductVariation[]
  selectedColor: string | null
  setSelectedColor: (c: string) => void
  sizesData: ProductSize[]
  selectedSize: string | null
  setSelectedSize: (t: string) => void
  isInCart: boolean
  onAddToCart: (checkout: boolean) => void
}

export function MobileProductSelection({
  hasColors, colors, selectedColor, setSelectedColor,
  sizesData, selectedSize, setSelectedSize,
  isInCart, onAddToCart
}: MobileProductSelectionProps) {
  return (
    <div className="space-y-6">
      {hasColors && colors?.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm font-medium uppercase tracking-wider">Couleur: {selectedColor}</span>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <button key={c.name} onClick={() => setSelectedColor(c.name)} className={cn("w-12 h-12 rounded-xl border-2 transition-all p-0.5", selectedColor === c.name ? "border-charbon scale-110" : "border-transparent")}>
                <div className="w-full h-full rounded-lg" style={{ backgroundColor: c.code || '#000' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {sizesData && sizesData.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm font-medium uppercase tracking-wider">Taille</span>
          <div className="grid grid-cols-5 gap-2">
            {sizesData.map((t) => (
              <button 
                key={t.name} 
                disabled={(t.stock ?? 0) <= 0} 
                onClick={() => setSelectedSize(t.name)} 
                className={cn(
                  "h-12 rounded-xl border-2 flex items-center justify-center font-medium transition-all", 
                  (t.stock ?? 0) <= 0 
                    ? "opacity-30 border-dashed" 
                    : selectedSize === t.name
                      ? "bg-charbon text-white border-charbon shadow-md" 
                      : "border-charbon/10 bg-white"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button 
          className={cn(
            "flex-1 h-14 text-lg rounded-2xl transition-all duration-300", 
            isInCart 
              ? "bg-charbon text-white" 
              : "bg-dore text-charbon hover:bg-dore/90"
          )} 
          onClick={() => {
            if (isInCart) {
              window.dispatchEvent(new CustomEvent('openCartDrawer'));
            } else {
              onAddToCart(false);
            }
          }}
        >
          {isInCart ? (
            <div className="flex items-center">
              <CheckCircle className="mr-2 w-5 h-5" />
              <span>Voir le panier</span>
            </div>
          ) : (
            <div className="flex items-center">
              <ShoppingBag className="mr-2 w-5 h-5" />
              <span>Ajouter au panier</span>
            </div>
          )}
        </Button>
        <Button variant="outline" className="h-14 aspect-square rounded-2xl border-charbon/10 bg-white" onClick={() => onAddToCart(true)}>
          <ShoppingCart className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
