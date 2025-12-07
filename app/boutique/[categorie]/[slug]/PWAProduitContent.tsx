'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShoppingBag, Check, Heart, Package, Share2, CheckCircle, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import GalerieProduit from '@/components/GalerieProduit'
import SimilarProducts from '@/components/SimilarProducts'
import { slugify } from '@/lib/utils/product-urls'
import { trackViewContent, trackAddToWishlist } from '@/lib/meta-pixel'
import ProductRatingSummary from '@/components/ProductRatingSummary'
import CommentsList from '@/components/CommentsList'
import CommentForm from '@/components/CommentForm'

interface Couleur {
  nom: string
  code?: string
  stock?: number
  taille?: string
  images?: string[]
}

interface Produit {
  id: string
  nom: string
  description: string
  prix: number
  stock: number
  image_url?: string
  images?: any[]
  couleurs?: Couleur[]
  has_colors?: boolean
  taille?: string
  categorie?: string
  vedette?: boolean
  slug?: string
  average_rating?: number | null
  rating_count?: number
}

export default function PWAProduitContent() {
  const params = useParams()
  const router = useRouter()
  const categorie = params.categorie as string
  const slug = params.slug as string
  const [produit, setProduit] = useState<Produit | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantite, setQuantite] = useState(1)
  const [couleur, setCouleur] = useState<string>('')
  const [taille, setTaille] = useState<string>('')
  const [addedToCart, setAddedToCart] = useState(false)

  const { addItem, items, clearCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const isInCart = produit ? items.some(item => item.id === produit.id) : false
  const inWishlist = produit ? isInWishlist(produit.id) : false

  useEffect(() => {
    window.scrollTo(0, 0)
    
    const chargerProduit = async () => {
      try {
        setLoading(true)
        // Use hierarchical API route
        const response = await fetch(
          `/api/produits/by-category-slug/${encodeURIComponent(categorie)}/${encodeURIComponent(slug)}`
        )
        if (!response.ok) throw new Error('Produit introuvable')
        const payload = await response.json()
        const produitData = payload?.data
        if (produitData) {
          setProduit(produitData)
          if (produitData.has_colors && produitData.couleurs?.length > 0) {
            const firstAvailable = produitData.couleurs.find((c: Couleur) => (c.stock || 0) > 0)
            if (firstAvailable) setCouleur(firstAvailable.nom)
          }
        } else {
          throw new Error('Produit introuvable')
        }
      } catch (error) {
        toast.error('Produit introuvable')
        router.push('/boutique')
      } finally {
        setLoading(false)
      }
    }

    if (categorie && slug) {
      chargerProduit()
    }
  }, [categorie, slug, router])

  // Track ViewContent when product loads
  useEffect(() => {
    if (produit) {
      trackViewContent({
        content_name: produit.nom,
        content_ids: [produit.id],
        content_type: 'product',
        value: produit.prix,
        currency: 'MAD',
        contents: [{
          id: produit.id,
          quantity: 1,
          item_price: produit.prix,
        }],
      })
    }
  }, [produit])

  const handleAddToCart = async () => {
    if (!produit) return

    if (produit.has_colors && !couleur) {
      toast.error('Veuillez sélectionner une couleur')
      return
    }

    // Get available sizes
    let taillesDisponibles: string[] = []
    if (produit.has_colors && couleur && produit.couleurs) {
      const couleurSelected = produit.couleurs.find(c => c.nom === couleur)
      if (couleurSelected?.taille) {
        taillesDisponibles = couleurSelected.taille.split(',').map(t => t.trim())
      } else if (produit.taille) {
        taillesDisponibles = produit.taille.split(',').map(t => t.trim())
      }
    } else if (produit.taille) {
      taillesDisponibles = produit.taille.split(',').map(t => t.trim())
    }

    if (taillesDisponibles.length > 0 && !taille) {
      toast.error('Veuillez sélectionner une taille')
      return
    }

    // Check stock
    let stockDisponible = produit.stock
    if (produit.has_colors && couleur && produit.couleurs) {
      const couleurSelected = produit.couleurs.find(c => c.nom === couleur)
      stockDisponible = couleurSelected?.stock || 0
    }

    if (stockDisponible < quantite) {
      toast.error('Stock insuffisant')
      return
    }

    try {
      await addItem({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite,
        image_url: produit.image_url,
        image: produit.image_url,
        stock: stockDisponible,
        couleur: couleur || undefined,
        taille: taille || undefined,
        categorie: produit.categorie,
        slug: produit.slug || slug,
        categorySlug: categorie,
      })
      setAddedToCart(true)
      if ((window as any).playSuccessSound) {
        (window as any).playSuccessSound()
      }
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  const handleBuyNow = async () => {
    if (!produit) return
    
    // Validate product selection (same as handleAddToCart)
    if (produit.has_colors && !couleur) {
      toast.error('Veuillez sélectionner une couleur')
      return
    }
    if (produit.has_colors && couleur && produit.couleurs) {
      const couleurExists = produit.couleurs.some(c => c.nom === couleur)
      if (!couleurExists) {
        toast.error('Couleur invalide')
        return
      }
      const couleurSelected = produit.couleurs.find(c => c.nom === couleur)
      const stockCouleur = couleurSelected?.stock || 0
      if (stockCouleur < quantite) {
        toast.error(`Stock insuffisant pour la couleur ${couleur}`)
        return
      }
    }
    let taillesDisponibles: string[] = []
    if (produit.has_colors && couleur && produit.couleurs) {
      const couleurSelected = produit.couleurs.find(c => c.nom === couleur)
      if (couleurSelected?.taille) {
        taillesDisponibles = couleurSelected.taille.split(',').map(t => t.trim())
      } else if (produit.taille) {
        taillesDisponibles = produit.taille.split(',').map(t => t.trim())
      }
    } else if (produit.taille) {
      taillesDisponibles = produit.taille.split(',').map(t => t.trim())
    }
    if (taillesDisponibles.length > 0 && !taille) {
      toast.error('Veuillez sélectionner une taille')
      return
    }
    if (taillesDisponibles.length > 0 && taille) {
      if (!taillesDisponibles.includes(taille)) {
        toast.error('Taille invalide')
        return
      }
    }
    if (!produit.has_colors && produit.stock < quantite) {
      toast.error('Stock insuffisant')
      return
    }

    try {
      // Clear existing cart first
      clearCart()
      
      // Small delay to ensure cart is cleared before adding new item
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Add the current product to cart (without opening drawer)
      await addItem({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite,
        image_url: produit.image_url,
        image: produit.image_url,
        taille: (produit.has_colors && couleur && produit.couleurs) 
          ? (produit.couleurs.find(c => c.nom === couleur)?.taille || produit.taille || undefined)
            ? taille 
            : undefined
          : (produit.taille ? taille : undefined),
        couleur: produit.has_colors && couleur ? couleur : undefined,
        stock: produit.has_colors && couleur && produit.couleurs 
          ? (produit.couleurs.find(c => c.nom === couleur)?.stock || 0)
          : produit.stock,
        categorie: produit.categorie,
        slug: produit.slug || slug,
        categorySlug: categorie,
      }, false) // Don't open cart drawer for "Buy Now"
      
      // Small delay before redirect to ensure cart is updated
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Redirect to checkout
      router.push('/checkout')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier')
    }
  }

  const handleToggleWishlist = () => {
    if (!produit) return
    if (inWishlist) {
      removeFromWishlist(produit.id)
      toast.success('Retiré des favoris')
    } else {
      // Calculate stock for wishlist item
      // For products with colors, use total stock from all colors
      // For products without colors, use main stock field
      let stockForWishlist = produit.stock
      if (produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs) && produit.couleurs.length > 0) {
        stockForWishlist = produit.couleurs.reduce((sum: number, c: any) => sum + (c.stock || 0), 0)
      }
      
      addToWishlist({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        image_url: produit.image_url,
        image: produit.image_url,
        stock: stockForWishlist,
        categorie: produit.categorie,
        slug: produit.slug || slug,
        categorySlug: categorie,
      })
      // Track AddToWishlist event for Meta Pixel
      trackAddToWishlist({
        content_name: produit.nom,
        content_ids: [produit.id],
        content_type: 'product',
        value: produit.prix,
        currency: 'MAD',
      })
      // Open wishlist drawer after state has time to update
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('openWishlistDrawer'))
        }, 150)
      }
      toast.success('Ajouté aux favoris')
    }
  }

  const handleShare = async () => {
    if (!produit) return

    const shareData = {
      title: `${produit.nom} - Maison Slimani`,
      text: produit.description,
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast.success('Lien partagé')
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Lien copié')
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href)
          toast.success('Lien copié')
        } catch {
          toast.error('Erreur lors du partage')
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dore mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!produit) {
    return null
  }

  // Calculate stock based on selected color
  const getStock = () => {
    if (produit.has_colors && couleur && produit.couleurs) {
      const couleurSelected = produit.couleurs.find(c => c.nom === couleur)
      return couleurSelected?.stock || 0
    }
    return produit.stock
  }

  const stockDisponible = getStock()

  // Get available sizes based on color selection
  const getTaillesDisponibles = (): string[] => {
    if (produit.has_colors && couleur && produit.couleurs) {
      const couleurSelected = produit.couleurs.find(c => c.nom === couleur)
      if (couleurSelected?.taille) {
        return couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
      } else if (produit.taille) {
        return produit.taille.split(',').map(t => t.trim()).filter(t => t)
      }
    } else if (produit.taille) {
      return produit.taille.split(',').map(t => t.trim()).filter(t => t)
    }
    return []
  }

  const taillesDisponibles = getTaillesDisponibles()
  const isAvailable = produit.has_colors
    ? (couleur && stockDisponible > 0)
    : produit.stock > 0

  return (
    <div className="w-full min-h-screen pb-24">
      {/* Contenu principal */}
      <div className="px-4 pt-4 pb-20">
        {/* Galerie d'images */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <GalerieProduit
            images={produit.images}
            couleurs={produit.couleurs}
            imageUrl={produit.image_url}
            enableZoom={false}
            showThumbnails={true}
            selectedColor={couleur}
          />

          {/* Badge vedette */}
          {produit.vedette && (
            <motion.div
              className="absolute top-4 right-4 z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <div className="bg-dore text-charbon px-4 py-2 rounded-full text-sm font-serif font-semibold shadow-lg">
                ⭐ En vedette
              </div>
            </motion.div>
          )}

          {/* Wishlist Button */}
          <motion.button
            className={cn(
              "absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-colors",
              inWishlist && "text-dore"
            )}
            onClick={handleToggleWishlist}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
          </motion.button>
        </motion.div>

        {/* Informations produit */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          {/* Catégorie */}
          {produit.categorie && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href={`/boutique/${categorie}`}
                className="text-sm text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              >
                {produit.categorie}
              </Link>
            </motion.div>
          )}

          {/* Nom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-serif leading-tight">
              {produit.nom}
            </h1>
          </motion.div>

          {/* Prix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-3xl font-serif text-dore">
              {produit.prix.toLocaleString('fr-MA')} DH
            </p>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-headings:font-bold prose-h1:text-2xl prose-h1:font-bold prose-h1:mt-6 prose-h1:mb-3 prose-h2:text-xl prose-h2:font-bold prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-3 prose-h3:mb-2 prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:text-sm prose-strong:text-foreground prose-strong:font-semibold prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:border-l-dore prose-blockquote:text-muted-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-table:text-foreground overflow-hidden"
          >
            <div
              className="break-words overflow-wrap-anywhere max-w-full [&_img]:max-w-full [&_img]:h-auto [&_table]:max-w-full [&_table]:overflow-x-auto [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_iframe]:max-w-full [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol_li]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul_li]:my-2 [&_li_p]:m-0 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:text-foreground"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              dangerouslySetInnerHTML={{ __html: produit.description }}
            />
            <style jsx>{`
              div :global([style*="font-family"]) {
                font-family: unset !important;
              }
              div :global([style*="font-family"]) * {
                font-family: inherit !important;
              }
            `}</style>
          </motion.div>

          {/* Stock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-muted-foreground" />
              {produit.has_colors ? (
                couleur ? (
                  <span className={stockDisponible > 0 ? 'text-green-600' : 'text-red-600'}>
                    {stockDisponible > 0
                      ? `${stockDisponible} disponible${stockDisponible > 1 ? 's' : ''} pour ${couleur}`
                      : 'Rupture de stock pour cette couleur'}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Sélectionnez une couleur
                  </span>
                )
              ) : (
                <span className={produit.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {produit.stock > 0
                    ? `${produit.stock} disponible${produit.stock > 1 ? 's' : ''}`
                    : 'Rupture de stock'}
                </span>
              )}
            </div>
          </motion.div>

          {/* Sélecteur de couleur */}
          {produit.has_colors && produit.couleurs && produit.couleurs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="space-y-3"
            >
              <label className="text-sm font-medium">
                Couleur *:
              </label>
              <div className="flex flex-wrap gap-3">
                {produit.couleurs.map((c) => {
                  const isSelected = couleur === c.nom
                  const stockCouleur = c.stock || 0
                  const isOutOfStock = stockCouleur === 0
                  const colorCode = c.code || '#000000'
                  
                  return (
                    <button
                      key={c.nom}
                      type="button"
                      onClick={() => {
                        if (!isOutOfStock) {
                          setCouleur(c.nom)
                          setTaille('') // Reset size when color changes
                          if (quantite > stockCouleur) {
                            setQuantite(stockCouleur)
                          }
                        }
                      }}
                      disabled={isOutOfStock}
                      className={cn(
                        'relative flex flex-col items-center gap-2 transition-all',
                        isOutOfStock && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-lg border-2 transition-all shadow-md',
                          isSelected
                            ? 'border-charbon shadow-lg scale-110 ring-2 ring-charbon ring-offset-2'
                            : 'border-gray-300',
                          isOutOfStock && 'border-gray-200 opacity-50'
                        )}
                        style={{
                          backgroundColor: isOutOfStock ? '#e5e5e5' : colorCode,
                        }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-white drop-shadow-lg"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className={cn(
                        'text-xs font-medium text-center',
                        isSelected ? 'text-charbon font-semibold' : 'text-foreground',
                        isOutOfStock && 'text-muted-foreground'
                      )}>
                        {c.nom}
                      </span>
                      {isOutOfStock && (
                        <span className="text-xs text-red-600">Rupture</span>
                      )}
                    </button>
                  )
                })}
              </div>
              {!couleur && (
                <p className="text-xs text-red-600">Veuillez sélectionner une couleur</p>
              )}
            </motion.div>
          )}

          {/* Sélecteur de taille */}
          {taillesDisponibles.length > 0 && isAvailable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <label className="text-sm font-medium">
                Taille:
              </label>
              <div className="flex flex-wrap gap-2">
                {taillesDisponibles.map((t) => {
                  const isSelected = taille === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTaille(t)}
                      className={cn(
                        'w-12 h-12 rounded-lg border-2 font-medium transition-all',
                        isSelected
                          ? 'bg-dore text-charbon border-dore shadow-lg scale-105'
                          : 'bg-background text-foreground border-border hover:border-dore'
                      )}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Sélecteur de quantité */}
          {isAvailable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="flex items-center gap-4"
            >
              <label className="text-sm font-medium">
                Quantité:
              </label>
              <div className="flex items-center gap-2 border border-border rounded-lg">
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
                  onClick={() => setQuantite(Math.min(stockDisponible, quantite + 1))}
                  disabled={quantite >= stockDisponible}
                >
                  +
                </Button>
              </div>
            </motion.div>
          )}

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-3 pt-4"
          >
            {isInCart ? (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full font-medium text-base py-6 transition-all duration-300 border-charbon text-charbon hover:bg-charbon hover:text-background"
              >
                <Link href="/panier">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Aller au panier
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className={cn(
                    "w-full font-medium text-base py-6 transition-all duration-300",
                    addedToCart
                      ? "bg-green-600 text-white hover:bg-green-700 border-green-700"
                      : "bg-dore text-charbon hover:bg-dore/90 border-dore"
                  )}
                  onClick={handleAddToCart}
                  disabled={
                    addedToCart ||
                    (produit.has_colors 
                      ? (!couleur || stockDisponible === 0)
                      : produit.stock === 0
                    )
                  }
                >
                  {addedToCart ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Ajouté au panier !
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      {produit.has_colors 
                        ? (couleur && stockDisponible > 0)
                          ? 'Ajouter au panier'
                          : (!couleur ? 'Sélectionnez une couleur' : 'Rupture de stock')
                        : (produit.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock')
                      }
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  className="w-full font-medium text-base py-4 transition-all duration-300 bg-charbon text-background hover:bg-charbon/90 border-charbon disabled:bg-charbon disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={handleBuyNow}
                  disabled={
                    Boolean(
                      (!produit.has_colors && produit.stock === 0) ||
                      (produit.has_colors && couleur && stockDisponible === 0)
                    )
                  }
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Acheter maintenant
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="lg"
              className="w-full border-border hover:bg-accent"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Partager
            </Button>
          </motion.div>

          {/* Informations supplémentaires */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="pt-6 border-t border-border"
          >
            <Card className="p-5 bg-muted/50 border-border">
              <h3 className="font-serif text-lg mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dore flex-shrink-0" />
                  <span>Livraison gratuite dans tout le Maroc</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dore flex-shrink-0" />
                  <span>Retours sous 7 jours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dore flex-shrink-0" />
                  <span>Fait main au Maroc</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dore flex-shrink-0" />
                  <span>Cuir de qualité supérieure</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Voir la catégorie */}
          {produit.categorie && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="pt-4"
            >
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-dore text-dore hover:bg-dore hover:text-charbon py-6 text-base"
              >
                <Link href={`/boutique/${categorie}`}>
                  Voir toute la catégorie {produit.categorie}
                </Link>
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Avis et Commentaires Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="px-4 space-y-6 mt-8"
        >
          <div className="text-center mb-6 pt-6 border-t border-border">
            <h2 className="text-2xl font-serif font-bold mb-2">Avis des clients</h2>
            <p className="text-muted-foreground text-sm">Découvrez ce que nos clients pensent de ce produit</p>
          </div>

          {/* Rating Summary */}
          {produit.rating_count !== undefined && produit.rating_count !== null && produit.rating_count > 0 && produit.average_rating !== null && produit.average_rating !== undefined && produit.average_rating > 0 && (
            <div className="mb-6">
              <ProductRatingSummary
                produitId={produit.id}
                averageRating={produit.average_rating}
                ratingCount={produit.rating_count}
              />
            </div>
          )}

          {/* Comments List */}
          <div className="border-t border-border pt-6">
            <CommentsList 
              produitId={produit.id}
              onCommentUpdate={() => {
                // Refresh product data to update ratings
                window.location.reload()
              }}
            />
          </div>
          
          {/* Comment Form */}
          <div className="border-t border-border pt-6">
            <h3 className="text-xl font-serif font-semibold mb-4">Laisser un commentaire</h3>
            <CommentForm
              produitId={produit.id}
              onSuccess={() => {
                // Refresh comments list
                window.location.reload()
              }}
            />
          </div>
        </motion.div>

        {/* Produits similaires */}
        {produit && produit.categorie && (
          <SimilarProducts
            productId={produit.id}
            productCategory={produit.categorie}
          />
        )}
      </div>
    </div>
  )
}

