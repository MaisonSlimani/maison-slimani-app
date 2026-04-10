'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@maison/ui'
import CarteProduit from '@/components/CarteProduit'
import { RECOMMENDATIONS_CONFIG } from '@/lib/config/recommendations'
import { Product } from '@maison/domain'
import { slugify } from '@/lib/utils/product-urls'

interface SimilarProductsProps {
  productId: string; productCategory: string; limit?: number; className?: string
}

export default function SimilarProducts({ productId, productCategory, limit = RECOMMENDATIONS_CONFIG.defaultLimit, className = '' }: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/produits/${productId}/similar?limit=${limit}`)
        if (!response.ok) throw new Error('Failed')
        const payload = await response.json()
        setProducts(payload.success ? payload.data || [] : [])
      } catch { setProducts([]) }
      finally { setLoading(false) }
    }
    if (productId) fetchSimilar()
  }, [productId, limit])

  if (loading && products.length === 0) return <LoadingSkeleton className={className} limit={limit} />
  if (!loading && products.length === 0) return <FallbackCategory productCategory={productCategory} className={className} />

  return (
    <motion.div className={cn("mt-20 pt-20 border-t border-border", className)} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <SectionHeader title="Produits similaires" subtitle="D'autres créations qui pourraient vous plaire" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <CarteProduit produit={p} showActions />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-serif mb-4">{title}</h2>
      <p className="text-muted-foreground text-lg">{subtitle}</p>
    </div>
  )
}

function LoadingSkeleton({ className, limit }: { className: string; limit: number }) {
  return (
    <div className={className}>
      <SectionHeader title="Produits similaires" subtitle="Chargement..." />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: limit }).map((_, i) => <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />)}
      </div>
    </div>
  )
}

function FallbackCategory({ productCategory, className }: { productCategory: string; className: string }) {
  const categorySlug = slugify(productCategory)
  return (
    <motion.div className={cn("mt-20 pt-20 border-t border-border", className)} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <SectionHeader title="Découvrez aussi" subtitle="D'autres créations de la même catégorie" />
      <div className="text-center px-4"><Button asChild variant="outline" size="lg" className="border-dore text-dore hover:bg-dore hover:text-charbon"><Link href={`/boutique/${categorySlug}`}>Voir toute la catégorie {productCategory}</Link></Button></div>
    </motion.div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) { return classes.filter(Boolean).join(' ') }
