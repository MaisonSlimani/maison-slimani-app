'use client'

import { Check, ShoppingBag, ShoppingCart, Heart } from 'lucide-react'
import { Button } from '@maison/ui'
import { cn } from '@maison/shared'

interface ProductCardActionsProps {
  addedToCart: boolean
  isInCart: boolean
  inWishlist: boolean
  onAddToCart: (e: React.MouseEvent) => void
  onToggleWishlist: (e: React.MouseEvent) => void
}

export function ProductCardActions({ addedToCart, isInCart, inWishlist, onAddToCart, onToggleWishlist }: ProductCardActionsProps) {
  return (
    <div className="px-3 pb-3 flex gap-2">
      <Button onClick={onAddToCart} className="flex-1 h-9 bg-dore text-charbon text-xs">
        {addedToCart ? <Check className="w-3 h-3 mr-1" /> : (isInCart ? <ShoppingCart className="w-3 h-3 mr-1" /> : <ShoppingBag className="w-3 h-3 mr-1" />)}
        {addedToCart ? "OK" : (isInCart ? "Panier" : "Ajouter")}
      </Button>
      <Button variant="outline" onClick={onToggleWishlist} className={cn("h-9 px-3", inWishlist && "text-dore border-dore")}>
        <Heart className={cn("w-3 h-3", inWishlist && "fill-current")} />
      </Button>
    </div>
  )
}
