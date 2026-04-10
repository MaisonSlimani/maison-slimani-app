'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, Button } from '@maison/ui'
import { ShoppingBag, Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useRealtimeStock } from '@/lib/hooks/useRealtimeStock'
import { toast } from 'sonner'
import { trackAddToWishlist } from '@/lib/analytics'
import { cn } from '@maison/shared'
import { Product, ProductVariation } from '@maison/domain'
import ProductCardImage from './product/ProductCardImage'
import ProductPurchaseDialog from './product/ProductPurchaseDialog'
import { slugify } from '@/lib/utils/product-urls'

interface CarteProduitProps {
  produit: Product
  showActions?: boolean
}

const CarteProduit = ({ produit, showActions = false }: CarteProduitProps) => {
  const { items, addItem: addToCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedTaille, setSelectedTaille] = useState('')
  const [selectedCouleur, setSelectedCouleur] = useState('')
  const [quantite, setQuantite] = useState(1)

  useRealtimeStock(produit.id)
  const inWishlist = isInWishlist(produit.id)
  const isInCart = items.some(item => item.id === produit.id)
  
  const { colorImages, imageUrl, isOutOfStock } = useMemo(() => {
    const vars = produit.couleurs as ProductVariation[] | null
    const cImgs = (produit.has_colors && vars) ? vars.map(c => ({ 
      couleur: c.nom, 
      image: Array.isArray(c.images) ? c.images[0] : (c.images || produit.image_url) 
    })).filter(ci => ci.image) : []
    const img = (cImgs.length > 0 && cImgs[currentColorIndex]?.image) || produit.image_url || ''
    const outOfStock = produit.stock !== null && produit.stock <= 0 && (!produit.has_colors || !vars?.some(c => (c.stock || 0) > 0))
    return { colorImages: cImgs, imageUrl: img, isOutOfStock: outOfStock }
  }, [produit, currentColorIndex])

  const href = `/boutique/${produit.categorie ? slugify(produit.categorie) : 'cat'}/${produit.slug || slugify(produit.nom || '')}`

  const onAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (isAddingToCart || isOutOfStock) return
    if (produit.has_colors || (produit.tailles && produit.tailles.length > 0)) return setShowModal(true)
    setIsAddingToCart(true)
    try {
      await addToCart({ ...produit, quantite: 1, image_url: imageUrl, taille: null, couleur: null }, false)
      toast.success('Ajouté au panier')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Erreur') }
    finally { setIsAddingToCart(false) }
  }

  const onToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (inWishlist) return removeFromWishlist(produit.id)
    addToWishlist({ ...produit, quantite: 1, image_url: imageUrl, taille: null, couleur: null })
    trackAddToWishlist({ content_name: produit.nom, content_ids: [produit.id], content_type: 'product', value: produit.prix, currency: 'MAD' })
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all relative flex flex-col h-full">
      <Link href={href} className="flex-1 flex flex-col">
        <ProductCardImage 
          imageUrl={imageUrl} nom={produit.nom} hasMultipleColors={colorImages.length > 1}
          colorImages={colorImages} currentColorIndex={currentColorIndex}
          onPreviousColor={(e) => { e.preventDefault(); setCurrentColorIndex(i => i === 0 ? colorImages.length - 1 : i - 1) }}
          onNextColor={(e) => { e.preventDefault(); setCurrentColorIndex(i => i === colorImages.length - 1 ? 0 : i + 1) }}
          inWishlist={inWishlist} isOutOfStock={!!isOutOfStock}
        />
        <div className="p-4 flex-1 flex flex-col justify-between">
          <h3 className="font-medium text-lg truncate">{produit.nom}</h3>
          <p className="text-xl font-serif text-charbon mt-2">{produit.prix.toLocaleString('fr-MA')} DH</p>
        </div>
      </Link>
      {showActions && <CardActions isInCart={isInCart} inWishlist={inWishlist} onAdd={onAddToCart} onWish={onToggleWishlist} />}
      <ProductPurchaseDialog 
        showModal={showModal} setShowModal={setShowModal} produit={produit} selectedCouleur={selectedCouleur} setSelectedCouleur={setSelectedCouleur}
        selectedTaille={selectedTaille} setSelectedTaille={setSelectedTaille} quantite={quantite} setQuantite={setQuantite}
        taillesDisponibles={produit.tailles?.map((t) => t.nom) || []} onConfirm={async () => {
          setIsAddingToCart(true)
          try {
            await addToCart({ ...produit, quantite, taille: selectedTaille, couleur: selectedCouleur, image_url: imageUrl }, false)
            setShowModal(false); toast.success('Ajouté au panier')
          } catch (err) { toast.error(err instanceof Error ? err.message : 'Erreur') }
          finally { setIsAddingToCart(false) }
        }} isAddingToCart={isAddingToCart}
      />
    </Card>
  )
}

function CardActions({ isInCart, inWishlist, onAdd, onWish }: { isInCart: boolean; inWishlist: boolean; onAdd: (e: React.MouseEvent) => void; onWish: (e: React.MouseEvent) => void }) {
  return (
    <div className="px-4 pb-4 flex gap-2">
      <Button onClick={onAdd} className="flex-1 bg-dore text-charbon">{isInCart ? <ShoppingCart className="w-4 h-4 mr-2" /> : <ShoppingBag className="w-4 h-4 mr-2" />}{isInCart ? "Voir panier" : "Acheter"}</Button>
      <Button variant="outline" onClick={onWish} className={cn(inWishlist && "text-dore border-dore")}><Heart className={cn("w-4 h-4", inWishlist && "fill-current")} /></Button>
    </div>
  )
}

export default CarteProduit
