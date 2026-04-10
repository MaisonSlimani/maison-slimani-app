'use client'

import React from 'react'
import { Label } from '@maison/ui'
import { Input } from '@maison/ui'

interface PriceFilterProps {
  min: number
  max: number
  currentMin?: number
  currentMax?: number
  onChange: (min?: number, max?: number) => void
}

export const PriceFilter = ({ min, max, currentMin, currentMax, onChange }: PriceFilterProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Plage de prix</Label>
      <div className="flex items-center gap-4">
        <Input 
          type="number" placeholder={`${min} DH`} value={currentMin || ''} 
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined, currentMax)}
        />
        <span>-</span>
        <Input 
          type="number" placeholder={`${max} DH`} value={currentMax || ''} 
          onChange={(e) => onChange(currentMin, e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>
    </div>
  )
}
