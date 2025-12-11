'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShoppingBag, ArrowLeft, Package, Share2, Check, CheckCircle, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import SoundPlayer from '@/components/SoundPlayer'
import GalerieProduit from '@/components/GalerieProduit'
import SimilarProducts from '@/components/SimilarProducts'
import { createClient } from '@/lib/supabase/client'
import { useIsPWA } from '@/lib/hooks/useIsPWA'
import PWAProduitContent from './PWAProduitContent'
import { trackViewContent } from '@/lib/analytics'
import ProductRatingSummary from '@/components/ProductRatingSummary'
import CommentsList from '@/components/CommentsList'
import CommentForm from '@/components/CommentForm'

interface ImageItem {
  url: string
  couleur?: string | null
  ordre?: number
}

interface Taille {
  nom: string
  stock: number
}

interface Couleur {
  nom: string
  code?: string
  images?: string[]
  stock?: number
  taille?: string // backward compatibility
  tailles?: Taille[]
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
  tailles?: Taille[]
  slug?: string
  average_rating?: number | null
  rating_count?: number
}

export default function ProduitSlugPage() {
  const { isPWA, isLoading: isDetecting } = useIsPWA()
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addItem, items, clearCart } = useCart()
  const [produit, setProduit] = useState<Produit | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantite, setQuantite] = useState(1)
  const [taille, setTaille] = useState<string>('')
  const [couleur, setCouleur] = useState<string>('')
  const [addedToCart, setAddedToCart] = useState(false)

  const isInCart = produit ? items.some(item => item.id === produit.id) : false

  useEffect(() => {
    if (isInCart && addedToCart) {
      setAddedToCart(false)
    }
  }, [isInCart, addedToCart, items])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Helper function to generate slug from product name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  useEffect(() => {
    const controller = new AbortController()

    const chargerProduit = async () => {
      try {
        setLoading(true)
        const slug = params.slug as string
        const categorie = params.categorie as string
        const id = searchParams.get('id')

        let produitData: Produit | null = null

        if (id) {
          const response = await fetch(`/api/produits/${id}`, {
            signal: controller.signal,
          })

          if (response.ok) {
            const payload = await response.json()
            produitData = payload?.data || null
          }
        }

        // Use hierarchical API route if category is available
        if (!produitData && categorie && slug) {
          const response = await fetch(
            `/api/produits/by-category-slug/${encodeURIComponent(categorie)}/${encodeURIComponent(slug)}`,
            { signal: controller.signal }
          )

          if (response.ok) {
            const payload = await response.json()
            produitData = payload?.data || null
          }
        }

        // Fallback to old route if hierarchical route fails
        if (!produitData && slug) {
          const response = await fetch(
            `/api/produits/by-slug/${encodeURIComponent(slug)}`,
            { signal: controller.signal }
          )

          if (response.ok) {
            const payload = await response.json()
            produitData = payload?.data || null
          }
        }

        if (produitData) {
          setProduit(produitData as any)
        } else {
          throw new Error('Produit introuvable')
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') {
          return
        }
        console.error('Erreur lors du chargement du produit:', e)
        toast.error('Produit introuvable')
        const categorie = params.categorie as string
        if (categorie) {
          router.push(`/boutique/${categorie}`)
        } else {
          router.push('/boutique')
        }
      } finally {
        setLoading(false)
      }
    }

    chargerProduit()

    return () => controller.abort()
  }, [params.slug, params.categorie, searchParams, router])

  // Realtime subscription for stock updates
  useEffect(() => {
    if (!produit?.id) return

    const supabase = createClient()
    const channel = supabase
      .channel(`produit-stock-${produit.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'produits',
          filter: `id=eq.${produit.id}`,
        },
        (payload) => {
          const updated = payload.new as Produit

          // Update product state with new stock data
          setProduit((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              stock: updated.stock,
              couleurs: updated.couleurs,
            }
          })

          // Show notification if stock became 0
          const currentStock = produit.has_colors && couleur && produit.couleurs
            ? produit.couleurs.find(c => c.nom === couleur)?.stock || 0
            : produit.stock || 0

          const newStock = updated.has_colors && couleur && updated.couleurs
            ? updated.couleurs.find(c => c.nom === couleur)?.stock || 0
            : updated.stock || 0

          if (currentStock > 0 && newStock === 0) {
            toast.warning(`Le produit "${produit.nom}"${couleur ? ` (${couleur})` : ''} est maintenant en rupture de stock`)
          } else if (currentStock === 0 && newStock > 0) {
            toast.success(`Le produit "${produit.nom}"${couleur ? ` (${couleur})` : ''} est de nouveau disponible`)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [produit?.id, couleur])


  useEffect(() => {
    if (produit?.has_colors && produit.couleurs && produit.couleurs.length > 0 && !couleur) {
      const firstAvailableColor = produit.couleurs.find(c => (c.stock || 0) > 0)
      if (firstAvailableColor) {
        setCouleur(firstAvailableColor.nom)
      } else if (produit.couleurs.length > 0) {
        setCouleur(produit.couleurs[0].nom)
      }
    }
  }, [produit, couleur])

  useEffect(() => {
    if (!produit) return

    // Track ViewContent for Meta Pixel
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

    document.title = `${produit.nom} | Maison Slimani`
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', produit.description.substring(0, 160))
    } else {
      const meta = document.createElement('meta') as HTMLMetaElement
      meta.name = 'description'
      meta.content = produit.description.substring(0, 160)
      document.head.appendChild(meta)
    }
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', `${produit.nom} | Maison Slimani`)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:title')
      meta.content = `${produit.nom} | Maison Slimani`
      document.head.appendChild(meta)
    }
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', produit.description.substring(0, 160))
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:description')
      meta.content = produit.description.substring(0, 160)
      document.head.appendChild(meta)
    }
    const ogImage = document.querySelector('meta[property="og:image"]')
    const imageUrl = produit.image_url || (produit.images && Array.isArray(produit.images) && produit.images.length > 0
      ? (typeof produit.images[0] === 'string' ? produit.images[0] : produit.images[0].url)
      : '')
    if (ogImage && imageUrl) {
      ogImage.setAttribute('content', imageUrl)
    } else if (imageUrl) {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:image')
      meta.content = imageUrl
      document.head.appendChild(meta)
    }
    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
      ogUrl.setAttribute('content', window.location.href)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:url')
      meta.content = window.location.href
      document.head.appendChild(meta)
    }

    // Add structured data (JSON-LD) for Product schema
    const existingScript = document.getElementById('product-structured-data')
    if (existingScript) {
      existingScript.remove()
    }

    if (produit) {
      const imageUrl = produit.image_url || (produit.images && Array.isArray(produit.images) && produit.images.length > 0
        ? (typeof produit.images[0] === 'string' ? produit.images[0] : produit.images[0].url)
        : '')

      // Prepare all product images (Google prefers multiple images for rich results)
      const allImages: string[] = []
      if (imageUrl) {
        // Ensure absolute URL
        const absoluteImageUrl = imageUrl.startsWith('http')
          ? imageUrl
          : `${window.location.origin}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`
        allImages.push(absoluteImageUrl)
      }

      // Add additional images if available
      if (produit.images && Array.isArray(produit.images) && produit.images.length > 0) {
        produit.images.forEach((img: any) => {
          const imgUrl = typeof img === 'string' ? img : (img.url || img.src)
          if (imgUrl && !allImages.includes(imgUrl)) {
            const absoluteImgUrl = imgUrl.startsWith('http')
              ? imgUrl
              : `${window.location.origin}${imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl}`
            allImages.push(absoluteImgUrl)
          }
        })
      }

      const script = document.createElement('script')
      script.id = 'product-structured-data'
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: produit.nom,
        description: produit.description,
        image: allImages.length > 0 ? (allImages.length === 1 ? allImages[0] : allImages) : undefined,
        sku: produit.id,
        category: produit.categorie || 'Chaussures Homme',
        brand: {
          '@type': 'Brand',
          name: 'Maison Slimani'
        },
        offers: {
          '@type': 'Offer',
          price: produit.prix,
          priceCurrency: 'MAD',
          availability: produit.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: window.location.href,
          priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
          itemCondition: 'https://schema.org/NewCondition'
        }
      })
      document.head.appendChild(script)
    }
  }, [produit])

  const handleAddToCart = async () => {
    if (!produit) return
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
      // Stock check will be done per size
    }
    // Get tailles and check stock per size
    let taillesData: Taille[] = []
    if (produit.has_colors && couleur && produit.couleurs) {
      const couleurSelected = produit.couleurs.find(c => c.nom === couleur)
      if (couleurSelected?.tailles && Array.isArray(couleurSelected.tailles)) {
        taillesData = couleurSelected.tailles
      } else if (couleurSelected?.taille) {
        const tailleList = couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
        const stockPerSize = tailleList.length > 0 ? Math.floor((couleurSelected.stock || 0) / tailleList.length) : 0
        taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
      } else if (produit.tailles && Array.isArray(produit.tailles)) {
        taillesData = produit.tailles
      } else if (produit.taille) {
        const tailleList = produit.taille.split(',').map(t => t.trim()).filter(t => t)
        const stockPerSize = tailleList.length > 0 ? Math.floor((produit.stock || 0) / tailleList.length) : 0
        taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
      }
    } else if (produit.tailles && Array.isArray(produit.tailles)) {
      taillesData = produit.tailles
    } else if (produit.taille) {
      const tailleList = produit.taille.split(',').map(t => t.trim()).filter(t => t)
      const stockPerSize = tailleList.length > 0 ? Math.floor((produit.stock || 0) / tailleList.length) : 0
      taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
    }

    if (taillesData.length > 0 && !taille) {
      toast.error('Veuillez sélectionner une taille')
      return
    }
    if (taillesData.length > 0 && taille) {
      const selectedTaille = taillesData.find(t => t.nom === taille)
      if (!selectedTaille) {
        toast.error('Taille invalide')
        return
      }
      if (selectedTaille.stock < quantite) {
        toast.error(`Stock insuffisant pour la taille ${taille}. Stock disponible: ${selectedTaille.stock}`)
        return
      }
    } else if (!produit.has_colors && produit.stock < quantite) {
      toast.error('Stock insuffisant')
      return
    }
    try {
      const categorie = params.categorie as string
      const slug = params.slug as string
      await addItem({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite,
        image_url: produit.image_url,
        taille: taille || undefined,
        couleur: produit.has_colors && couleur ? couleur : undefined,
        stock: taillesData.length > 0 && taille
          ? (taillesData.find(t => t.nom === taille)?.stock || 0)
          : (produit.has_colors && couleur && produit.couleurs
            ? (produit.couleurs.find(c => c.nom === couleur)?.stock || 0)
            : produit.stock),
        categorie: produit.categorie,
        slug: produit.slug || slug,
        categorySlug: categorie,
      })
      setAddedToCart(true)
      if ((window as any).playSuccessSound) {
        ; (window as any).playSuccessSound()
      }
      setTimeout(() => {
        setAddedToCart(false)
      }, 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier')
      setAddedToCart(false)
    }
  }

  const handleButtonClick = () => {
    // Click sound removed
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
      // Stock check will be done per size
    }
    // Get tailles and check stock per size
    let taillesData: Taille[] = []
    if (produit.has_colors && couleur && produit.couleurs) {
      const couleurSelected = produit.couleurs.find(c => c.nom === couleur)
      if (couleurSelected?.tailles && Array.isArray(couleurSelected.tailles)) {
        taillesData = couleurSelected.tailles
      } else if (couleurSelected?.taille) {
        const tailleList = couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
        const stockPerSize = tailleList.length > 0 ? Math.floor((couleurSelected.stock || 0) / tailleList.length) : 0
        taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
      } else if (produit.tailles && Array.isArray(produit.tailles)) {
        taillesData = produit.tailles
      } else if (produit.taille) {
        const tailleList = produit.taille.split(',').map(t => t.trim()).filter(t => t)
        const stockPerSize = tailleList.length > 0 ? Math.floor((produit.stock || 0) / tailleList.length) : 0
        taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
      }
    } else if (produit.tailles && Array.isArray(produit.tailles)) {
      taillesData = produit.tailles
    } else if (produit.taille) {
      const tailleList = produit.taille.split(',').map(t => t.trim()).filter(t => t)
      const stockPerSize = tailleList.length > 0 ? Math.floor((produit.stock || 0) / tailleList.length) : 0
      taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
    }

    if (taillesData.length > 0 && !taille) {
      toast.error('Veuillez sélectionner une taille')
      return
    }
    if (taillesData.length > 0 && taille) {
      const selectedTaille = taillesData.find(t => t.nom === taille)
      if (!selectedTaille) {
        toast.error('Taille invalide')
        return
      }
      if (selectedTaille.stock < quantite) {
        toast.error(`Stock insuffisant pour la taille ${taille}. Stock disponible: ${selectedTaille.stock}`)
        return
      }
    } else if (!produit.has_colors && produit.stock < quantite) {
      toast.error('Stock insuffisant')
      return
    }

    try {
      // Clear existing cart first
      clearCart()

      // Small delay to ensure cart is cleared before adding new item
      await new Promise(resolve => setTimeout(resolve, 100))

      // Add the current product to cart (without opening drawer)
      const categorie = params.categorie as string
      const slug = params.slug as string
      await addItem({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite,
        image_url: produit.image_url,
        taille: taille || undefined,
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

  const handleShare = async () => {
    if (!produit) return
    const shareData = {
      title: `${produit.nom} - Maison Slimani`,
      text: produit.description,
      url: window.location.href,
    }
    try {
      if (navigator.share) {
        try {
          // Check if canShare exists and can share this data
          const canShare = (navigator as any).canShare
          if (canShare && !canShare(shareData)) {
            throw new Error('Cannot share this data')
          }
          await navigator.share(shareData)
          toast.success('Lien partagé avec succès')
          return
        } catch (shareError: any) {
          // If share fails, fall through to clipboard
          if (shareError.name === 'AbortError') {
            return // User cancelled, don't show error
          }
        }
      }
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié dans le presse-papier')
    } catch (error: any) {
      toast.error('Erreur lors du partage')
    }
    handleButtonClick()
  }

  // Show loading state while detecting device
  if (isDetecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dore mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Render PWA version
  if (isPWA) {
    return <PWAProduitContent />
  }

  if (loading) {
    return (
      <div className="min-h-screen pb-24 md:pb-0 pt-0 md:pt-20 flex items-center justify-center">
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

  // Render desktop version
  return (
    <div className="min-h-screen pb-24 md:pb-0 pt-0 md:pt-20">
      <SoundPlayer enabled={true} />

      <div className="container px-6 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const categorie = params.categorie as string
              if (categorie) {
                router.push(`/boutique/${categorie}`)
              } else {
                router.back()
              }
              handleButtonClick()
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </motion.div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 pb-20 space-y-16">
        {/* Product Details Section */}
        <div className="grid md:grid-cols-[35%_65%] gap-12 lg:gap-16">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <GalerieProduit
              images={produit.images}
              couleurs={produit.couleurs}
              imageUrl={produit.image_url}
              enableZoom={true}
              showThumbnails={true}
              selectedColor={couleur}
            />
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
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {produit.categorie}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight">
                {produit.nom}
              </h1>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <p className="text-3xl md:text-4xl font-serif text-dore mb-6">
                {produit.prix.toLocaleString('fr-MA')} DH
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-headings:font-bold prose-h1:text-4xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2 prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:text-lg prose-strong:text-foreground prose-strong:font-semibold prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:border-l-dore prose-blockquote:text-muted-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-table:text-foreground overflow-hidden"
            >
              <div
                className="break-words overflow-wrap-anywhere max-w-full [&_img]:max-w-full [&_img]:h-auto [&_table]:max-w-full [&_table]:overflow-x-auto [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_iframe]:max-w-full [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol_li]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul_li]:my-2 [&_li_p]:m-0 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-foreground [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-foreground [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-foreground"
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

            {!produit.has_colors && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className={produit.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {produit.stock > 0
                      ? `${produit.stock} disponible${produit.stock > 1 ? 's' : ''}`
                      : 'Rupture de stock'}
                  </span>
                </div>
              </motion.div>
            )}

            {produit.has_colors && produit.couleurs && produit.couleurs.length > 0 && (() => {
              const selectedColorStock = couleur ? (produit.couleurs.find(c => c.nom === couleur)?.stock || 0) : null
              // Only show stock if it's below 10 or is 0 (out of stock)
              if (selectedColorStock === null || selectedColorStock >= 10) {
                return null
              }
              return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className={selectedColorStock > 0 ? 'text-yellow-600' : 'text-red-600'}>
                      {selectedColorStock === 0
                        ? 'Rupture de stock pour cette couleur'
                        : selectedColorStock === 1
                          ? `Il ne reste qu'un seul article pour ${couleur}`
                          : `Il ne reste que ${selectedColorStock} articles pour ${couleur}`}
                    </span>
                  </div>
                </motion.div>
              )
            })()}

            {produit.has_colors && produit.couleurs && produit.couleurs.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="space-y-2">
                <label className="text-sm font-medium">Couleur *:</label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {produit.couleurs.map((c) => {
                    const couleurNom = c.nom
                    const isSelected = couleur === couleurNom
                    const stockCouleur = c.stock || 0
                    const isOutOfStock = stockCouleur === 0
                    const colorCode = c.code || '#000000'
                    return (
                      <button
                        key={couleurNom}
                        type="button"
                        onClick={() => {
                          if (!isOutOfStock) {
                            setCouleur(couleurNom)
                            if (quantite > stockCouleur) {
                              setQuantite(stockCouleur)
                            }
                          }
                        }}
                        disabled={isOutOfStock}
                        className={cn(
                          'relative flex flex-col items-center gap-2 transition-all hover:scale-105',
                          isOutOfStock && 'opacity-50 cursor-not-allowed'
                        )}
                        title={couleurNom}
                      >
                        <div
                          className={cn(
                            'w-12 h-12 rounded-lg border-2 transition-all shadow-md',
                            isSelected
                              ? 'border-charbon shadow-lg scale-110 ring-2 ring-charbon ring-offset-2'
                              : 'border-gray-300 hover:border-gray-400',
                            isOutOfStock && 'border-gray-200 opacity-50'
                          )}
                          style={{ backgroundColor: isOutOfStock ? '#e5e5e5' : colorCode }}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className={cn('text-xs font-medium text-center', isSelected ? 'text-charbon font-semibold' : 'text-foreground', isOutOfStock && 'text-muted-foreground')}>
                          {couleurNom}
                        </span>
                        {isOutOfStock && <span className="text-xs text-red-600">Rupture</span>}
                      </button>
                    )
                  })}
                </div>
                {!couleur && <p className="text-xs text-red-600 mt-1">Veuillez sélectionner une couleur</p>}
              </motion.div>
            )}

            {(() => {
              // Get tailles from new structure or fallback to old structure
              let taillesData: Taille[] = []
              if (produit.has_colors && couleur && produit.couleurs) {
                const couleurSelected = produit.couleurs.find(c => c.nom === couleur)
                if (couleurSelected?.tailles && Array.isArray(couleurSelected.tailles)) {
                  taillesData = couleurSelected.tailles
                } else if (couleurSelected?.taille) {
                  // Backward compatibility: convert taille string to tailles array
                  const tailleList = couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
                  const stockPerSize = tailleList.length > 0 ? Math.floor((couleurSelected.stock || 0) / tailleList.length) : 0
                  taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
                } else if (produit.tailles && Array.isArray(produit.tailles)) {
                  taillesData = produit.tailles
                } else if (produit.taille) {
                  const tailleList = produit.taille.split(',').map(t => t.trim()).filter(t => t)
                  const stockPerSize = tailleList.length > 0 ? Math.floor((produit.stock || 0) / tailleList.length) : 0
                  taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
                }
              } else if (produit.tailles && Array.isArray(produit.tailles)) {
                taillesData = produit.tailles
              } else if (produit.taille) {
                // Backward compatibility
                const tailleList = produit.taille.split(',').map(t => t.trim()).filter(t => t)
                const stockPerSize = tailleList.length > 0 ? Math.floor((produit.stock || 0) / tailleList.length) : 0
                taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
              }

              // Show size selector if sizes are defined (regardless of stock)
              if (taillesData.length > 0) {
                return (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="space-y-2">
                    <label className="text-sm font-medium">Taille:</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {taillesData.map((t) => {
                        const tailleValue = t.nom
                        const isSelected = taille === tailleValue
                        const isOutOfStock = t.stock <= 0
                        return (
                          <button
                            key={tailleValue}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => !isOutOfStock && setTaille(tailleValue)}
                            className={cn(
                              'w-12 h-12 rounded-lg border-2 font-medium transition-all relative',
                              isOutOfStock
                                ? 'opacity-30 cursor-not-allowed bg-muted text-muted-foreground border-muted'
                                : isSelected
                                  ? 'bg-dore text-charbon border-dore shadow-lg scale-105 hover:scale-105'
                                  : 'bg-background text-foreground border-border hover:border-dore hover:scale-105'
                            )}
                          >
                            {tailleValue}
                            {isOutOfStock && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-red-600 text-white px-1 rounded">Rupture</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    {taillesData.every(t => t.stock <= 0) && (
                      <p className="text-xs text-red-600 mt-1">Toutes les tailles sont en rupture de stock</p>
                    )}
                  </motion.div>
                )
              }
              return null
            })()}

            {(() => {
              // Check if product is available (has stock in any size or color)
              if (produit.has_colors && couleur && produit.couleurs) {
                const couleurSelected = produit.couleurs.find(c => c.nom === couleur)
                if (couleurSelected) {
                  // Check if color has tailles with stock
                  if (couleurSelected.tailles && Array.isArray(couleurSelected.tailles)) {
                    const hasStock = couleurSelected.tailles.some(t => t.stock > 0)
                    if (hasStock) return true
                  }
                  // Fallback to color stock
                  return (couleurSelected.stock || 0) > 0
                }
                return false
              } else {
                // Check if product has tailles with stock
                if (produit.tailles && Array.isArray(produit.tailles)) {
                  const hasStock = produit.tailles.some(t => t.stock > 0)
                  if (hasStock) return true
                }
                // Fallback to product stock
                return produit.stock > 0
              }
            })() && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="flex items-center gap-4">
                  <label htmlFor="quantite" className="text-sm font-medium">Quantité:</label>
                  <div className="flex items-center gap-2 border border-border rounded-lg">
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantite(Math.max(1, quantite - 1))} disabled={quantite <= 1}>−</Button>
                    <span className="w-12 text-center font-medium">{quantite}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => {
                        const maxStock = produit.has_colors && couleur ? (produit.couleurs?.find(c => c.nom === couleur)?.stock || 0) : produit.stock
                        setQuantite(Math.min(maxStock, quantite + 1))
                      }}
                      disabled={quantite >= (produit.has_colors && couleur ? (produit.couleurs?.find(c => c.nom === couleur)?.stock || 0) : produit.stock)}
                    >
                      +
                    </Button>
                  </div>
                </motion.div>
              )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {isInCart ? (
                  <Button size="lg" variant="outline" asChild className="flex-1 font-medium text-base py-4 transition-all duration-300 border-charbon text-charbon hover:bg-charbon hover:text-background">
                    <Link href="/panier">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Aller au panier
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className={cn('flex-1 font-medium text-base py-4 transition-all duration-300', addedToCart ? 'bg-green-600 text-white hover:bg-green-700 border-green-700' : 'bg-dore text-charbon hover:bg-dore/90 border-dore')}
                      onClick={() => {
                        handleAddToCart()
                        handleButtonClick()
                      }}
                      disabled={
                        addedToCart ||
                        (produit.has_colors ? (!couleur || (produit.couleurs?.find(c => c.nom === couleur)?.stock || 0) === 0) : produit.stock === 0)
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
                            ? (couleur && (produit.couleurs?.find(c => c.nom === couleur)?.stock || 0) > 0)
                              ? 'Ajouter au panier'
                              : (!couleur ? 'Sélectionnez une couleur' : 'Rupture de stock')
                            : (produit.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock')}
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 font-medium text-base py-4 transition-all duration-300 bg-charbon text-background hover:bg-charbon/90 border-charbon"
                      onClick={() => {
                        handleBuyNow()
                        handleButtonClick()
                      }}
                      disabled={
                        produit.has_colors ? (!couleur || (produit.couleurs?.find(c => c.nom === couleur)?.stock || 0) === 0) : produit.stock === 0
                      }
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Acheter maintenant
                    </Button>
                  </>
                )}
                <Button variant="outline" size="lg" className="px-6 border-border hover:bg-accent" onClick={handleShare} title="Partager ce produit">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="pt-8 border-t border-border space-y-4">
              <Card className="p-6 bg-muted/50 border-border">
                <h3 className="font-serif text-xl mb-4">Informations</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-dore" />
                    <span>Livraison gratuite dans tout le Maroc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-dore" />
                    <span>Retours sous 7 jours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-dore" />
                    <span>Fait main au Maroc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-dore" />
                    <span>Cuir de qualité supérieure</span>
                  </div>
                </div>
              </Card>
            </motion.div>

          </motion.div>
        </div>

        {/* Avis et Commentaires Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="max-w-4xl mx-auto space-y-8 pt-12 border-t border-border"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">Avis des clients</h2>
            <p className="text-muted-foreground">Découvrez ce que nos clients pensent de ce produit</p>
          </div>

          {/* Rating Summary */}
          {produit.rating_count !== undefined && produit.rating_count !== null && produit.rating_count > 0 && produit.average_rating !== null && produit.average_rating !== undefined && produit.average_rating > 0 && (
            <div className="mb-8">
              <ProductRatingSummary
                produitId={produit.id}
                averageRating={produit.average_rating}
                ratingCount={produit.rating_count}
              />
            </div>
          )}

          {/* Comments List */}
          <div>
            <CommentsList
              produitId={produit.id}
              onCommentUpdate={() => {
                // Refresh product data to update ratings
                window.location.reload()
              }}
            />
          </div>

          {/* Comment Form */}
          <div className="border-t border-border pt-8">
            <h3 className="text-2xl font-serif font-semibold mb-6">Laisser un commentaire</h3>
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




