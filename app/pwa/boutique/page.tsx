'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import ProductCard from '@/components/pwa/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowUp, Search, X, SlidersHorizontal } from 'lucide-react'

export default function PWABoutiquePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categorie = searchParams.get('categorie') || 'tous'
  const search = searchParams.get('search') || ''
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [triPrix, setTriPrix] = useState<string>('pertinence')
  const [searchQuery, setSearchQuery] = useState(search)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Sync searchQuery with URL params
  useEffect(() => {
    setSearchQuery(search)
  }, [search])

  const {
    data: produits = [],
    isPending: loading,
    refetch,
  } = useQuery({
    queryKey: ['produits', 'pwa', categorie, search, triPrix],
    staleTime: 2 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams()
      if (categorie && categorie !== 'tous') {
        params.set('categorie', categorie)
      }
      if (search) {
        params.set('search', search)
      }
      if (triPrix !== 'pertinence') {
        params.set('sort', triPrix)
      }

      const response = await fetch(`/api/produits?${params.toString()}`, {
        signal,
      })

      if (!response.ok) {
        throw new Error(`Erreur API produits: ${response.status}`)
      }

      const payload = await response.json()
      return payload?.data || []
    },
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [categorie])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery) {
      router.push(`/pwa/boutique?search=${encodeURIComponent(trimmedQuery)}`)
    } else {
      router.push('/pwa/boutique')
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    router.push('/pwa/boutique')
  }

  return (
    <div className="w-full min-h-screen pb-20">
      {/* Search and Filter Header - Side by Side */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border safe-area-top">
        <div className="h-14 px-4 flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 bg-muted border-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
          
          {/* Filter Button with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 bg-muted hover:bg-muted/80 rounded-lg flex-shrink-0"
                aria-label="Filtrer"
              >
                <SlidersHorizontal className="w-5 h-5 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => setTriPrix('pertinence')}
                className={triPrix === 'pertinence' ? 'bg-accent' : ''}
              >
                Pertinence
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTriPrix('prix-asc')}
                className={triPrix === 'prix-asc' ? 'bg-accent' : ''}
              >
                Prix ↑
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTriPrix('prix-desc')}
                className={triPrix === 'prix-desc' ? 'bg-accent' : ''}
              >
                Prix ↓
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTriPrix('nouveaute')}
                className={triPrix === 'nouveaute' ? 'bg-accent' : ''}
              >
                Nouveautés
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Title Bar */}
        {search && (
          <div className="px-4 pb-2">
            <h1 className="text-sm font-serif text-muted-foreground">
              Résultats pour "{search}"
            </h1>
          </div>
        )}
      </header>

      {/* Products Grid */}
      {loading ? (
        <div className="px-4 py-8 text-center text-muted-foreground">
          Chargement...
        </div>
      ) : produits.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {produits.map((produit: any, index: number) => (
              <motion.div
                key={produit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard produit={produit} priority={index === 0} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Scroll to Top */}
      {showScrollTop && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-24 right-4 z-50"
        >
          <Button
            size="icon"
            className="rounded-full bg-dore text-charbon hover:bg-dore/90 shadow-lg"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
