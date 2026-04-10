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
  const [selectedCouleur, setSelectedCouleur] = useState<string>('')
  const [selectedTaille, setSelectedTaille] = useState<string>('')
  const [quantite, setQuantite] = useState<Record<string, number>>({})

  useEffect(() => {
    const qtys: Record<string, number> = {}
    items.forEach(it => { qtys[it.id] = 1 })
    setQuantite(qtys)
  }, [items])

  const fetchProductData = async (item: CartItem) => {
    setLoadingProduct(true)
    try {
      const resp = await fetch(`/api/produits/${item.id}`)
      if (!resp.ok) throw new Error()
      const payload = await resp.json()
      const data = payload?.data as Product
      if (!data) return
      setProductData(data)
      const first = data.couleurs?.find(c => (c.stock || 0) > 0) || data.couleurs?.[0]
      if (first) setSelectedCouleur(first.nom)
      setShowModal(item.id)
    } catch { toast.error('Erreur chargement') }
    finally { setLoadingProduct(false) }
  }

  const handleAddToCart = async (item: CartItem) => {
    if (!productData || productData.id !== item.id) { await fetchProductData(item); return }
    setAddingToCart(item.id)
    try {
      await addToCart({ id: item.id, nom: item.nom, prix: item.prix, quantite: quantite[item.id] || 1, image_url: item.image_url, couleur: selectedCouleur || null, taille: selectedTaille || null, stock: productData.stock })
      toast.success('Ajouté'); setShowModal(null)
    } catch (err) { 
      toast.error(err instanceof Error ? err.message : 'Erreur') 
    }
    finally { setAddingToCart(null) }
  }

  return { items, removeItem, isLoaded, isInCart: (id: string) => cartItems.some(i => i.id === id), addingToCart, showModal, setShowModal, productData, loadingProduct, selectedCouleur, setSelectedCouleur, selectedTaille, setSelectedTaille, quantite, setQuantite, handleAddToCart, fetchProductData }
}
