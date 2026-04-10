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
  produit: Product
  couleur: string
  setCouleur: (c: string) => void
  taille: string
  setTaille: (t: string) => void
  addedToCart: boolean
  isInCart: boolean
  inWishlist: boolean
  handleAddToCart: (checkout: boolean) => void
  handleToggleWishlist: () => void
  taillesData: ProductVariation[]
  allImages: { url: string; couleur?: string | null }[]
}

export default function DesktopProductDetailView({ data }: { data: ProductDetailViewData }) {
  const { 
    produit, 
    couleur, 
    setCouleur, 
    taille, 
    setTaille, 
    addedToCart, 
    inWishlist, 
    handleAddToCart, 
    handleToggleWishlist, 
    taillesData, 
    allImages 
  } = data

  if (!produit) return null

  return (
    <div className="pt-24 pb-32">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-[38%_62%] gap-12 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <GalerieProduit 
              images={allImages} 
              enableZoom={true} 
              showThumbnails={true} 
              selectedColor={couleur ?? undefined} 
            />
          </motion.div>

          <motion.div className="space-y-8" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <ProductInfo nom={produit.nom} prix={produit.prix} categorie={produit.categorie ?? ''} description={produit.description} />
            <ProductSelection 
              hasColors={!!produit.has_colors} 
              couleurs={(produit.couleurs as ProductVariation[]) ?? []} 
              selectedColor={couleur} 
              setSelectedColor={setCouleur} 
              taillesData={taillesData} 
              selectedTaille={taille} 
              setSelectedTaille={setTaille} 
              addedToCart={addedToCart} 
              inWishlist={inWishlist} 
              onAddToCart={handleAddToCart} 
              onToggleWishlist={handleToggleWishlist} 
            />
            <ProductFeatures />
          </motion.div>
        </div>

        <section className="mt-24">
          <h2 className="text-4xl font-serif mb-12 text-center">Produits similaires</h2>
          <SimilarProducts productCategory={produit.categorie ?? ''} productId={produit.id} />
        </section>
      </div>
    </div>
  )
}
