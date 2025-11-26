'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Heart, Check } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ProductCardProps {
  produit: {
    id: string
    nom: string
    slug?: string
    prix: number
    image_url?: string
    images?: any[]
    stock?: number
    taille?: string
    has_colors?: boolean
    couleurs?: any[]
  }
  priority?: boolean
}

export default function ProductCard({ produit, priority = false }: ProductCardProps) {
  const getFirstImage = () => {
    if (produit.images && produit.images.length > 0) {
      const firstImg = produit.images[0]
      return typeof firstImg === 'string' ? firstImg : firstImg.url
    }
    return produit.image_url || '/assets/placeholder.jpg'
  }

  const imageUrl = getFirstImage()
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  const href = `/pwa/produit/${produit.id}`

  const { addItem, items } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const inWishlist = isInWishlist(produit.id)
  const isInCart = items.some(item => item.id === produit.id)

  const isOutOfStock = () => {
    if (produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs)) {
      return !produit.couleurs.some(c => (c.stock || 0) > 0)
    }
    return produit.stock !== undefined && produit.stock <= 0
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAddingToCart || isOutOfStock()) return

    setIsAddingToCart(true)
    try {
      await addItem({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite: 1,
        image_url: imageUrl,
        image: imageUrl,
        stock: produit.stock,
      })
      setAddedToCart(true)
      toast.success('Ajouté au panier', { duration: 1000 })
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isTogglingWishlist) return

    setIsTogglingWishlist(true)
    try {
      if (inWishlist) {
        removeFromWishlist(produit.id)
        toast.success('Retiré des favoris', { duration: 1000 })
      } else {
        addToWishlist({
          id: produit.id,
          nom: produit.nom,
          prix: produit.prix,
          image_url: imageUrl,
          image: imageUrl,
          stock: produit.stock,
        })
        toast.success('Ajouté aux favoris', { duration: 1000 })
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la wishlist:', error)
      toast.error('Erreur lors de la modification')
    } finally {
      // Petit délai pour éviter les clics multiples rapides
      setTimeout(() => setIsTogglingWishlist(false), 300)
    }
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col h-full bg-card">
      <Link href={href} className="block flex-1 flex flex-col">
        <div className="aspect-square overflow-hidden bg-muted relative">
          <Image
            src={imageUrl}
            alt={produit.nom}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
            sizes="(max-width: 768px) 50vw, 33vw"
            fetchPriority={priority ? 'high' : 'auto'}
          />
          {inWishlist && (
            <div className="absolute top-2 right-2 z-20 bg-dore/90 backdrop-blur-sm rounded-full p-1.5">
              <Heart className="w-3 h-3 text-charbon fill-current" />
            </div>
          )}
          {isOutOfStock() && (
            <div className="absolute top-2 left-2 z-20 bg-red-600/95 backdrop-blur-sm rounded-md px-2 py-1">
              <span className="text-white text-[10px] font-semibold uppercase">Rupture</span>
            </div>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col justify-between">
          <h3 className="font-serif font-medium text-sm mb-1 line-clamp-2 leading-tight text-foreground">
            {produit.nom}
          </h3>
          <p className="text-base font-serif text-dore font-semibold">
            {produit.prix.toLocaleString('fr-MA')} MAD
          </p>
        </div>
      </Link>

      <div className="px-3 pb-3 flex gap-2">
        {isInCart ? (
          <Button
            size="sm"
            variant="outline"
            asChild
            className="flex-1 border-dore text-dore hover:bg-dore hover:text-charbon text-xs h-9"
          >
            <Link href="/pwa/panier" className="flex items-center justify-center">
              <Check className="w-3 h-3 mr-1" />
              Panier
            </Link>
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isOutOfStock()}
            className={cn(
              "flex-1 text-xs h-9",
              addedToCart
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-dore text-charbon hover:bg-dore/90"
            )}
          >
            {addedToCart ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center"
              >
                <Check className="w-3 h-3 mr-1" />
                OK
              </motion.div>
            ) : (
              <div className="flex items-center justify-center">
                <ShoppingBag className="w-3 h-3 mr-1" />
                {isAddingToCart ? 'Ajout...' : 'Ajouter'}
              </div>
            )}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          className={cn(
            "px-3 h-9",
            inWishlist && "bg-dore/20 border-dore text-dore",
            isTogglingWishlist && "opacity-50"
          )}
        >
          <Heart className={cn("w-3 h-3", inWishlist && "fill-current")} />
        </Button>
      </div>
    </Card>
  )
}

