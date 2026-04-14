'use client'

import React from 'react'
import { cn } from '@maison/shared'
import { Product, ProductVariation } from '@maison/domain'

interface PurchaseSelectionsProps {
  hasColors: boolean
  variations: ProductVariation[] | null
  selectedColor: string
  setSelectedColor: (val: string) => void
  availableSizes: string[]
  selectedSize: string
  setSelectedSize: (val: string) => void
  quantity: number
  setQuantity: (val: number) => void
  _produit: Product
}

export function PurchaseSelections({
  hasColors, variations, selectedColor, setSelectedColor,
  availableSizes, selectedSize, setSelectedSize,
  quantity, setQuantity, _produit
}: PurchaseSelectionsProps) {
  // Determine which sizes to show:
  // 1. If colors are active, show sizes for the selected color
  // 2. Otherwise show the root product sizes
  let currentSizes = availableSizes;

  if (hasColors && selectedColor && variations) {
    const selectedVar = variations.find(v => v.name === selectedColor);
    if (selectedVar && selectedVar.sizes) {
      currentSizes = selectedVar.sizes.map(t => t.name);
    }
  }

  return (
    <div className="space-y-6 py-4">
      {hasColors && variations && (
        <div className="space-y-3">
          <label className="text-sm font-medium uppercase tracking-wider">Couleur</label>
          <div className="flex flex-wrap gap-3">
            {variations.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  setSelectedColor(c.name);
                  // Reset size to first available for this color
                  if (c.sizes && c.sizes.length > 0) {
                    setSelectedSize(c.sizes[0].name);
                  }
                }}
                className={cn("w-10 h-10 rounded-full border-2 transition-all", selectedColor === c.name ? "border-charbon scale-110" : "border-transparent")}
                style={{ backgroundColor: c.code || '#000' }}
              />
            ))}
          </div>
        </div>
      )}

      {currentSizes.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium uppercase tracking-wider">Taille</label>
          <div className="flex flex-wrap gap-2">
            {currentSizes.map((t) => (
              <button key={t} onClick={() => setSelectedSize(t)} className={cn("px-4 py-2 border-2 rounded-lg transition-all", selectedSize === t ? "bg-charbon text-white border-charbon" : "border-gray-200")}>{t}</button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="text-sm font-medium uppercase tracking-wider">Quantité</label>
        <div className="flex items-center gap-4">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center font-bold">-</button>
          <span className="text-xl font-serif w-8 text-center">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center font-bold">+</button>
        </div>
      </div>
    </div>
  )
}
