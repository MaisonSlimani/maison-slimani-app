'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CarteProduit from '@/components/CarteProduit'
import { RECOMMENDATIONS_CONFIG } from '@/lib/config/recommendations'

interface ImageItem {
  url: string
  couleur?: string | null
  ordre?: number
}

interface Couleur {
  nom: string
  code?: string
  stock?: number
  taille?: string
}

interface Produit {
  id: string
  nom: string
  description: string
  prix: number
  stock: number
  image_url?: string
  images?: ImageItem[] | string[]
  couleurs?: Couleur[]
  has_colors?: boolean
  categorie: string
  vedette: boolean
  date_ajout: string
  taille?: string | null
  slug?: string
}

interface SimilarProductsProps {
  productId: string
  productCategory: string
  limit?: number
  className?: string
}

export default function SimilarProducts({
  productId,
  productCategory,
  limit = RECOMMENDATIONS_CONFIG.defaultLimit,
  className = '',
}: SimilarProductsProps) {
  const [products, setProducts] = useState<Produit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/produits/${productId}/similar?limit=${limit}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch similar products')
        }

        const payload = await response.json()

        if (payload.success && payload.data) {
          setProducts(payload.data)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error('Error fetching similar products:', err)
        setError('Failed to load similar products')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchSimilarProducts()
    }
  }, [productId, limit])

  // Don't render if loading and no products, or if error and no fallback
  if (loading && products.length === 0) {
    return (
      <div className={className}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Produits similaires
          </h2>
          <p className="text-muted-foreground text-lg">
            Chargement...
          </p>
        </div>
        {/* Loading skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    )
  }

  // If no products found, show category link as fallback
  if (!loading && products.length === 0) {
    return (
      <motion.div
        className={`mt-20 pt-20 border-t border-border ${className}`}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Découvrez aussi
          </h2>
          <p className="text-muted-foreground text-lg">
            D'autres créations de la même catégorie
          </p>
        </div>

        <div className="text-center px-4 md:px-6">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-dore text-dore hover:bg-dore hover:text-charbon px-4 md:px-8 py-6 text-base md:text-lg max-w-full mx-auto inline-flex justify-center items-center"
          >
            <Link
              href={`/boutique/${productCategory
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace('é', 'e')
                .replace('è', 'e')
                .replace('ê', 'e')}`}
              className="whitespace-normal text-center break-words flex items-center justify-center"
            >
              Voir toute la catégorie {productCategory}
            </Link>
          </Button>
        </div>
      </motion.div>
    )
  }

  // Render similar products
  return (
    <motion.div
      className={`mt-20 pt-20 border-t border-border ${className}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif mb-4">
          Produits similaires
        </h2>
        <p className="text-muted-foreground text-lg">
          D'autres créations qui pourraient vous plaire
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <CarteProduit
              produit={{
                id: product.id,
                nom: product.nom,
                prix: product.prix,
                image: product.image_url || '',
                image_url: product.image_url,
                images: product.images,
                stock: product.stock,
                taille: product.taille || undefined,
                has_colors: product.has_colors,
                couleurs: product.couleurs,
                categorie: product.categorie, // Pass category for hierarchical URLs
              }}
              showActions={true}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

