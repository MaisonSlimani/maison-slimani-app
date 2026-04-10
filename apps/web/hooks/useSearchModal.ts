'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { slugify } from '@/lib/utils/product-urls'
import { trackSearch } from '@/lib/analytics'

export interface SearchProduct {
  id: string
  nom: string
  prix: number
  image_url: string
  slug?: string
  categorie?: string
}

export function useSearchModal(isOpen: boolean, onClose: () => void) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 100) }
    else { setSearchQuery(''); setDebouncedQuery('') }
  }, [isOpen])

  const { data: products = [] as SearchProduct[], isPending: isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async ({ signal }) => {
      if (!debouncedQuery.trim()) return []
      const res = await fetch(`/api/produits?search=${encodeURIComponent(debouncedQuery)}&limit=10`, { signal })
      if (!res.ok) throw new Error(`Erreur API: ${res.status}`)
      return (await res.json())?.data || []
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30 * 1000,
  })

  const handleProductClick = (product: SearchProduct) => {
    const productSlug = product.slug || slugify(product.nom || '')
    const catSlug = product.categorie ? slugify(product.categorie) : null
    router.push(catSlug ? `/pwa/boutique/${catSlug}/${productSlug}` : `/pwa/produit/${product.id}`)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = debouncedQuery.trim()
    if (q) { trackSearch(q); router.push(`/pwa/boutique?search=${encodeURIComponent(q)}`); onClose() }
  }

  return { searchQuery, setSearchQuery, debouncedQuery, setDebouncedQuery, inputRef, products, isSearching: isLoading || isFetching, hasResults: products.length > 0, handleProductClick, handleSubmit }
}
