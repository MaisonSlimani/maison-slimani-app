'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@maison/ui'

interface CartEmptyStateProps {
  onClose: () => void
}

export const CartEmptyState = ({ onClose }: CartEmptyStateProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-serif mb-2">Votre panier est vide</h3>
      <p className="text-muted-foreground text-center mb-6">
        Découvrez notre collection de chaussures haut de gamme
      </p>
      <Button asChild onClick={onClose}>
        <Link href="/boutique">
          Voir la collection
        </Link>
      </Button>
    </div>
  )
}
