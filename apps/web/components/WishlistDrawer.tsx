'use client'

import React, { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@maison/ui'
import { Button } from '@maison/ui'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { WishlistItem } from './wishlist/WishlistItem'
import { WishlistEmptyState } from './wishlist/WishlistEmptyState'
import ProductPurchaseDialog from './product/ProductPurchaseDialog'
import { Product, CartItem } from '@maison/domain'

import { apiFetch, ENDPOINTS } from '@/lib/api/client'

export default function WishlistDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { items, removeItem, isLoaded } = useWishlist()
  const { addItem: addToCart, items: cartItems } = useCart()
  const [showModal, setShowModal] = useState(false)
  const [productData, setProductData] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCouleur, setSelectedCouleur] = useState('')
  const [selectedTaille, setSelectedTaille] = useState('')
  const [quantite, setQuantite] = useState(1)

  const handleAddToCart = async (item: CartItem) => {
    setLoading(true)
    try {
      const result = await apiFetch<Product>(`${ENDPOINTS.PRODUITS}/${item.id}`)
      if (result.success && result.data) { setProductData(result.data); setShowModal(true) }
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  const onConfirm = async () => {
    try {
      if (!productData) return
      await addToCart({ ...productData, quantite, taille: selectedTaille, couleur: selectedCouleur, image_url: productData.image_url }, false)
      setShowModal(false); toast.success('Ajouté')
    } catch (err) { toast.error((err as Error).message) }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[85vw] sm:w-[500px] flex flex-col p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="text-2xl font-serif flex items-center gap-2"><Heart className="w-6 h-6 fill-current" /> Favoris</SheetTitle>
            <SheetDescription>{items.length} articles</SheetDescription>
          </SheetHeader>
          <WishlistContent isLoaded={isLoaded} items={items} cartItems={cartItems} loading={loading} onAddToCart={handleAddToCart} onRemove={removeItem} onClose={() => onOpenChange(false)} />
        </SheetContent>
      </Sheet>
      {productData && <ProductPurchaseDialog showModal={showModal} setShowModal={setShowModal} produit={productData} selectedCouleur={selectedCouleur} setSelectedCouleur={setSelectedCouleur} selectedTaille={selectedTaille} setSelectedTaille={setSelectedTaille} quantite={quantite} setQuantite={setQuantite} taillesDisponibles={productData.tailles?.map(t => t.nom) || []} onConfirm={onConfirm} isAddingToCart={false} />}
    </>
  )
}

function WishlistContent({ isLoaded, items, cartItems, loading, onAddToCart, onRemove, onClose }: { isLoaded: boolean; items: CartItem[]; cartItems: CartItem[]; loading: boolean; onAddToCart: (i: CartItem) => void; onRemove: (id: string) => void; onClose: () => void }) {
  if (!isLoaded) return <div className="flex-1 flex items-center justify-center">Chargement...</div>
  if (items.length === 0) return <WishlistEmptyState onClose={onClose} />
  
  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {items.map((item) => (
          <WishlistItem 
            key={item.id} item={item} isInCart={cartItems.some((i) => i.id === item.id)} 
            loadingProduct={loading} onAddToCart={onAddToCart} onRemove={onRemove} 
            onClose={onClose} getProductUrl={i => `/boutique/${i.categorySlug}/${i.slug}`} 
          />
        ))}
      </div>
      <div className="border-t px-6 py-4 bg-muted/50"><Button className="w-full bg-dore text-charbon border-0" onClick={onClose}>Continuer mes achats</Button></div>
    </>
  )
}
