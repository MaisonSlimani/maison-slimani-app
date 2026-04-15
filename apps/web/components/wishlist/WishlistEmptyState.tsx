'use client'

import React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@maison/ui'

interface WishlistEmptyStateProps {
  onClose: () => void
}

export const WishlistEmptyState = ({ onClose }: WishlistEmptyStateProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <Heart className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-serif mb-2">Votre liste de favoris est vide</h3>
      <p className="text-muted-foreground text-center mb-6">
        Ajoutez des produits à vos favoris pour les retrouver facilement
      </p>
      <Button asChild onClick={onClose}>
        <Link href="/boutique">
          Découvrir la collection
        </Link>
      </Button>
    </div>
  )
}
