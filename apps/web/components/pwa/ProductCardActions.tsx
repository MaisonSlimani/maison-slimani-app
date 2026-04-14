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
    <div className="px-2 pb-2 flex gap-1.5 md:px-3 md:pb-3 md:gap-2">
      <Button 
        onClick={onAddToCart} 
        className="flex-1 h-8 md:h-9 bg-dore text-charbon text-[10px] md:text-xs px-2"
      >
        {addedToCart ? <Check className="w-3 h-3 mr-1" /> : (isInCart ? <ShoppingCart className="w-3 h-3 mr-1" /> : <ShoppingBag className="w-3 h-3 mr-1" />)}
        <span className="truncate">
          {addedToCart ? "OK" : (isInCart ? "Panier" : "Ajouter")}
        </span>
      </Button>
      <Button 
        variant="outline" 
        onClick={onToggleWishlist} 
        className={cn("h-8 md:h-9 px-2.5 md:px-3", inWishlist && "text-dore border-dore")}
      >
        <Heart className={cn("w-3 h-3", inWishlist && "fill-current")} />
      </Button>
    </div>
  )
}
