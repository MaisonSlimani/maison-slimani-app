'use client'

import React from 'react'
import { cn } from '@maison/shared'
import { ProductVariation } from '@maison/domain'

interface PurchaseSelectionsProps {
  hasColors: boolean
  variations: ProductVariation[] | null
  selectedCouleur: string
  setSelectedCouleur: (val: string) => void
  taillesDisponibles: string[]
  selectedTaille: string
  setSelectedTaille: (val: string) => void
  quantite: number
  setQuantite: (val: number) => void
}

export function PurchaseSelections({
  hasColors, variations, selectedCouleur, setSelectedCouleur,
  taillesDisponibles, selectedTaille, setSelectedTaille,
  quantite, setQuantite
}: PurchaseSelectionsProps) {
  return (
    <div className="space-y-6 py-4">
      {hasColors && variations && (
        <div className="space-y-3">
          <label className="text-sm font-medium uppercase tracking-wider">Couleur</label>
          <div className="flex flex-wrap gap-3">
            {variations.map((c) => (
              <button key={c.nom} onClick={() => setSelectedCouleur(c.nom)} className={cn("w-10 h-10 rounded-full border-2 transition-all", selectedCouleur === c.nom ? "border-charbon scale-110" : "border-transparent")} style={{ backgroundColor: c.code || '#000' }} />
            ))}
          </div>
        </div>
      )}

      {taillesDisponibles.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium uppercase tracking-wider">Taille</label>
          <div className="flex flex-wrap gap-2">
            {taillesDisponibles.map((t) => (
              <button key={t} onClick={() => setSelectedTaille(t)} className={cn("px-4 py-2 border-2 rounded-lg transition-all", selectedTaille === t ? "bg-charbon text-white border-charbon" : "border-gray-200")}>{t}</button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="text-sm font-medium uppercase tracking-wider">Quantité</label>
        <div className="flex items-center gap-4">
          <button onClick={() => setQuantite(Math.max(1, quantite - 1))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center font-bold">-</button>
          <span className="text-xl font-serif w-8 text-center">{quantite}</span>
          <button onClick={() => setQuantite(quantite + 1)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center font-bold">+</button>
        </div>
      </div>
    </div>
  )
}
