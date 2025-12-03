'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CarteProduit from '@/components/CarteProduit'
import { Sparkles } from 'lucide-react'

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

interface UpsellProductsProps {
  productId: string
  className?: string
}

export default function UpsellProducts({ productId, className = '' }: UpsellProductsProps) {
  const [products, setProducts] = useState<Produit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpsells = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/produits/${productId}/upsells`)

        if (!response.ok) {
          throw new Error('Failed to fetch upsell products')
        }

        const payload = await response.json()

        if (payload.success && payload.data) {
          setProducts(payload.data)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error('Error fetching upsell products:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchUpsells()
    }
  }, [productId])

  if (loading || products.length === 0) {
    return null
  }

  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8 md:mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-dore" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charbon">
            Complétez votre look
          </h2>
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-dore" />
        </div>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
          Des produits sélectionnés spécialement pour vous, qui complètent parfaitement votre achat
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
              }}
              showActions={true}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

