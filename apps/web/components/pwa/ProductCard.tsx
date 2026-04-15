'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@maison/ui'
import { toast } from 'sonner'
import { hapticFeedback } from '@/lib/haptics'
import { slugify } from '@/lib/utils/product-urls'
import { Product, getSelectedStock } from '@maison/domain'
import ProductCardImage from '../product/ProductCardImage'
import ProductPurchaseDialog from '../product/ProductPurchaseDialog'
import { useProductCardState } from '@/hooks/useProductCardState'
import { ProductCardActions } from './ProductCardActions'

export default function ProductCard({ product: produit, priority = false }: { product: Product; priority?: boolean }) {
  const s = useProductCardState(produit)
  const href = `/boutique/${produit.category ? slugify(produit.category) : 'cat'}/${produit.slug || slugify(produit.name)}`
  const isOutOfStock = produit.stock !== null && produit.stock <= 0 && (!produit.hasColors || !produit.colors?.some(c => (c.stock || 0) > 0))

  return (
    <Card className="group overflow-hidden border-0 shadow-sm bg-card relative flex flex-col h-full">
      <Link href={href} className="flex-1 flex flex-col">
        <ProductCardImage 
          imageUrl={s.imageUrl!} name={produit.name} hasMultipleColors={s.colorImages.length > 1}
          colorImages={s.colorImages} currentColorIndex={s.currentColorIndex}
          onPreviousColor={(e) => { e.preventDefault(); s.setCurrentColorIndex(i => i === 0 ? s.colorImages.length - 1 : i - 1); hapticFeedback('light') }}
          onNextColor={(e) => { e.preventDefault(); s.setCurrentColorIndex(i => i === s.colorImages.length - 1 ? 0 : i + 1); hapticFeedback('light') }}
          inWishlist={s.inWishlist} isOutOfStock={!!isOutOfStock}
          priority={priority}
        />
        <div className="p-3">
          <h3 className="text-sm font-medium line-clamp-2">{produit.name}</h3>
          <p className="text-base font-serif text-dore font-semibold mt-1">{produit.price.toLocaleString('fr-MA')} MAD</p>
        </div>
      </Link>
      <ProductCardActions addedToCart={s.addedToCart} isInCart={s.isInCart} inWishlist={s.inWishlist} onAddToCart={(e) => { e.preventDefault(); e.stopPropagation(); s.addBasicToCart() }} onToggleWishlist={(e) => { e.preventDefault(); e.stopPropagation(); s.toggleWishlist() }} />

      <ProductPurchaseDialog 
        showModal={s.showModal} setShowModal={s.setShowModal} produit={produit} selectedColor={s.selectedColor} setSelectedColor={s.setSelectedColor}
        selectedSize={s.selectedSize} setSelectedSize={s.setSelectedSize} quantity={s.quantity} setQuantity={s.setQuantity}
        sizesAvailable={produit.sizes?.map(t => t.name) || []}
        onConfirm={async () => {
          s.setIsAddingToCart(true)
          try {
            const item = { 
              ...produit, 
              quantity: s.quantity, 
              size: s.selectedSize || null, 
              color: s.selectedColor || null, 
              image_url: s.imageUrl,
              stock: getSelectedStock(produit, s.selectedColor, s.selectedSize)
            }
            await s.addToCart(item, false)
            s.setShowModal(false); toast.success('Ajouté'); hapticFeedback('success')
          } finally { s.setIsAddingToCart(false) }
        }} 
        isAddingToCart={s.isAddingToCart}
      />
    </Card>
  )
}
