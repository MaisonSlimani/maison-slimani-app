'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { slugify, getProductUrlSync } from '@/lib/utils/product-urls'
import { trackSearch } from '@/lib/meta-pixel'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery('')
      setDebouncedQuery('')
    }
  }, [isOpen])

  // Fetch search results
  const {
    data: products = [],
    isPending: isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async ({ signal }) => {
      if (!debouncedQuery.trim()) return []

      const response = await fetch(
        `/api/produits?search=${encodeURIComponent(debouncedQuery)}&limit=10`,
        { signal }
      )

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      const payload = await response.json()
      return payload?.data || []
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30 * 1000,
  })

  const handleProductClick = (product: any) => {
    // Use hierarchical URL if category is available
    const productSlug = product.slug || slugify(product.nom || '')
    const categorySlug = product.categorie ? slugify(product.categorie) : null
    const productUrl = categorySlug
      ? `/pwa/boutique/${categorySlug}/${productSlug}`
      : `/pwa/produit/${product.id}` // Fallback to ID route
    router.push(productUrl)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = debouncedQuery.trim()
    if (query) {
      // Track Search event for Meta Pixel
      trackSearch(query)
      router.push(`/pwa/boutique?search=${encodeURIComponent(query)}`)
      onClose()
    }
  }

  const showResults = debouncedQuery.trim().length > 0
  const hasResults = products.length > 0
  const isSearching = isLoading || isFetching

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border"
          >
            <div className="px-4 py-3">
              {/* Search Input */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des produits..."
                    className="w-full h-12 pl-10 pr-4 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-dore focus:border-transparent"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </form>

              {/* Search Results */}
              {showResults && (
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  {isSearching && !hasResults ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Recherche en cours...</span>
                    </div>
                  ) : hasResults ? (
                    <div className="space-y-2">
                      {products.map((product: any) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={product.image_url || '/assets/placeholder.jpg'}
                              alt={product.nom}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-foreground line-clamp-2">
                              {product.nom}
                            </h3>
                            <p className="text-dore font-semibold text-sm mt-1">
                              {product.prix} MAD
                            </p>
                          </div>
                        </button>
                      ))}
                      {products.length >= 10 && (
                        <Link
                          href={`/pwa/boutique?search=${encodeURIComponent(debouncedQuery)}`}
                          onClick={onClose}
                          className="block w-full text-center py-3 text-dore font-medium hover:underline"
                        >
                          Voir tous les résultats
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Search className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-sm">Aucun résultat trouvé</p>
                      <p className="text-xs mt-1">Essayez d'autres mots-clés</p>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Searches / Suggestions (when no query) */}
              {!showResults && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {['Chaussures', 'Cuir', 'Luxe', 'Classique'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setSearchQuery(suggestion)
                          setDebouncedQuery(suggestion)
                        }}
                        className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

