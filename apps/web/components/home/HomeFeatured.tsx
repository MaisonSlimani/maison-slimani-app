'use client'

import React from 'react'
import CarteProduit from '@/components/CarteProduit'
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton'
import { Product } from '@maison/domain'

interface HomeFeaturedProps {
  produits: Product[]
  loading: boolean
}

export function HomeFeatured({ produits, loading }: HomeFeaturedProps) {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="container max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-5xl font-serif mb-6">Produits en Vedette</h2>
        <p className="text-xl text-muted-foreground">Sélectionnés pour leur excellence</p>
      </div>
      {!loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 container max-w-6xl mx-auto">
          {produits.map((p) => (
            <CarteProduit key={p.id} produit={p} showActions={true} />
          ))}
        </div>
      ) : (
        <div className="container max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <ProductCardSkeleton count={3} />
        </div>
      )}
    </section>
  )
}
