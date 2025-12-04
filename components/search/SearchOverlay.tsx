'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Clock, TrendingUp, ArrowRight, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { slugify } from '@/lib/utils/product-urls'
import { useRecentSearches } from './useRecentSearches'
import ProductFilter, { FilterState } from '@/components/filters/ProductFilter'
import { trackSearch } from '@/lib/meta-pixel'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  basePath?: string // '/pwa' for PWA, '' for desktop
}

interface ProductSuggestion {
  id: string
  nom: string
  prix: number
  image_url?: string
}

interface CategorySuggestion {
  nom: string
  slug: string
  count: number
}

interface TrendingSearch {
  query: string
  count: number
}

interface Suggestions {
  products: ProductSuggestion[]
  categories: CategorySuggestion[]
  trending: TrendingSearch[]
}

export default function SearchOverlay({
  isOpen,
  onClose,
  basePath = '',
}: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [filters, setFilters] = useState<FilterState>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { recentSearches, addSearch, removeSearch, clearAll } = useRecentSearches()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 200)
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
      setSelectedIndex(-1)
      setFilters({})
    }
  }, [isOpen])

  // Fetch suggestions
  const { data: suggestions } = useQuery<Suggestions>({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams()
      if (debouncedQuery.trim()) {
        params.set('q', debouncedQuery)
      }
      params.set('type', 'all')
      params.set('limit', '5')

      const response = await fetch(`/api/search/suggestions?${params.toString()}`, {
        signal,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const payload = await response.json()
      return payload?.data || { products: [], categories: [], trending: [] }
    },
    enabled: isOpen,
    staleTime: 30 * 1000,
  })

  // Fetch live product results when typing
  const { data: searchResults = [] } = useQuery({
    queryKey: ['search-live', debouncedQuery],
    queryFn: async ({ signal }) => {
      if (!debouncedQuery.trim()) return []

      const response = await fetch(
        `/api/produits?search=${encodeURIComponent(debouncedQuery)}&limit=8&useFullText=true`,
        { signal }
      )

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const payload = await response.json()
      return payload?.data || []
    },
    enabled: isOpen && debouncedQuery.trim().length > 0,
    staleTime: 30 * 1000,
  })

  // Calculate all navigable items for keyboard navigation
  const getAllNavigableItems = useCallback(() => {
    const items: Array<{ type: 'product' | 'category' | 'trending' | 'recent' | 'viewAll'; data: any }> = []
    
    if (debouncedQuery.trim()) {
      // Show search results
      searchResults.forEach((product: any) => {
        items.push({ type: 'product', data: product })
      })
      
      // Show matching categories
      suggestions?.categories.forEach((cat) => {
        items.push({ type: 'category', data: cat })
      })
      
      // Add "View all results" option
      if (searchResults.length > 0) {
        items.push({ type: 'viewAll', data: { query: debouncedQuery } })
      }
    } else {
      // Show recent searches
      recentSearches.forEach((search) => {
        items.push({ type: 'recent', data: search })
      })
      
      // Show trending searches
      suggestions?.trending.forEach((trend) => {
        items.push({ type: 'trending', data: trend })
      })
    }
    
    return items
  }, [debouncedQuery, searchResults, suggestions, recentSearches])

  // Handle search submission
  const handleSearch = useCallback(() => {
    const trimmedQuery = debouncedQuery.trim()
    if (trimmedQuery) {
      // Track Search event for Meta Pixel
      trackSearch(trimmedQuery)
      addSearch(trimmedQuery)
      const params = new URLSearchParams()
      params.set('search', trimmedQuery)
      
      // Add filters to URL
      if (filters.minPrice !== undefined) {
        params.set('minPrice', filters.minPrice.toString())
      }
      if (filters.maxPrice !== undefined) {
        params.set('maxPrice', filters.maxPrice.toString())
      }
      if (filters.taille && filters.taille.length > 0) {
        filters.taille.forEach((t) => {
          params.append('taille', t)
        })
      }
      if (filters.inStock !== undefined) {
        params.set('inStock', filters.inStock.toString())
      }
      if (filters.couleur) {
        params.set('couleur', filters.couleur)
      }
      if (filters.categorie) {
        params.set('categorie', filters.categorie)
      }
      
      // If basePath already includes /boutique, just update query params
      if (basePath.includes('/boutique')) {
        router.push(`${basePath}?${params.toString()}`)
      } else {
        router.push(`${basePath}/boutique?${params.toString()}`)
      }
      onClose()
    }
  }, [debouncedQuery, basePath, router, onClose, addSearch, filters])

  // Handle item selection
  const handleItemSelect = useCallback(
    (item: { type: string; data: any }) => {
      switch (item.type) {
        case 'product':
          addSearch(item.data.nom)
          // Use hierarchical URL if category is available, otherwise fallback to ID route
          if (item.data.categorie && item.data.nom) {
            const productSlug = item.data.slug || slugify(item.data.nom)
            const categorySlug = slugify(item.data.categorie)
            router.push(`${basePath}/boutique/${categorySlug}/${productSlug}`)
          } else {
            router.push(`${basePath}/produit/${item.data.id}`)
          }
          onClose()
          break
        case 'category':
          // If basePath already includes /boutique, use it directly
          if (basePath.includes('/boutique')) {
            router.push(`${basePath}?categorie=${item.data.slug}`)
          } else {
            router.push(`${basePath}/boutique/${item.data.slug}`)
          }
          onClose()
          break
        case 'trending':
        case 'recent':
          const query = item.type === 'recent' ? item.data.query : item.data.query
          setSearchQuery(query)
          setDebouncedQuery(query)
          break
        case 'viewAll':
          handleSearch()
          break
      }
    },
    [basePath, router, onClose, addSearch, handleSearch]
  )

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = getAllNavigableItems()
      const maxIndex = items.length - 1

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex <= maxIndex) {
            const selectedItem = items[selectedIndex]
            handleItemSelect(selectedItem)
          } else if (debouncedQuery.trim()) {
            handleSearch()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [getAllNavigableItems, selectedIndex, debouncedQuery, handleItemSelect, handleSearch, onClose]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const showResults = debouncedQuery.trim().length > 0
  const hasResults = searchResults.length > 0
  const navigableItems = getAllNavigableItems()

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Search Header */}
            <div className="p-4 border-b border-border space-y-3">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSelectedIndex(-1)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Rechercher des produits, catégories..."
                    className="w-full h-12 pl-12 pr-12 rounded-xl bg-muted border-2 border-transparent focus:border-dore focus:outline-none text-base transition-colors"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setDebouncedQuery('')
                        inputRef.current?.focus()
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault()
                    handleSearch()
                  }}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-dore hover:bg-dore/90 transition-colors text-charbon"
                  aria-label="Rechercher"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-foreground"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
              
              {/* Filter Button */}
              <div className="flex justify-center">
                <ProductFilter
                  onFilterChange={setFilters}
                  currentFilters={filters}
                  basePath={basePath}
                />
              </div>
            </div>

            {/* Results Area */}
            <div
              ref={resultsRef}
              className="flex-1 overflow-y-auto overscroll-contain"
            >
              {showResults ? (
                <div className="p-4">
                  {/* Category Suggestions */}
                  {suggestions?.categories && suggestions.categories.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Catégories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.categories.map((cat, idx) => {
                          const itemIndex = searchResults.length + idx
                          return (
                            <Link
                              key={cat.slug}
                              href={basePath.includes('/boutique') ? `${basePath}?categorie=${cat.slug}` : `${basePath}/boutique/${cat.slug}`}
                              onClick={() => onClose()}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-dore/20 transition-colors text-sm',
                                selectedIndex === itemIndex && 'bg-dore/20 ring-2 ring-dore'
                              )}
                            >
                              {cat.nom}
                              <span className="text-muted-foreground text-xs">
                                ({cat.count})
                              </span>
                              <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Product Results */}
                  {hasResults ? (
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Produits ({searchResults.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.map((product: any, idx: number) => {
                          // Generate hierarchical URL if category is available
                          const productSlug = product.slug || slugify(product.nom || '')
                          const categorySlug = product.categorie ? slugify(product.categorie) : null
                          const productHref = categorySlug 
                            ? `${basePath}/boutique/${categorySlug}/${productSlug}`
                            : `${basePath}/produit/${product.id}` // Fallback to ID route
                          
                          return (
                          <Link
                            key={product.id}
                            href={productHref}
                            onClick={() => {
                              addSearch(searchQuery)
                              onClose()
                            }}
                            className={cn(
                              'flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors',
                              selectedIndex === idx && 'bg-muted ring-2 ring-dore'
                            )}
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
                              <h4 className="font-medium text-sm text-foreground line-clamp-2">
                                {product.nom}
                              </h4>
                              <p className="text-dore font-semibold text-sm mt-1">
                                {product.prix?.toLocaleString('fr-MA')} MAD
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </Link>
                          )
                        })}
                      </div>

                      {/* View All Results */}
                      {searchResults.length >= 5 && (
                        <button
                          onClick={handleSearch}
                          className={cn(
                            'w-full mt-4 py-3 text-center text-dore font-medium hover:underline flex items-center justify-center gap-2',
                            selectedIndex === searchResults.length + (suggestions?.categories?.length || 0) &&
                              'underline'
                          )}
                        >
                          Voir tous les résultats
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Search className="w-12 h-12 mb-4 opacity-40" />
                      <p className="text-base font-medium">Aucun résultat</p>
                      <p className="text-sm mt-1">Essayez d&apos;autres mots-clés</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          Recherches récentes
                        </h3>
                        <button
                          onClick={clearAll}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Effacer tout
                        </button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.slice(0, 5).map((search, idx) => (
                          <div
                            key={search.timestamp}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group',
                              selectedIndex === idx && 'bg-muted ring-2 ring-dore'
                            )}
                          >
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <button
                              onClick={() => {
                                setSearchQuery(search.query)
                                setDebouncedQuery(search.query)
                              }}
                              className="flex-1 text-left text-sm text-foreground"
                            >
                              {search.query}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeSearch(search.query)
                              }}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Searches */}
                  {suggestions?.trending && suggestions.trending.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Recherches populaires
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.trending.map((trend, idx) => {
                          const itemIndex = recentSearches.length + idx
                          return (
                            <button
                              key={trend.query}
                              onClick={() => {
                                setSearchQuery(trend.query)
                                setDebouncedQuery(trend.query)
                              }}
                              className={cn(
                                'px-4 py-2 rounded-full bg-muted hover:bg-dore/20 text-sm transition-colors',
                                selectedIndex === itemIndex && 'bg-dore/20 ring-2 ring-dore'
                              )}
                            >
                              {trend.query}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Default Suggestions when no trending */}
                  {(!suggestions?.trending || suggestions.trending.length === 0) && recentSearches.length === 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Suggestions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {['Chaussures', 'Cuir', 'Classique', 'Luxe', 'Mocassins'].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setSearchQuery(suggestion)
                              setDebouncedQuery(suggestion)
                            }}
                            className="px-4 py-2 rounded-full bg-muted hover:bg-dore/20 text-sm transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Keyboard Hint (Desktop only) */}
            <div className="hidden md:flex items-center justify-center gap-6 px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">↓</kbd>
                Naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">Entrée</kbd>
                Sélectionner
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">Échap</kbd>
                Fermer
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

