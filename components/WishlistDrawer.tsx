'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Heart, Trash2, ShoppingBag, ShoppingCart } from 'lucide-react'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { slugify } from '@/lib/utils/product-urls'

interface WishlistDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Taille {
  nom: string
  stock: number
}

interface ProductData {
  id: string
  nom: string
  prix: number
  stock?: number
  has_colors?: boolean
  couleurs?: Array<{
    nom: string
    code?: string
    stock?: number
    taille?: string // backward compatibility
    tailles?: Taille[]
  }>
  taille?: string // backward compatibility
  tailles?: Taille[]
  image_url?: string
  image?: string
}

export default function WishlistDrawer({ open, onOpenChange }: WishlistDrawerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { items, removeItem, isLoaded } = useWishlist()
  const { addItem: addToCart, items: cartItems } = useCart()
  
  const isPWA = pathname?.startsWith('/pwa') || false
  
  // Check if item is in cart
  const isInCart = (itemId: string) => {
    return cartItems.some(item => item.id === itemId)
  }
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<typeof items[0] | null>(null)
  const [productData, setProductData] = useState<ProductData | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [selectedCouleur, setSelectedCouleur] = useState<string>('')
  const [selectedTaille, setSelectedTaille] = useState<string>('')
  const [quantite, setQuantite] = useState(1)

  const handleRemove = (id: string) => {
    removeItem(id)
    toast.success('Retiré des favoris', { duration: 1500 })
  }

  const fetchProductData = async (item: typeof items[0]) => {
    setLoadingProduct(true)
    try {
      // Try to fetch by category and slug first
      let response: Response | null = null
      if (item.categorySlug && item.slug) {
        response = await fetch(
          `/api/produits/by-category-slug/${encodeURIComponent(item.categorySlug)}/${encodeURIComponent(item.slug)}`
        )
      }
      
      // Fallback to ID if category/slug fetch fails
      if (!response || !response.ok) {
        response = await fetch(`/api/produits/${item.id}`)
      }
      
      if (response && response.ok) {
        const payload = await response.json()
        const data = payload?.data
        if (data) {
          setProductData(data)
          // Set default color if product has colors
          if (data.has_colors && data.couleurs && data.couleurs.length > 0) {
            const firstAvailable = data.couleurs.find((c: any) => (c.stock || 0) > 0)
            if (firstAvailable) {
              setSelectedCouleur(firstAvailable.nom)
            }
          }
          setSelectedItem(item)
          setShowModal(true)
          setQuantite(1)
          setSelectedTaille('')
        } else {
          throw new Error('Produit introuvable')
        }
      } else {
        throw new Error('Erreur lors du chargement du produit')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Erreur lors du chargement du produit')
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleAddToCart = async () => {
    if (!selectedItem || !productData) return

    // Validate color selection
    if (productData.has_colors && productData.couleurs && productData.couleurs.length > 0 && !selectedCouleur) {
      toast.error('Veuillez sélectionner une couleur')
      return
    }

    // Get tailles and check stock per size
    interface Taille { nom: string; stock: number }
    let taillesData: Taille[] = []
    if (productData.has_colors && selectedCouleur && productData.couleurs) {
      const couleurSelected = productData.couleurs.find(c => c.nom === selectedCouleur)
      if (couleurSelected?.tailles && Array.isArray(couleurSelected.tailles)) {
        taillesData = couleurSelected.tailles
      } else if (couleurSelected?.taille) {
        const tailleList = couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
        const stockPerSize = tailleList.length > 0 ? Math.floor((couleurSelected.stock || 0) / tailleList.length) : 0
        taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
      } else if (productData.tailles && Array.isArray(productData.tailles)) {
        taillesData = productData.tailles
      } else if (productData.taille) {
        const tailleList = productData.taille.split(',').map(t => t.trim()).filter(t => t)
        const stockPerSize = tailleList.length > 0 ? Math.floor((productData.stock || 0) / tailleList.length) : 0
        taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
      }
    } else if (productData.tailles && Array.isArray(productData.tailles)) {
      taillesData = productData.tailles
    } else if (productData.taille) {
      const tailleList = productData.taille.split(',').map(t => t.trim()).filter(t => t)
      const stockPerSize = tailleList.length > 0 ? Math.floor((productData.stock || 0) / tailleList.length) : 0
      taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
    }

    if (taillesData.length > 0 && !selectedTaille) {
      toast.error('Veuillez sélectionner une taille')
      return
    }

    // Check stock per size
    let stockDisponible = productData.stock || 0
    if (taillesData.length > 0 && selectedTaille) {
      const selectedTailleData = taillesData.find(t => t.nom === selectedTaille)
      if (!selectedTailleData) {
        toast.error('Taille invalide')
        return
      }
      if (selectedTailleData.stock < quantite) {
        toast.error(`Stock insuffisant pour la taille ${selectedTaille}. Stock disponible: ${selectedTailleData.stock}`)
        return
      }
      stockDisponible = selectedTailleData.stock
    } else if (productData.has_colors && selectedCouleur && productData.couleurs) {
      const couleurSelected = productData.couleurs.find(c => c.nom === selectedCouleur)
      stockDisponible = couleurSelected?.stock || 0
      if (stockDisponible < quantite) {
        toast.error('Stock insuffisant')
        return
      }
    } else if (stockDisponible < quantite) {
      toast.error('Stock insuffisant')
      return
    }

    try {
      await addToCart({
        id: selectedItem.id,
        nom: selectedItem.nom,
        prix: selectedItem.prix,
        quantite,
        image_url: selectedItem.image_url || selectedItem.image,
        image: selectedItem.image_url || selectedItem.image,
        stock: stockDisponible,
        couleur: selectedCouleur || undefined,
        taille: selectedTaille || undefined,
      }, false) // Don't open cart drawer
      toast.success('Ajouté au panier', { duration: 1500 })
      setShowModal(false)
      setSelectedItem(null)
      setProductData(null)
      setSelectedCouleur('')
      setSelectedTaille('')
      setQuantite(1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier')
    }
  }

  const getProductUrl = (item: typeof items[0]) => {
    // Use hierarchical URL if category and slug are available
    if (item.categorySlug && item.slug) {
      return `/boutique/${item.categorySlug}/${item.slug}`
    }
    // Fallback: use product ID route which will redirect properly
    return `/boutique/produit/${item.id}`
  }

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[85vw] sm:w-[60vw] sm:max-w-[500px] flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-2xl font-serif flex items-center gap-2">
            <Heart className="w-6 h-6 fill-current" />
            Mes Favoris
          </SheetTitle>
          <SheetDescription>
            {items.length === 0 
              ? 'Votre liste de favoris est vide' 
              : `${items.length} article${items.length > 1 ? 's' : ''} dans vos favoris`
            }
          </SheetDescription>
        </SheetHeader>

        {!isLoaded ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dore mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-serif mb-2">Votre liste de favoris est vide</h3>
            <p className="text-muted-foreground text-center mb-6">
              Ajoutez des produits à vos favoris pour les retrouver facilement
            </p>
            <Button asChild onClick={() => onOpenChange(false)}>
              <Link href={isPWA ? '/pwa/boutique' : '/boutique'}>
                Découvrir la collection
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border border-border rounded-lg hover:border-dore/50 transition-colors"
                  >
                    <Link
                      href={getProductUrl(item)}
                      onClick={() => onOpenChange(false)}
                      className="flex-shrink-0"
                    >
                      <div className="relative w-20 h-20 rounded overflow-hidden bg-muted">
                        <OptimizedImage
                          src={item.image_url || item.image || '/placeholder.jpg'}
                          alt={item.nom}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </Link>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          href={getProductUrl(item)}
                          onClick={() => onOpenChange(false)}
                          className="block"
                        >
                          <h3 className="font-medium text-sm mb-1 line-clamp-2 hover:text-dore transition-colors">
                            {item.nom}
                          </h3>
                        </Link>
                        <p className="text-base font-serif text-dore font-semibold">
                          {item.prix.toLocaleString('fr-MA')} MAD
                        </p>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                          {isInCart(item.id) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="flex-1 border-charbon text-charbon hover:bg-charbon hover:text-background text-xs"
                            >
                              <Link href={isPWA ? '/pwa/panier' : '/panier'} onClick={() => onOpenChange(false)}>
                                <ShoppingBag className="w-3 h-3 mr-1" />
                                Panier
                              </Link>
                            </Button>
                          ) : (
                        <Button
                          size="sm"
                          variant="outline"
                              onClick={() => fetchProductData(item)}
                              disabled={loadingProduct}
                          className="flex-1 border-dore text-dore hover:bg-dore hover:text-charbon text-xs"
                        >
                          <ShoppingBag className="w-3 h-3 mr-1" />
                              {loadingProduct ? 'Chargement...' : 'Ajouter au panier'}
                        </Button>
                          )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemove(item.id)}
                          className="px-3 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

              <div className="border-t px-6 py-4 bg-muted/50 space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-dore text-dore hover:bg-dore hover:text-charbon"
                  onClick={() => onOpenChange(false)}
                >
                  <Link href={isPWA ? '/pwa/favoris' : '/favoris'}>
                    Voir Favoris
                  </Link>
                </Button>
                <Button
                  className="w-full bg-dore text-charbon hover:bg-dore/90"
                  onClick={() => onOpenChange(false)}
                >
                  Continuer les achats
                </Button>
              </div>
          </>
        )}
      </SheetContent>
    </Sheet>

      {/* Modal pour sélectionner couleur, taille et quantité */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.nom}</DialogTitle>
            <DialogDescription>
              {productData?.has_colors && productData.couleurs && productData.couleurs.length > 0
                ? 'Sélectionnez la couleur, la taille et la quantité souhaitées'
                : 'Sélectionnez la taille et la quantité souhaitées'}
            </DialogDescription>
          </DialogHeader>
          
          {productData && (
            <div className="space-y-6 py-4">
              {/* Sélecteur de couleur */}
              {productData.has_colors && productData.couleurs && productData.couleurs.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Couleur *</label>
                  <div className="flex flex-wrap gap-3">
                    {productData.couleurs.map((c) => {
                      const isSelected = selectedCouleur === c.nom
                      const stockCouleur = c.stock || 0
                      const isOutOfStock = stockCouleur === 0
                      const colorCode = c.code || '#000000'
                      
                      return (
                        <button
                          key={c.nom}
                          type="button"
                          onClick={() => {
                            if (!isOutOfStock) {
                              setSelectedCouleur(c.nom)
                              setSelectedTaille('') // Reset size when color changes
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
                  {!selectedCouleur && (
                    <p className="text-xs text-red-600">Veuillez sélectionner une couleur</p>
                  )}
                </div>
              )}

              {/* Sélecteur de taille - basé sur la couleur sélectionnée */}
              {(() => {
                interface Taille { nom: string; stock: number }
                let taillesData: Taille[] = []
                if (productData.has_colors && selectedCouleur && productData.couleurs) {
                  const couleurSelected = productData.couleurs.find((c) => c.nom === selectedCouleur)
                  if (couleurSelected?.tailles && Array.isArray(couleurSelected.tailles)) {
                    taillesData = couleurSelected.tailles
                  } else if (couleurSelected?.taille) {
                    const tailleList = couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
                    const stockPerSize = tailleList.length > 0 ? Math.floor((couleurSelected.stock || 0) / tailleList.length) : 0
                    taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
                  } else if (productData.tailles && Array.isArray(productData.tailles)) {
                    taillesData = productData.tailles
                  } else if (productData.taille) {
                    const tailleList = productData.taille.split(',').map(t => t.trim()).filter(t => t)
                    const stockPerSize = tailleList.length > 0 ? Math.floor((productData.stock || 0) / tailleList.length) : 0
                    taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
                  }
                } else if (productData.tailles && Array.isArray(productData.tailles)) {
                  taillesData = productData.tailles
                } else if (productData.taille) {
                  const tailleList = productData.taille.split(',').map(t => t.trim()).filter(t => t)
                  const stockPerSize = tailleList.length > 0 ? Math.floor((productData.stock || 0) / tailleList.length) : 0
                  taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
                }

                if (taillesData.length > 0 && (!productData.has_colors || selectedCouleur)) {
                  return (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Taille</label>
                      <div className="flex flex-wrap gap-2">
                        {taillesData.map((t) => {
                          const isSelected = selectedTaille === t.nom
                          const isOutOfStock = t.stock <= 0
                          return (
                            <button
                              key={t.nom}
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => !isOutOfStock && setSelectedTaille(t.nom)}
                              className={cn(
                                'w-12 h-12 rounded-lg border-2 font-medium transition-all relative',
                                isOutOfStock 
                                  ? 'opacity-30 cursor-not-allowed bg-muted text-muted-foreground border-muted' 
                                  : isSelected
                                    ? 'bg-dore text-charbon border-dore shadow-lg scale-105 hover:scale-105'
                                    : 'bg-background text-foreground border-border hover:border-dore hover:scale-105'
                              )}
                            >
                              {t.nom}
                              {isOutOfStock && (
                                <span className="absolute -top-1 -right-1 text-[8px] bg-red-600 text-white px-1 rounded">Rupture</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              {/* Sélecteur de quantité */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Quantité</label>
                <div className="flex items-center gap-2 border border-border rounded-lg w-fit">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => {
                      const maxQty = productData.has_colors && selectedCouleur && productData.couleurs
                        ? (productData.couleurs.find((c) => c.nom === selectedCouleur)?.stock || 0)
                        : (productData.stock || 999)
                      setQuantite(Math.max(1, quantite - 1))
                    }}
                    disabled={quantite <= 1}
                  >
                    −
                  </Button>
                  <span className="w-12 text-center font-medium">{quantite}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => {
                      const maxQty = productData.has_colors && selectedCouleur && productData.couleurs
                        ? (productData.couleurs.find((c) => c.nom === selectedCouleur)?.stock || 0)
                        : (productData.stock || 999)
                      setQuantite(Math.min(maxQty, quantite + 1))
                    }}
                    disabled={(() => {
                      const maxQty = productData.has_colors && selectedCouleur && productData.couleurs
                        ? (productData.couleurs.find((c) => c.nom === selectedCouleur)?.stock || 0)
                        : (productData.stock || 999)
                      return quantite >= maxQty
                    })()}
                  >
                    +
                  </Button>
                </div>
                {(() => {
                  const stockDisponible = productData.has_colors && selectedCouleur && productData.couleurs
                    ? (productData.couleurs.find((c) => c.nom === selectedCouleur)?.stock || 0)
                    : (productData.stock || 0)
                  return stockDisponible > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Stock disponible: {stockDisponible}
                    </p>
                  )
                })()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setSelectedItem(null)
                setProductData(null)
                setSelectedTaille('')
                setSelectedCouleur('')
                setQuantite(1)
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={
                loadingProduct ||
                (productData?.has_colors && productData.couleurs && productData.couleurs.length > 0 && !selectedCouleur) ||
                (() => {
                  if (!productData) return true
                  let availableSizes: string[] = []
                  if (productData.has_colors && selectedCouleur && productData.couleurs) {
                    const couleurSelected = productData.couleurs.find((c) => c.nom === selectedCouleur)
                    if (couleurSelected?.taille) {
                      availableSizes = couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
                    } else if (productData.taille) {
                      availableSizes = productData.taille.split(',').map(t => t.trim()).filter(t => t)
                    }
                  } else if (productData.taille) {
                    availableSizes = productData.taille.split(',').map(t => t.trim()).filter(t => t)
                  }
                  return availableSizes.length > 0 && !selectedTaille
                })()}
              className="bg-dore text-charbon hover:bg-dore/90"
            >
              Ajouter au panier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
