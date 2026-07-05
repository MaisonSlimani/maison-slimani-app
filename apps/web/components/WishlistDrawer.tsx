'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@maison/ui'
import { Button } from '@maison/ui'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { WishlistItem } from './wishlist/WishlistItem'
import { WishlistEmptyState } from './wishlist/WishlistEmptyState'
import ProductPurchaseDialog from './product/ProductPurchaseDialog'
import { Product, CartItem, getSelectedStock } from '@maison/domain'

import { apiFetch, ENDPOINTS } from '@/lib/api/client'

export default function WishlistDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const { items, removeItem, isLoaded } = useWishlist()
  const { addItem: addToCart, items: cartItems } = useCart()
  const [showModal, setShowModal] = useState(false)
  const [productData, setProductData] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = async (item: CartItem) => {
    setLoading(true)
    try {
      const result = await apiFetch<Product>(`${ENDPOINTS.PRODUITS}/${item.id}`)
      if (result.success && result.data) {
        const prod = result.data
        setProductData(prod)
        
        // Initialize default selected color
        const firstColor = prod.colors?.find(c => (c.stock || 0) > 0) || prod.colors?.[0]
        setSelectedColor(firstColor ? firstColor.name : '')
        
        // Initialize default selected size
        let firstSize = ''
        if (firstColor && firstColor.sizes) {
          const availableSize = firstColor.sizes.find(s => (s.stock || 0) > 0) || firstColor.sizes[0]
          if (availableSize) firstSize = availableSize.name
        } else if (prod.sizes) {
          const availableSize = prod.sizes.find(s => (s.stock || 0) > 0) || prod.sizes[0]
          if (availableSize) firstSize = availableSize.name
        }
        setSelectedSize(firstSize)
        setQuantity(1)
        setShowModal(true)
      }
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  const onConfirm = async (buyNow: boolean) => {
    try {
      if (!productData) return
      const item = { 
        ...productData, 
        quantity, 
        size: selectedSize || null, 
        color: selectedColor || null, 
        image_url: productData.image_url,
        stock: getSelectedStock(productData, selectedColor, selectedSize)
      }
      await addToCart(item, !buyNow)
      setShowModal(false)
      if (buyNow) {
        router.push('/checkout')
      } else {
        toast.success('Ajouté au panier')
      }
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
      {productData && <ProductPurchaseDialog showModal={showModal} setShowModal={setShowModal} produit={productData} selectedColor={selectedColor} setSelectedColor={setSelectedColor} selectedSize={selectedSize} setSelectedSize={setSelectedSize} quantity={quantity} setQuantity={setQuantity} sizesAvailable={productData.sizes?.map(s => s.name) || []} onConfirm={onConfirm} isAddingToCart={false} />}
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
