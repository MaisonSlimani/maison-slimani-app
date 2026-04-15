'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import GalerieProduit from '@/components/GalerieProduit'
import SimilarProducts from '@/components/SimilarProducts'
import { cn } from '@maison/shared'
import { ProductDetailViewData } from './DesktopProductDetailView'
import { ProductVariation } from '@maison/domain'
import { MobileProductSelection } from './MobileProductSelection'

export default function MobileProductDetailView({ data }: { data: ProductDetailViewData }) {
  const { 
    product: product, // Normalize to product
    color, setColor, size, setSize, 
    isInCart, inWishlist, handleAddToCart, handleToggleWishlist, 
    sizesData, allImages 
  } = data

  return (
    <div className="w-full min-h-screen pb-40 bg-ecru/20">
      <div className="relative aspect-square">
        <GalerieProduit 
          images={allImages} 
          enableZoom={false} 
          showThumbnails={true} 
          selectedColor={color ?? undefined} 
        />
        <button onClick={handleToggleWishlist} className="absolute top-4 left-4 z-10 w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
          <Heart className={cn("w-6 h-6", inWishlist && "fill-dore text-dore")} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-serif mb-2">{product.name}</h1>
          <p className="text-2xl font-serif text-dore">{product.price.toLocaleString('fr-MA')} DH</p>
        </div>

        <div className="prose prose-sm max-w-none text-charbon/80" dangerouslySetInnerHTML={{ __html: product.description }} />

        <MobileProductSelection 
          hasColors={!!product.hasColors} 
          colors={(product.colors as ProductVariation[]) ?? []} 
          selectedColor={color} 
          setSelectedColor={setColor}
          sizesData={sizesData} 
          selectedSize={size} 
          setSelectedSize={setSize}
          isInCart={isInCart}
          onAddToCart={handleAddToCart}
        />
      </div>
      
      <SimilarProducts productCategory={product.category ?? ''} productId={product.id} />
    </div>
  )
}
