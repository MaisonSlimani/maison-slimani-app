'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Button, Card } from '@maison/ui'

export function MobilePanierEmpty() {
  return (
    <Card className="p-12 text-center border-dashed">
      <div className="mb-4">
        <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/50" />
      </div>
      <h2 className="text-xl font-serif mb-2">Votre panier est vide</h2>
      <p className="text-muted-foreground mb-6 text-sm">Découvrez nos collections</p>
      <Button asChild className="bg-dore text-charbon hover:bg-dore/90 px-8">
        <Link href="/boutique">Voir la collection</Link>
      </Button>
    </Card>
  )
}
