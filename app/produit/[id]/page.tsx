'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShoppingBag, ArrowLeft, Package, Share2, Check, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import NavigationDesktop from '@/components/NavigationDesktop'
import EnteteMobile from '@/components/EnteteMobile'
import Footer from '@/components/Footer'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import SoundPlayer from '@/components/SoundPlayer'

interface Produit {
  id: string
  nom: string
  description: string
  prix: number
  stock: number
  image_url?: string
  categorie: string
  vedette: boolean
  date_ajout: string
}

export default function ProduitPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [produit, setProduit] = useState<Produit | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantite, setQuantite] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    chargerProduit()
  }, [params.id])

  // Mettre à jour le titre de la page
  useEffect(() => {
    if (produit) {
      document.title = `${produit.nom} | Maison Slimani`
    }
  }, [produit])

  const chargerProduit = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setProduit(data)
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error)
      toast.error('Produit introuvable')
      router.push('/boutique')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!produit) return

    if (produit.stock < quantite) {
      toast.error('Stock insuffisant')
      return
    }

    addItem({
      id: produit.id,
      nom: produit.nom,
      prix: produit.prix,
      quantite,
      image_url: produit.image_url,
    })

    // Afficher le message de succès dans le bouton
    setAddedToCart(true)
    
    // Son d'ajout au panier
    if ((window as any).playSuccessSound) {
      ;(window as any).playSuccessSound()
    }

    // Réinitialiser le message après 2 secondes
    setTimeout(() => {
      setAddedToCart(false)
    }, 2000)
  }

  const handleButtonClick = () => {
    if ((window as any).playClickSound) {
      ;(window as any).playClickSound()
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
      // Utiliser l'API Web Share si disponible (mobile)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast.success('Lien partagé avec succès')
      } else {
        // Fallback: copier le lien dans le presse-papier
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Lien copié dans le presse-papier')
      }
    } catch (error: any) {
      // L'utilisateur a annulé le partage ou erreur
      if (error.name !== 'AbortError') {
        // Fallback: copier le lien dans le presse-papier
        try {
          await navigator.clipboard.writeText(window.location.href)
          toast.success('Lien copié dans le presse-papier')
        } catch (clipboardError) {
          toast.error('Erreur lors du partage')
        }
      }
    }
    
    handleButtonClick()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  const imageUrl = produit.image_url || '/placeholder-product.jpg'

  return (
    <div className="min-h-screen pb-24 md:pb-0 pt-0 md:pt-20">
      <SoundPlayer enabled={true} />
      <NavigationDesktop />
      <EnteteMobile />

      {/* Bouton retour */}
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
              router.back()
              handleButtonClick()
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </motion.div>
      </div>

      {/* Contenu principal */}
      <div className="container max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Image principale */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="aspect-square relative bg-muted">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dore"></div>
                  </div>
                )}
                <Image
                  src={imageUrl}
                  alt={produit.nom}
                  fill
                  className={`object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </Card>

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
          </motion.div>

          {/* Informations produit */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            {/* Catégorie */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {produit.categorie}
              </p>
            </motion.div>

            {/* Nom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight">
                {produit.nom}
              </h1>
            </motion.div>

            {/* Prix */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-3xl md:text-4xl font-serif text-dore mb-6">
                {produit.prix.toLocaleString('fr-MA')} DH
              </p>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="prose prose-sm max-w-none"
            >
              <p className="text-foreground/80 leading-relaxed text-lg whitespace-pre-line">
                {produit.description}
              </p>
            </motion.div>

            {/* Stock */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className={produit.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {produit.stock > 0
                    ? `${produit.stock} disponible${produit.stock > 1 ? 's' : ''}`
                    : 'Rupture de stock'}
                </span>
              </div>
            </motion.div>

            {/* Sélecteur de quantité */}
            {produit.stock > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-4"
              >
                <label htmlFor="quantite" className="text-sm font-medium">
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
                    onClick={() => setQuantite(Math.min(produit.stock, quantite + 1))}
                    disabled={quantite >= produit.stock}
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
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button
                size="lg"
                className={cn(
                  "flex-1 font-medium text-base py-4 transition-all duration-300",
                  addedToCart
                    ? "bg-green-600 text-white hover:bg-green-700 border-green-700"
                    : "bg-dore text-charbon hover:bg-dore/90 border-dore"
                )}
                onClick={() => {
                  handleAddToCart()
                  handleButtonClick()
                }}
                disabled={produit.stock === 0 || addedToCart}
              >
                {addedToCart ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Ajouté au panier !
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    {produit.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-6 border-border hover:bg-accent"
                onClick={handleShare}
                title="Partager ce produit"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Informations supplémentaires */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="pt-8 border-t border-border space-y-4"
            >
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

            {/* Produits similaires */}
        <motion.div
          className="mt-20 pt-20 border-t border-border"
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

          <div className="text-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-dore text-dore hover:bg-dore hover:text-charbon px-8 py-6 text-lg"
              onClick={handleButtonClick}
            >
              <Link href={`/boutique/${produit.categorie.toLowerCase().replace(/\s+/g, '-').replace('é', 'e').replace('è', 'e').replace('ê', 'e')}`}>
                Voir toute la catégorie {produit.categorie}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}

