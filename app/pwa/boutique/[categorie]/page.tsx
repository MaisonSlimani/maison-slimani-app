'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import ProductCard from '@/components/pwa/ProductCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowUp, Search, ShoppingCart } from 'lucide-react'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'
import { useCart } from '@/lib/hooks/useCart'
import ProductFilter, { FilterState } from '@/components/filters/ProductFilter'

export default function PWACategoriePage() {
  const params = useParams()
  const categorieSlug = params.categorie as string
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [triPrix, setTriPrix] = useState<string>('pertinence')
  const [categorieInfo, setCategorieInfo] = useState<{ nom: string; image: string } | null>(null)
  const [categorieNom, setCategorieNom] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({})
  const { openDrawer } = useCartDrawer()
  const { totalItems } = useCart()

  useEffect(() => {
    window.scrollTo(0, 0)
    
    const chargerCategorie = async () => {
      try {
        if (!categorieSlug || categorieSlug === 'tous') {
          setCategorieInfo({
            nom: 'Tous nos produits',
            image: '/assets/hero-chaussures.jpg',
          })
          setCategorieNom(null)
          return
        }

        const response = await fetch(`/api/categories?slug=${encodeURIComponent(categorieSlug)}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Erreur API catégories: ${response.status}`)
        }
        const payload = await response.json()
        
        if (!payload.success) {
          throw new Error(payload.error || 'Catégorie introuvable')
        }
        
        const data = payload?.data?.[0]
        if (data) {
          setCategorieInfo({
            nom: data.nom,
            image: data.image_url || '/assets/hero-chaussures.jpg',
          })
          setCategorieNom(data.nom) // Store category name for products query
        } else {
          // Category not found, set default
          setCategorieInfo({
            nom: 'Collection',
            image: '/assets/hero-chaussures.jpg',
          })
          setCategorieNom(null)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la catégorie:', error)
        // Set default category info on error
        setCategorieInfo({
          nom: 'Collection',
          image: '/assets/hero-chaussures.jpg',
        })
        setCategorieNom(null)
      }
    }

    chargerCategorie()
  }, [categorieSlug])

  const {
    data: produits = [],
    isPending: loading,
  } = useQuery({
    queryKey: ['produits', 'pwa', 'categorie', categorieNom, triPrix, searchQuery, filters],
    staleTime: 2 * 60 * 1000,
    enabled: categorieSlug === 'tous' || categorieNom !== null || categorieInfo !== null, // Wait for category to load
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams()
      // Use category name, not slug
      if (categorieNom && categorieSlug !== 'tous') {
        params.set('categorie', categorieNom)
      }
      if (triPrix !== 'pertinence') {
        params.set('sort', triPrix)
      }
      // Add search query
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim())
      }
      // Add filters
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

      const response = await fetch(`/api/produits?${params.toString()}`, {
        signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erreur API produits: ${response.status}`)
      }

      const payload = await response.json()
      if (!payload.success) {
        throw new Error(payload.error || 'Erreur lors du chargement des produits')
      }
      
      return payload?.data || []
    },
  })

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

  return (
    <div className="w-full min-h-screen pb-20">
      {/* Category Header */}
      {categorieInfo && (
        <div className="relative h-48 mb-4">
          <div className="absolute inset-0">
            <img
              src={categorieInfo.image}
              alt={categorieInfo.nom}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
          </div>
          <div className="relative z-10 h-full flex items-end p-4">
            <h1 className="text-3xl font-serif text-white">{categorieInfo.nom}</h1>
          </div>
        </div>
      )}

      {/* Search Bar with Cart Icon, Filter and Sort */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <Input
              type="search"
              placeholder={`Rechercher dans ${categorieInfo?.nom || 'cette catégorie'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-muted border-0"
            />
          </div>
          
          {/* Cart Button */}
          <button
            onClick={() => openDrawer()}
            className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 transition-colors border border-transparent hover:border-dore/30 flex-shrink-0"
            aria-label="Panier"
          >
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-dore rounded-full shadow-lg">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
        
        {/* Filter and Sort Buttons */}
        <div className="flex items-center justify-start gap-2">
          <Select value={triPrix} onValueChange={setTriPrix}>
            <SelectTrigger className="h-9 text-sm w-[140px]">
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pertinence">Pertinence</SelectItem>
              <SelectItem value="prix-asc">Prix croissant</SelectItem>
              <SelectItem value="prix-desc">Prix décroissant</SelectItem>
              <SelectItem value="nouveaute">Nouveautés</SelectItem>
            </SelectContent>
          </Select>
          <ProductFilter
            onFilterChange={setFilters}
            currentFilters={filters}
            categoryName={categorieNom || undefined}
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="px-4 py-8 text-center text-muted-foreground">
          Chargement...
        </div>
      ) : produits.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg mb-4">
            {categorieInfo 
              ? `Aucun produit disponible dans la catégorie "${categorieInfo.nom}"`
              : 'Aucun produit disponible pour le moment'}
          </p>
          <Button 
            asChild 
            variant="outline"
            className="mt-4"
          >
            <Link href="/pwa/boutique">Retour à la boutique</Link>
          </Button>
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
                <ProductCard produit={produit} />
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

