'use client'

import React from 'react'
import { CartItem } from '@maison/domain'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { Button } from '@maison/ui'
import { ShoppingBag, Trash2 } from 'lucide-react'

interface WishlistItemProps {
  item: CartItem
  isInCart: boolean
  loadingProduct: boolean
  onAddToCart: (item: CartItem) => void
  onRemove: (id: string) => void
  onClose: () => void
  getProductUrl: (item: CartItem) => string
}

export const WishlistItem = ({
  item,
  isInCart,
  loadingProduct,
  onAddToCart,
  onRemove,
  onClose,
  getProductUrl
}: WishlistItemProps) => {
  return (
    <div className="flex gap-4 p-4 border border-border rounded-lg hover:border-dore/50 transition-colors">
      <Link
        href={getProductUrl(item)}
        onClick={onClose}
        className="flex-shrink-0"
      >
        <div className="relative w-20 h-20 rounded overflow-hidden bg-muted">
          <OptimizedImage
            src={item.image_url || item.image || '/placeholder.jpg'}
            alt={item.nom}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      </Link>
      
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link
            href={getProductUrl(item)}
            onClick={onClose}
            className="block"
          >
            <h3 className="font-medium text-sm mb-1 line-clamp-2 hover:text-dore transition-colors">
              {item.nom}
            </h3>
          </Link>
          <p className="text-base font-serif text-dore font-semibold">
            {item.prix.toLocaleString('fr-MA')} MAD
          </p>
        </div>
        
        <div className="flex gap-2 mt-2">
          {isInCart ? (
            <Button
              size="sm"
              variant="outline"
              asChild
              className="flex-1 border-charbon text-charbon hover:bg-charbon hover:text-background text-xs"
            >
              <Link href="/panier" onClick={onClose}>
                <ShoppingBag className="w-3 h-3 mr-1" />
                Panier
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddToCart(item)}
              disabled={loadingProduct}
              className="flex-1 border-dore text-dore hover:bg-dore hover:text-charbon text-xs"
            >
              <ShoppingBag className="w-3 h-3 mr-1" />
              {loadingProduct ? 'Chargement...' : 'Ajouter'}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemove(item.id)}
            className="px-3 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
