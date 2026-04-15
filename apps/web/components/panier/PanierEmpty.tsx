'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Button, Card } from '@maison/ui'

export function PanierEmpty() {
  return (
    <Card className="p-20 text-center bg-ecru/50 border-dashed">
      <div className="mb-8">
        <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground/30" />
      </div>
      <h2 className="text-3xl font-serif mb-4">Votre panier est vide</h2>
      <p className="text-lg text-muted-foreground mb-10">Explorez notre collection de chaussures haut de gamme</p>
      <Button asChild size="lg" className="bg-dore text-charbon hover:bg-dore/90 px-10">
        <Link href="/boutique">Voir la collection</Link>
      </Button>
    </Card>
  )
}
