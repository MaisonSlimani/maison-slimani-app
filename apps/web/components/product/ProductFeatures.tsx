'use client'

import React from 'react'
import { Package } from 'lucide-react'

export function ProductFeatures() {
  return (
    <div className="grid grid-cols-3 gap-6 py-10 border-y border-charbon/5">
      <div className="flex flex-col items-center gap-2 text-center">
        <Package className="w-6 h-6 text-dore" />
        <span className="text-xs font-medium uppercase tracking-widest text-charbon/60">Fait main à Fès</span>
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-6 h-6 border-2 border-dore rounded-full flex items-center justify-center text-[10px] font-bold text-dore">24h</div>
        <span className="text-xs font-medium uppercase tracking-widest text-charbon/60">Livraison express</span>
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-6 h-6 text-dore flex items-center justify-center font-bold">100%</div>
        <span className="text-xs font-medium uppercase tracking-widest text-charbon/60">Cuir véritable</span>
      </div>
    </div>
  )
}
