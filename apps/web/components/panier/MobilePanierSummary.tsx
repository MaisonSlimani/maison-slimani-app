'use client'

import React from 'react'
import { Button, Card } from '@maison/ui'
import { useRouter } from 'next/navigation'

interface MobilePanierSummaryProps {
  total: number
}

export function MobilePanierSummary({ total }: MobilePanierSummaryProps) {
  const router = useRouter()
  return (
    <Card className="p-6 bg-charbon text-white border-0 shadow-xl mt-8">
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-400 font-medium">Total</span>
        <span className="text-2xl font-serif text-dore tracking-tight">
          {total.toLocaleString('fr-MA')} MAD
        </span>
      </div>
      <Button
        size="lg"
        className="w-full bg-dore text-charbon hover:bg-dore/90 font-bold h-14"
        onClick={() => router.push('/checkout')}
      >
        Passer la commande
      </Button>
    </Card>
  )
}
