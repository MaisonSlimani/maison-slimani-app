'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@maison/ui'
import { toast } from 'sonner'
import { hapticFeedback } from '@/lib/haptics'
import { slugify } from '@/lib/utils/product-urls'
import { Product } from '@maison/domain'
import ProductCardImage from '../product/ProductCardImage'
import ProductPurchaseDialog from '../product/ProductPurchaseDialog'
import { useProductCardState } from '@/hooks/useProductCardState'
import { ProductCardActions } from './ProductCardActions'

export default function ProductCard({ produit, priority = false }: { produit: Product; priority?: boolean }) {
  const s = useProductCardState(produit)
  const href = `/boutique/${produit.categorie ? slugify(produit.categorie) : 'cat'}/${produit.slug || slugify(produit.nom)}`
  const isOutOfStock = produit.stock !== null && produit.stock <= 0 && (!produit.has_colors || !produit.couleurs?.some(c => (c.stock || 0) > 0))

  return (
    <Card className="group overflow-hidden border-0 shadow-sm bg-card relative flex flex-col h-full">
      <Link href={href} className="flex-1 flex flex-col">
        <ProductCardImage 
          imageUrl={s.imageUrl!} nom={produit.nom} hasMultipleColors={s.colorImages.length > 1}
          colorImages={s.colorImages} currentColorIndex={s.currentColorIndex}
          onPreviousColor={(e) => { e.preventDefault(); s.setCurrentColorIndex(i => i === 0 ? s.colorImages.length - 1 : i - 1); hapticFeedback('light') }}
          onNextColor={(e) => { e.preventDefault(); s.setCurrentColorIndex(i => i === s.colorImages.length - 1 ? 0 : i + 1); hapticFeedback('light') }}
          inWishlist={s.inWishlist} isOutOfStock={!!isOutOfStock}
          priority={priority}
        />
        <div className="p-3">
          <h3 className="text-sm font-medium line-clamp-2">{produit.nom}</h3>
          <p className="text-base font-serif text-dore font-semibold mt-1">{produit.prix.toLocaleString('fr-MA')} MAD</p>
        </div>
      </Link>
      <ProductCardActions addedToCart={s.addedToCart} isInCart={s.isInCart} inWishlist={s.inWishlist} onAddToCart={(e) => { e.preventDefault(); e.stopPropagation(); s.addBasicToCart() }} onToggleWishlist={(e) => { e.preventDefault(); e.stopPropagation(); s.toggleWishlist() }} />

      <ProductPurchaseDialog 
        showModal={s.showModal} setShowModal={s.setShowModal} produit={produit} selectedCouleur={s.selectedCouleur} setSelectedCouleur={s.setSelectedCouleur}
        selectedTaille={s.selectedTaille} setSelectedTaille={s.setSelectedTaille} quantite={s.quantite} setQuantite={s.setQuantite}
        taillesDisponibles={produit.tailles?.map(t => t.nom) || []}
        onConfirm={async () => {
          s.setIsAddingToCart(true)
          try {
            await s.addToCart({ ...produit, quantite: s.quantite, taille: s.selectedTaille, couleur: s.selectedCouleur, image_url: s.imageUrl }, false)
            s.setShowModal(false); toast.success('Ajouté'); hapticFeedback('success')
          } finally { s.setIsAddingToCart(false) }
        }} 
        isAddingToCart={s.isAddingToCart}
      />
    </Card>
  )
}
