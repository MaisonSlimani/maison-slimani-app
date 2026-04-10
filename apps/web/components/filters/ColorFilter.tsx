'use client'

import React from 'react'
import { Label } from '@maison/ui'
import { Check } from 'lucide-react'
import { cn } from '@maison/shared'

interface ColorOption {
  nom: string
  code: string
}

interface ColorFilterProps {
  options: ColorOption[]
  selected: string[]
  onChange: (val: string[]) => void
}

export const ColorFilter = ({ options, selected, onChange }: ColorFilterProps) => {
  const toggle = (nom: string) => {
    if (selected.includes(nom)) {
      onChange(selected.filter(s => s !== nom))
    } else {
      onChange([...selected, nom])
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Couleurs</Label>
      <div className="flex flex-wrap gap-3">
        {options.map((c: ColorOption) => {
          const isSelected = selected.includes(c.nom)
          return (
            <button
              key={c.nom}
              onClick={() => toggle(c.nom)}
              className={cn("relative w-10 h-10 rounded-lg border-2", isSelected ? "border-charbon scale-110" : "border-gray-200")}
              style={{ backgroundColor: c.code || '#000' }}
            >
              {isSelected && <Check className="w-6 h-6 text-white absolute inset-1/4" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
