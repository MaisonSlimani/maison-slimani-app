'use client'

import React from 'react'
import { Label } from '@maison/ui'
import { cn } from '@maison/shared'

interface SizeFilterProps {
  options: string[]
  selected: string[]
  onChange: (val: string[]) => void
}

export const SizeFilter = ({ options, selected, onChange }: SizeFilterProps) => {
  const toggle = (nom: string) => {
    if (selected.includes(nom)) {
      onChange(selected.filter(s => s !== nom))
    } else {
      onChange([...selected, nom])
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Tailles</Label>
      <div className="flex flex-wrap gap-2">
        {options.map(t => (
          <button
            key={t}
            onClick={() => toggle(t)}
            className={cn(
              "w-12 h-12 rounded-lg border-2 font-medium transition-all",
              selected.includes(t) ? "bg-charbon text-white border-charbon" : "border-gray-200"
            )}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}
