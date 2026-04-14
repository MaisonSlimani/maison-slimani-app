'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, Button } from '@maison/ui'
import { ShoppingBag, Heart, ShoppingCart } from 'lucide-react'
import { useRealtimeStock } from '@/lib/hooks/useRealtimeStock'
import { cn } from '@maison/shared'
import { Product, ProductVariation } from '@maison/domain'
import ProductCardImage from './product/ProductCardImage'
import ProductPurchaseDialog from './product/ProductPurchaseDialog'
import { useProductCardActions } from '@/hooks/product/useProductCardActions'
import { slugify } from '@/lib/utils/product-urls'

interface CarteProduitProps {
  product: Product
  showActions?: boolean
}

const CarteProduit = ({ product: produit, showActions = false }: CarteProduitProps) => {
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  
  useRealtimeStock(produit.id)

  const { colorImages, imageUrl, isOutOfStock } = useMemo(() => {
    const vars = produit.colors as ProductVariation[] | null
    
    const resolveImages = () => (produit.hasColors && vars) ? vars.map(c => ({ 
      color: c.name, 
      image: Array.isArray(c.images) ? c.images[0] : (c.images || produit.image_url) 
    })).filter(ci => !!ci.image) : []
    
    const cImgs = resolveImages()
    const img = (cImgs[currentColorIndex]?.image) || produit.image_url || ''
    
    const hasStock = (produit.stock || 0) > 0 || vars?.some(c => (c.stock || 0) > 0)
    
    return { colorImages: cImgs, imageUrl: img, isOutOfStock: !hasStock }
  }, [produit, currentColorIndex])

  const {
    isInCart,
    inWishlist,
    isAddingToCart,
    showModal,
    setShowModal,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    quantity,
    setQuantity,
    onAddToCart,
    onToggleWishlist,
    onConfirmPurchase
  } = useProductCardActions({ produit, imageUrl, isOutOfStock: !!isOutOfStock })

  const href = `/boutique/${produit.category ? slugify(produit.category) : 'cat'}/${produit.slug || slugify(produit.name || '')}`

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all relative flex flex-col h-full">
      <Link href={href} className="flex-1 flex flex-col">
        <ProductCardImage
          imageUrl={imageUrl} name={produit.name} hasMultipleColors={colorImages.length > 1}
          colorImages={colorImages.map(ci => ({ color: ci.color, image: ci.image }))} 
          currentColorIndex={currentColorIndex}
          onPreviousColor={(e) => { e.preventDefault(); setCurrentColorIndex(i => i === 0 ? colorImages.length - 1 : i - 1) }}
          onNextColor={(e) => { e.preventDefault(); setCurrentColorIndex(i => i === colorImages.length - 1 ? 0 : i + 1) }}
          inWishlist={inWishlist} isOutOfStock={!!isOutOfStock}
        />
        <div className="p-4 flex-1 flex flex-col justify-between">
          <h3 className="font-medium text-lg truncate">{produit.name}</h3>
          <p className="text-xl font-serif text-charbon mt-2">{produit.price.toLocaleString('fr-MA')} DH</p>
        </div>
      </Link>
      {showActions && <CardActions isInCart={isInCart} inWishlist={inWishlist} onAdd={onAddToCart} onWish={onToggleWishlist} />}
      <ProductPurchaseDialog
        showModal={showModal} setShowModal={setShowModal} produit={produit} 
        selectedColor={selectedColor} setSelectedColor={setSelectedColor}
        selectedSize={selectedSize} setSelectedSize={setSelectedSize} 
        quantity={quantity} setQuantity={setQuantity}
        sizesAvailable={produit.sizes?.map((t) => t.name) || []} 
        onConfirm={onConfirmPurchase} 
        isAddingToCart={isAddingToCart}
      />
    </Card>
  )
}

function CardActions({ isInCart, inWishlist, onAdd, onWish }: { isInCart: boolean; inWishlist: boolean; onAdd: (e: React.MouseEvent) => void; onWish: (e: React.MouseEvent) => void }) {
  return (
    <div className="px-4 pb-4 flex gap-2">
      <Button onClick={onAdd} className="flex-1 bg-dore text-charbon">{isInCart ? <ShoppingCart className="w-4 h-4 mr-2" /> : <ShoppingBag className="w-4 h-4 mr-2" />}{isInCart ? "Voir panier" : "Acheter"}</Button>
      <Button variant="outline" onClick={onWish} className={cn(inWishlist && "text-dore border-dore")}><Heart className={cn("w-4 h-4", inWishlist && "fill-current")} /></Button>
    </div>
  )
}

export default CarteProduit
