'use client'

import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { Product, CartItem } from '@maison/domain'

export function useFavorisData() {
  const { items, removeItem, isLoaded } = useWishlist()
  const { addItem: addToCart, items: cartItems } = useCart()
  const [productData, setProductData] = useState<Product | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState<Record<string, number>>({})

  useEffect(() => {
    const qtys: Record<string, number> = {}
    items.forEach(it => { qtys[it.id] = 1 })
    setQuantity(qtys)
  }, [items])

  const fetchProductData = async (item: CartItem) => {
    setLoadingProduct(true)
    try {
      const resp = await fetch(`/api/v1/produits/${item.id}`)
      if (!resp.ok) throw new Error()
      const payload = await resp.json()
      const data = payload?.data as Product
      if (!data) return
      setProductData(data)
      const first = data.colors?.find(c => (c.stock || 0) > 0) || data.colors?.[0]
      if (first) setSelectedColor(first.name)
      setShowModal(item.id)
    } catch { toast.error('Erreur chargement') }
    finally { setLoadingProduct(false) }
  }

  const handleAddToCart = async (item: CartItem) => {
    if (!productData || productData.id !== item.id) { await fetchProductData(item); return }
    setAddingToCart(item.id)
    try {
      await addToCart({ 
        ...item,
        quantity: quantity[item.id] || 1, 
        color: selectedColor || null, 
        size: selectedSize || null, 
        stock: productData.stock 
      })
      toast.success('Ajouté'); setShowModal(null)
    } catch (err) { 
      toast.error(err instanceof Error ? err.message : 'Erreur') 
    }
    finally { setAddingToCart(null) }
  }

  return { items, removeItem, isLoaded, isInCart: (id: string) => cartItems.some(i => i.id === id), addingToCart, showModal, setShowModal, productData, loadingProduct, selectedColor, setSelectedColor, selectedSize, setSelectedSize, quantity, setQuantity, handleAddToCart, fetchProductData }
}
