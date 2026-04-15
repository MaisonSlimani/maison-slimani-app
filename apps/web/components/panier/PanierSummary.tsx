'use client'

import React from 'react'
import { Button, Card } from '@maison/ui'
import { useRouter } from 'next/navigation'

interface PanierSummaryProps {
  total: number
}

export function PanierSummary({ total }: PanierSummaryProps) {
  const router = useRouter()
  return (
    <Card className="p-8 sticky top-28 bg-charbon text-white border-0 shadow-2xl overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-dore/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      <h2 className="text-2xl font-serif mb-8 border-b border-white/10 pb-4">Résumé</h2>
      <div className="flex justify-between items-center mb-8">
        <span className="text-gray-400 text-lg">Total</span>
        <span className="text-3xl font-serif text-dore font-bold">
          {total.toLocaleString('fr-MA')} MAD
        </span>
      </div>
      <Button
        size="lg"
        className="w-full bg-dore text-charbon hover:bg-dore/90 font-bold h-16 text-lg transition-transform hover:scale-[1.02]"
        onClick={() => router.push('/checkout')}
      >
        Passer la commande
      </Button>
      <p className="mt-6 text-center text-xs text-gray-500">Livraison gratuite disponible au Maroc</p>
    </Card>
  )
}
