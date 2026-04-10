'use client'

import React from 'react'
import { Truck, RefreshCcw, Award } from 'lucide-react'

export function HomeTrustBar() {
  return (
    <div className="bg-gray-50 py-16 border-t">
      <div className="container px-6 mx-auto flex flex-col md:flex-row justify-center items-center gap-12 md:gap-16">
        <div className="flex flex-col items-center gap-2"><Truck className="w-10 h-10 text-dore" /><span className="font-serif text-xl">Livraison Gratuite</span></div>
        <div className="flex flex-col items-center gap-2"><RefreshCcw className="w-10 h-10 text-dore" /><span className="font-serif text-xl">Retours 7 Jours</span></div>
        <div className="flex flex-col items-center gap-2"><Award className="w-10 h-10 text-dore" /><span className="font-serif text-xl">Fait Main</span></div>
      </div>
    </div>
  )
}
