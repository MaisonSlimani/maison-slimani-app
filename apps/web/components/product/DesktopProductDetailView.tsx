'use client'

import React from 'react'
import { motion } from 'framer-motion'
import GalerieProduit from '@/components/GalerieProduit'
import SimilarProducts from '@/components/SimilarProducts'
import { ProductInfo } from './ProductInfo'
import { ProductSelection } from './ProductSelection'
import { ProductFeatures } from './ProductFeatures'

import { Product, ProductVariation } from '@maison/domain'

export interface ProductDetailViewData {
  product: Product
  color: string
  setColor: (c: string) => void
  size: string
  setSize: (t: string) => void
  addedToCart: boolean
  isInCart: boolean
  inWishlist: boolean
  handleAddToCart: (checkout: boolean) => void
  handleToggleWishlist: () => void
  sizesData: ProductVariation[]
  allImages: { url: string; color?: string | null }[]
}

export default function DesktopProductDetailView({ data }: { data: ProductDetailViewData }) {
  const { 
    product, 
    color, 
    setColor, 
    size, 
    setSize, 
    isInCart,
    inWishlist, 
    handleAddToCart, 
    handleToggleWishlist, 
    sizesData, 
    allImages 
  } = data

  if (!product) return null

  return (
    <div className="pt-24 pb-32">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-[38%_62%] gap-12 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <GalerieProduit 
              images={allImages} 
              enableZoom={true} 
              showThumbnails={true} 
              selectedColor={color ?? undefined} 
            />
          </motion.div>

          <motion.div className="space-y-8" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <ProductInfo name={product.name} price={product.price} category={product.category ?? ''} description={product.description} />
            <ProductSelection 
              hasColors={!!product.hasColors} 
              colors={(product.colors as ProductVariation[]) ?? []} 
              selectedColor={color} 
              setSelectedColor={setColor} 
              sizesData={sizesData} 
              selectedSize={size} 
              setSelectedSize={setSize} 
              isInCart={isInCart}
              inWishlist={inWishlist} 
              onAddToCart={handleAddToCart} 
              onToggleWishlist={handleToggleWishlist} 
            />
            <ProductFeatures />
          </motion.div>
        </div>

        <section className="mt-24">
          <h2 className="text-4xl font-serif mb-12 text-center">Produits similaires</h2>
          <SimilarProducts productCategory={product.category ?? ''} productId={product.id} />
        </section>
      </div>
    </div>
  )
}
