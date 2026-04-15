'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@maison/ui'
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton'
import { Product } from '@maison/domain'

const CarteProduit = dynamic(() => import('@/components/CarteProduit'), {
  ssr: true,
  loading: () => <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
})

const ProductCard = dynamic(() => import('@/components/pwa/ProductCard'), {
  ssr: true,
  loading: () => <div className="aspect-square bg-muted animate-pulse rounded-xl" />
})

interface HomeFeaturedProps {
  products: Product[]
  loading: boolean
}

/**
 * Unified Home Featured Section
 * Mobile: "Sélection" header + 2-col grid (all products, like old PWA)
 * Desktop: "Produits en Vedette" header + 3-col grid with luxury cards
 */
export function HomeFeatured({ products, loading }: HomeFeaturedProps) {
  if (loading) {
    return (
      <section className="py-6 md:py-24 px-4 md:px-6 bg-ecru/50 md:bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          <ProductCardSkeleton count={6} />
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="pt-6 pb-6 md:py-24 px-4 md:px-6 bg-ecru/50 md:bg-white">
      <div className="max-w-6xl mx-auto">
        <FeaturedHeader />
        <DesktopFeaturedGrid products={products} />
        <MobileFeaturedGrid products={products} />
      </div>
    </section>
  )
}

function FeaturedHeader() {
  return (
    <>
      <div className="hidden md:block text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-serif mb-4 text-charbon">Produits en Vedette</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos créations les plus emblématiques, sélectionnées pour leur excellence
          </p>
        </motion.div>
      </div>

      <div className="md:hidden flex items-center justify-between mb-8">
        <h2 className="text-3xl font-serif text-charbon">Sélection</h2>
        <Link href="/boutique">
          <Button variant="ghost" size="sm" className="text-dore">
            Voir tout <span className="ml-1">{'>'}</span>
          </Button>
        </Link>
      </div>
    </>
  )
}

function DesktopFeaturedGrid({ products }: { products: Product[] }) {
  return (
    <div className="hidden md:block">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
        {products.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8 }}
            className="transition-transform duration-500 h-full"
          >
            <CarteProduit product={p} showActions={true} />
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-dore text-dore hover:bg-dore hover:text-charbon"
        >
          <Link href="/boutique">Voir toute la collection</Link>
        </Button>
      </div>
    </div>
  )
}

function MobileFeaturedGrid({ products }: { products: Product[] }) {
  return (
    <div className="md:hidden">
      <div className="grid grid-cols-2 gap-4">
        {products.slice(0, 6).map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={p} priority={index < 2} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

