'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import ProductCard from '@/components/pwa/ProductCard'
import CarteCategorie from '@/components/CarteCategorie'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowUp, Search, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import SearchOverlay from '@/components/search/SearchOverlay'

export default function PWABoutiquePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categorie = searchParams.get('categorie') || 'tous'
  const search = searchParams.get('search') || ''
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [triPrix, setTriPrix] = useState<string>('pertinence')
  const [searchQuery, setSearchQuery] = useState(search)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false)
  const [categories, setCategories] = useState<Array<{
    nom: string
    slug: string
  }>>([])
  const [categoriesWithImages, setCategoriesWithImages] = useState<Array<{
    titre: string
    tagline: string
    image: string
    lien: string
  }>>([])
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null)
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Sync searchQuery with URL params
  useEffect(() => {
    setSearchQuery(search)
  }, [search])

  // Show categories view when no category/search is selected
  const showCategoriesView = categorie === 'tous' && !search

  const {
    data: produits = [],
    isPending: loading,
    refetch,
  } = useQuery({
    queryKey: ['produits', 'pwa', categorie, search, triPrix, selectedCategoryName],
    staleTime: 2 * 60 * 1000,
    enabled: !showCategoriesView, // Only fetch products if category/search is active
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams()
      if (selectedCategoryName) {
        params.set('categorie', selectedCategoryName)
      }
      if (search) {
        params.set('search', search)
        params.set('useFullText', 'true')
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

  // Load categories and set selected category name
  useEffect(() => {
    const chargerCategories = async () => {
      try {
        const response = await fetch('/api/categories?active=true')
        if (!response.ok) throw new Error(`Erreur API catégories: ${response.status}`)
        const payload = await response.json()
        const categoriesData = payload?.data || []
        
        // Set categories for pills
        setCategories(categoriesData.map((cat: any) => ({
          nom: cat.nom,
          slug: cat.slug,
        })))
        
        // Set categories with images for cards (like desktop)
        const categoriesMapped = categoriesData
          .filter((cat: any) => cat.image_url && cat.image_url.trim() !== '')
          .map((cat: any) => ({
            titre: cat.nom,
            tagline: cat.description || '',
            image: cat.image_url,
            lien: `/boutique/${cat.slug}`,
          }))
        setCategoriesWithImages(categoriesMapped)
        
        // Find category name from slug
        if (categorie && categorie !== 'tous') {
          const foundCat = categoriesData.find((cat: any) => cat.slug === categorie)
          setSelectedCategoryName(foundCat?.nom || null)
        } else {
          setSelectedCategoryName(null)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error)
        setCategories([])
        setCategoriesWithImages([])
      } finally {
        setLoadingCategories(false)
      }
    }
    chargerCategories()
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
      router.push(`/boutique?search=${encodeURIComponent(trimmedQuery)}`)
    } else {
      router.push('/boutique')
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    router.push('/boutique')
  }

  return (
    <div className="w-full min-h-screen pb-20">
      {/* Search and Filter Header - Always visible */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border safe-area-top">
        <div className="h-14 px-4 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOverlayOpen(true)}
              className="pl-10 h-10 bg-muted border-0"
            />
          </div>
          
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
        
        {/* Categories Row - Only show when viewing products (not on categories view) */}
        {!showCategoriesView && !loadingCategories && categories.length > 0 && (
          <div className="px-4 py-2 border-b border-border/50">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
              <button
                onClick={() => {
                  router.push('/boutique?categorie=tous')
                }}
                className={cn(
                  "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                  categorie === 'tous' || !categorie
                    ? "bg-dore text-charbon"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    router.push(`/boutique?categorie=${cat.slug}`)
                  }}
                  className={cn(
                    "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                    categorie === cat.slug
                      ? "bg-dore text-charbon"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat.nom}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Title Bar */}
        {search && (
          <div className="px-4 pb-2">
            <h1 className="text-sm font-serif text-muted-foreground">
              Résultats pour "{search}"
            </h1>
          </div>
        )}
      </header>

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={isSearchOverlayOpen} 
        onClose={() => setIsSearchOverlayOpen(false)}
        basePath="/boutique"
      />

      {/* Categories View - Show first when no category/search selected */}
      {showCategoriesView && (
        <>
          {!loadingCategories && (
            <section className="py-12 px-4 bg-ecru">
              <div className="max-w-6xl mx-auto">
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h1 className="text-3xl md:text-4xl font-serif mb-4 text-charbon">
                    Nos Collections
                  </h1>
                  <p className="text-base md:text-lg text-charbon/70 max-w-2xl mx-auto leading-relaxed">
                    Découvrez nos collections exclusives, chacune incarnant l'excellence marocaine
                  </p>
                </motion.div>

                {categoriesWithImages.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 mb-8">
                    {categoriesWithImages.map((categorie, index) => (
                      <motion.div
                        key={categorie.titre}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.8,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <CarteCategorie {...categorie} priority={index < 2} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-charbon/70 text-lg mb-6">Aucune catégorie disponible pour le moment</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Loading state for categories */}
          {loadingCategories && (
            <section className="py-12 px-4 bg-ecru">
              <div className="max-w-6xl mx-auto">
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dore mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement des collections...</p>
                </div>
              </div>
            </section>
          )}

          {/* "Voir tous les produits" Section */}
          <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-2xl md:text-3xl font-serif mb-4">
                  Voir tous nos produits
                </h2>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
                  Explorez notre collection complète de chaussures homme haut de gamme
                </p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-dore text-charbon hover:bg-dore/90 font-medium px-8 py-6 transition-all duration-300 hover:scale-105"
                  >
                    <Link href="/boutique/tous">Découvrir toute la collection</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* Products Grid - Show when category/search is active */}
      {!showCategoriesView && (
        <>
          {loading ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : produits.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                {search 
                  ? `Aucun produit trouvé pour "${search}"`
                  : selectedCategoryName
                  ? `Aucun produit dans la catégorie "${selectedCategoryName}"`
                  : 'Aucun produit disponible pour le moment'}
              </p>
              {search && (
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="mt-4"
                >
                  Effacer la recherche
                </Button>
              )}
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
        </>
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
