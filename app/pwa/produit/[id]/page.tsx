'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShoppingBag, Check, ArrowLeft, Heart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Produit {
  id: string
  nom: string
  description: string
  prix: number
  stock: number
  image_url?: string
  images?: any[]
  couleurs?: any[]
  has_colors?: boolean
  taille?: string
}

export default function PWAProduitPage() {
  const params = useParams()
  const router = useRouter()
  const produitId = params.id as string
  const [produit, setProduit] = useState<Produit | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantite, setQuantite] = useState(1)
  const [couleur, setCouleur] = useState<string>('')
  const [addedToCart, setAddedToCart] = useState(false)

  const { addItem, items } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const isInCart = produit ? items.some(item => item.id === produit.id) : false
  const inWishlist = produit ? isInWishlist(produit.id) : false

  useEffect(() => {
    window.scrollTo(0, 0)
    
    const chargerProduit = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/produits/${produitId}`)
        if (!response.ok) throw new Error('Produit introuvable')
        const payload = await response.json()
        const produitData = payload?.data
        if (produitData) {
          setProduit(produitData)
          if (produitData.has_colors && produitData.couleurs?.length > 0) {
            const firstAvailable = produitData.couleurs.find((c: any) => (c.stock || 0) > 0)
            if (firstAvailable) setCouleur(firstAvailable.nom)
          }
        } else {
          throw new Error('Produit introuvable')
        }
      } catch (error) {
        toast.error('Produit introuvable')
        router.push('/pwa/boutique')
      } finally {
        setLoading(false)
      }
    }

    if (produitId) {
      chargerProduit()
    }
  }, [produitId, router])

  const getImageUrl = () => {
    if (produit?.images && produit.images.length > 0) {
      const firstImg = produit.images[0]
      return typeof firstImg === 'string' ? firstImg : firstImg.url
    }
    return produit?.image_url || '/assets/placeholder.jpg'
  }

  const handleAddToCart = async () => {
    if (!produit) return

    if (produit.has_colors && !couleur) {
      toast.error('Veuillez sélectionner une couleur')
      return
    }

    if (produit.stock < quantite) {
      toast.error('Stock insuffisant')
      return
    }

    try {
      await addItem({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite,
        image_url: getImageUrl(),
        image: getImageUrl(),
        stock: produit.stock,
        couleur: couleur || undefined,
      })
      setAddedToCart(true)
      toast.success('Ajouté au panier')
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  const handleToggleWishlist = () => {
    if (!produit) return
    if (inWishlist) {
      removeFromWishlist(produit.id)
      toast.success('Retiré des favoris')
    } else {
      addToWishlist({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        image_url: getImageUrl(),
        image: getImageUrl(),
        stock: produit.stock,
      })
      toast.success('Ajouté aux favoris')
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen pb-20 px-4 py-8">
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!produit) {
    return null
  }

  const taillesDisponibles = produit.taille
    ? produit.taille.split(',').map(t => t.trim()).filter(t => t)
    : []

  return (
    <div className="w-full min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-serif text-foreground flex-1 line-clamp-1">{produit.nom}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleWishlist}
          className={cn("h-8 w-8", inWishlist && "text-dore")}
        >
          <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
        </Button>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image
            src={getImageUrl()}
            alt={produit.nom}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-serif text-foreground mb-2">{produit.nom}</h2>
            <p className="text-2xl font-serif text-dore font-semibold">
              {produit.prix.toLocaleString('fr-MA')} MAD
            </p>
          </div>

          {produit.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{produit.description}</p>
            </div>
          )}

          {/* Colors */}
          {produit.has_colors && produit.couleurs && produit.couleurs.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Couleur</h3>
              <div className="flex flex-wrap gap-2">
                {produit.couleurs.map((c: any) => (
                  <button
                    key={c.nom}
                    onClick={() => setCouleur(c.nom)}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                      couleur === c.nom
                        ? 'bg-dore text-charbon border-dore'
                        : 'bg-background text-foreground border-border hover:border-dore',
                      (c.stock || 0) === 0 && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={(c.stock || 0) === 0}
                  >
                    {c.nom} {(c.stock || 0) === 0 && '(Rupture)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {taillesDisponibles.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Taille</h3>
              <div className="flex flex-wrap gap-2">
                {taillesDisponibles.map((taille) => (
                  <button
                    key={taille}
                    className="px-4 py-2 rounded-lg border-2 border-border hover:border-dore text-sm font-medium transition-all"
                  >
                    {taille}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-medium mb-2">Quantité</h3>
            <div className="flex items-center gap-2 border border-border rounded-lg w-fit">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantite(Math.max(1, quantite - 1))}
                disabled={quantite <= 1}
              >
                −
              </Button>
              <span className="w-12 text-center font-medium">{quantite}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantite(Math.min(produit.stock, quantite + 1))}
                disabled={quantite >= produit.stock}
              >
                +
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Stock disponible: {produit.stock}
            </p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Card className="p-4">
          {isInCart ? (
            <Button
              asChild
              size="lg"
              className="w-full bg-green-600 text-white hover:bg-green-700"
            >
              <a href="/pwa/panier" className="flex items-center justify-center">
                <Check className="h-4 w-4 mr-2" />
                Voir le panier
              </a>
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={produit.stock === 0 || addedToCart}
              className={cn(
                "w-full",
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
                  <Check className="h-4 w-4 mr-2" />
                  Ajouté !
                </motion.div>
              ) : (
                <div className="flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Ajouter au panier
                </div>
              )}
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}

