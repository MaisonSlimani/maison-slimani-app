'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import CarteProduit from '@/components/CarteProduit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowUp, ArrowLeft, Search, ShoppingCart, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'
import { useCart } from '@/lib/hooks/useCart'
import ProductFilter, { FilterState } from '@/components/filters/ProductFilter'
import { useIsPWA } from '@/lib/hooks/useIsPWA'
import PWACategorieContent from './PWACategorieContent'
import { trackViewCategory } from '@/lib/analytics'
import { tracker } from '@/lib/mixpanel-tracker'

export default function CategoriePage() {
  const { isPWA, isLoading } = useIsPWA()
  const params = useParams()
  const searchParams = useSearchParams()
  const categorieSlug = params.categorie as string

  const [loadingCategory, setLoadingCategory] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [triPrix, setTriPrix] = useState<string>('')
  const [categorieInfo, setCategorieInfo] = useState<{ nom: string; image: string; description: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState<FilterState>({})
  const categorieNom = categorieInfo?.nom || null
  const { openDrawer } = useCartDrawer()
  const { totalItems } = useCart()

  // Track Page View
  useEffect(() => {
    if (!categorieInfo) return
    if (categorieSlug === 'tous') {
      tracker.track('Page Viewed', { page_name: 'All Products' })
    } else {
      tracker.track('Category Viewed', {
        category_name: categorieInfo.nom,
        category_slug: categorieSlug
      })
    }
  }, [categorieInfo, categorieSlug])

  // Update search query when URL param changes
  useEffect(() => {
    const query = searchParams.get('search')
    if (query && query !== searchQuery) {
      setSearchQuery(query)
    }
  }, [searchParams, searchQuery])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Charger la catégorie depuis la base de données - DOIT être chargé AVANT le rendu
  useEffect(() => {
    const controller = new AbortController()

    const chargerCategorieDepuisDB = async () => {
      try {
        setLoadingCategory(true)
        if (!categorieSlug || categorieSlug === 'tous') {
          setCategorieInfo({
            nom: 'Tous nos produits',
            image: '/assets/hero-chaussures.jpg',
            description:
              'Explorez notre collection complète de chaussures homme haut de gamme, confectionnées avec passion au Maroc.',
          })
          setLoadingCategory(false)
          return
        }

        const response = await fetch(
          `/api/categories?slug=${encodeURIComponent(categorieSlug)}&active=true`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error(`Erreur API catégories: ${response.status}`)
        }

        const payload = await response.json()
        const data = payload?.data?.[0]

        if (!data) {
          const defaultInfo = {
            nom: 'Collection',
            image: '/assets/hero-chaussures.jpg',
            description: 'Découvrez notre collection exclusive.',
          }
          setCategorieInfo(defaultInfo)
          trackViewCategory(defaultInfo.nom)
          setLoadingCategory(false)
          return
        }

        const categoryInfo = {
          nom: data.nom,
          image: (!data.image_url || data.image_url.trim() === '')
            ? '/assets/hero-chaussures.jpg'
            : data.image_url,
          description: data.description || '',
        }
        if (!data.image_url || data.image_url.trim() === '') {
          console.warn(`Catégorie "${data.nom}" n'a pas d'image_url définie`)
        }
        setCategorieInfo(categoryInfo)
        trackViewCategory(categoryInfo.nom)
      } catch (e) {
        if ((e as Error).name === 'AbortError') {
          return
        }
        console.error('Erreur lors du chargement de la catégorie:', e)
        setCategorieInfo({
          nom: 'Collection',
          image: '/assets/hero-chaussures.jpg',
          description: 'Découvrez notre collection exclusive.',
        })
      } finally {
        setLoadingCategory(false)
      }
    }

    chargerCategorieDepuisDB()

    return () => controller.abort()
  }, [categorieSlug])

  // SEO Meta Tags - Dynamic per category
  useEffect(() => {
    if (!categorieInfo) return

    // Update title dynamically based on category
    document.title = `${categorieInfo.nom} - Chaussures Homme Luxe | Maison Slimani`

    // Update meta description dynamically
    const metaDescription = document.querySelector('meta[name="description"]')
    const description = `${categorieInfo.description} Découvrez notre collection ${categorieInfo.nom} de chaussures homme haut de gamme. Livraison gratuite au Maroc.`
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = description
      document.head.appendChild(meta)
    }

    // Update Open Graph tags dynamically
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', `${categorieInfo.nom} - Chaussures Homme Luxe | Maison Slimani`)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:title')
      meta.content = `${categorieInfo.nom} - Chaussures Homme Luxe | Maison Slimani`
      document.head.appendChild(meta)
    }

    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', description)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:description')
      meta.content = description
      document.head.appendChild(meta)
    }

    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage && categorieInfo.image) {
      ogImage.setAttribute('content', `${window.location.origin}${categorieInfo.image}`)
    } else if (categorieInfo.image) {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:image')
      meta.content = `${window.location.origin}${categorieInfo.image}`
      document.head.appendChild(meta)
    }

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
      ogUrl.setAttribute('content', window.location.href)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:url')
      meta.content = window.location.href
      document.head.appendChild(meta)
    }

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      canonical.setAttribute('href', window.location.href)
    } else {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      canonical.setAttribute('href', window.location.href)
      document.head.appendChild(canonical)
    }

    // Add structured data (CollectionPage, BreadcrumbList) - Dynamic per category
    const existingScript = document.getElementById('category-structured-data')
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.id = 'category-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: categorieInfo.nom,
      description: categorieInfo.description,
      url: window.location.href,
      image: categorieInfo.image ? `${window.location.origin}${categorieInfo.image}` : undefined,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: window.location.origin
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Boutique',
            item: `${window.location.origin}/boutique`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: categorieInfo.nom,
            item: window.location.href
          }
        ]
      }
    })
    document.head.appendChild(script)
  }, [categorieInfo])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const {
    data: produits = [],
    isPending: produitsPending,
    isFetching: produitsFetching,
    error: produitsError,
  } = useQuery({
    queryKey: ['categorie-produits', categorieSlug, categorieNom, triPrix, searchQuery, filters],
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: categorieSlug === 'tous' || !!categorieNom,
    queryFn: async ({ signal }) => {
      const searchParams = new URLSearchParams()

      if (categorieSlug !== 'tous' && categorieNom) {
        searchParams.set('categorie', categorieNom)
      }

      if (triPrix === 'prix-asc') {
        searchParams.set('sort', 'prix_asc')
      } else if (triPrix === 'prix-desc') {
        searchParams.set('sort', 'prix_desc')
      }

      // Add search query
      if (searchQuery.trim()) {
        searchParams.set('search', searchQuery.trim())
      }

      // Add filters
      if (filters.minPrice !== undefined) {
        searchParams.set('minPrice', filters.minPrice.toString())
      }
      if (filters.maxPrice !== undefined) {
        searchParams.set('maxPrice', filters.maxPrice.toString())
      }
      if (filters.taille && filters.taille.length > 0) {
        // Pass multiple tailles as comma-separated or multiple params
        filters.taille.forEach((t) => {
          searchParams.append('taille', t)
        })
      }
      if (filters.inStock !== undefined) {
        searchParams.set('inStock', filters.inStock.toString())
      }
      if (filters.couleur && filters.couleur.length > 0) {
        filters.couleur.forEach((c) => {
          searchParams.append('couleur', c)
        })
      }
      if (filters.categorie && filters.categorie.length > 0) {
        filters.categorie.forEach((cat) => {
          searchParams.append('categorie', cat)
        })
      }

      searchParams.set('limit', '60')

      const response = await fetch(`/api/produits?${searchParams.toString()}`, {
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
    if (produitsError) {
      console.error('Erreur lors du chargement des produits:', produitsError)
    } else if (produits) {
      // Track Product List Viewed
      tracker.trackProductListViewed('Category List', produits, categorieNom || 'All')

      // Track Search if valid query exists
      if (searchQuery && searchQuery.trim().length > 2) {
        // Create a stable key for the search to avoid duplicates
        const searchKey = `${searchQuery}-${produits.length}`
        // Use session storage to check if we recently tracked this exact search result
        const lastTracked = sessionStorage.getItem('last_tracked_search')

        if (lastTracked !== searchKey) {
          tracker.trackSearch(searchQuery, produits.length)
          sessionStorage.setItem('last_tracked_search', searchKey)
        }
      }
    }
  }, [produits, produitsError, categorieNom, searchQuery])

  const produitsLoading =
    produitsPending ||
    produitsFetching ||
    (categorieSlug !== 'tous' && !categorieNom)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Show loading state while detecting device
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dore mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Render PWA version
  if (isPWA) {
    return <PWACategorieContent />
  }

  // Ne pas rendre le contenu principal tant que la catégorie n'est pas chargée
  if (loadingCategory || !categorieInfo) {
    return (
      <div className="pb-24 md:pb-0 pt-0 md:pt-20">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dore mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state while detecting device
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dore mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Render PWA version
  if (isPWA) {
    return <PWACategorieContent />
  }

  // Render desktop version
  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">

      {/* Header de présentation avec overlay et animations */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <Image
            src={categorieInfo.image}
            alt={categorieInfo.nom}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized={categorieInfo.image.startsWith('http')} // Si c'est une URL externe (Supabase)
          />
        </motion.div>
        {/* Overlay dégradé sombre pour meilleure lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <motion.div
          className="relative z-10 container text-center px-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-7xl font-serif text-[#f8f5f0] mb-6 text-balance leading-tight drop-shadow-2xl">
              {categorieInfo.nom}
            </h1>
            <p className="text-lg md:text-xl text-[#f8f5f0]/95 max-w-3xl mx-auto leading-relaxed drop-shadow-lg mb-8">
              {categorieInfo.description}
            </p>
          </motion.div>
        </motion.div>

        {/* Bouton retour en haut à gauche */}
        <motion.div
          className="absolute top-6 left-6 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-[#f8f5f0] hover:text-dore hover:bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <Link href="/boutique">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la boutique
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Contenu avec recherche et produits */}
      <div className="container px-4 md:px-6 py-8 md:py-12 mx-auto">
        {/* Barre de recherche avec icône panier, filtre et tri */}
        <motion.div
          className="space-y-4 mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 pointer-events-none" />
              <Input
                type="search"
                placeholder={`Rechercher dans ${categorieInfo?.nom || 'cette catégorie'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted border-0"
              />
            </div>

            {/* Bouton panier */}
            <button
              onClick={() => openDrawer()}
              className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-muted hover:bg-muted/80 transition-colors border border-transparent hover:border-dore/30 flex-shrink-0"
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
          <div className="flex items-center justify-start gap-3 flex-wrap">
            <Select value={triPrix} onValueChange={setTriPrix}>
              <SelectTrigger className="h-11 w-[180px]">
                <SelectValue placeholder="Trier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prix-asc">Prix croissant</SelectItem>
                <SelectItem value="prix-desc">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
            <ProductFilter
              onFilterChange={setFilters}
              currentFilters={filters}
              categoryName={categorieSlug === 'tous' ? undefined : categorieNom || undefined}
            />
          </div>

          {/* Active Filters Chips */}
          {((filters.categorie && filters.categorie.length > 0) ||
            (filters.couleur && filters.couleur.length > 0) ||
            (filters.taille && filters.taille.length > 0) ||
            filters.minPrice || filters.maxPrice || filters.inStock !== undefined) && (
              <div className="flex flex-wrap gap-2 items-center pt-2">
                {filters.categorie && filters.categorie.length > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-dore/20 border border-dore/50 rounded-full text-xs font-medium">
                    <span>Catégorie: {filters.categorie.join(', ')}</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, categorie: undefined })}
                      className="ml-1 hover:text-destructive transition-colors"
                      aria-label="Retirer le filtre catégorie"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {filters.couleur && filters.couleur.length > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-dore/20 border border-dore/50 rounded-full text-xs font-medium">
                    <span>Couleur: {filters.couleur.join(', ')}</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, couleur: undefined })}
                      className="ml-1 hover:text-destructive transition-colors"
                      aria-label="Retirer le filtre couleur"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {filters.taille && filters.taille.length > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-dore/20 border border-dore/50 rounded-full text-xs font-medium">
                    <span>Taille: {filters.taille.join(', ')}</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, taille: undefined })}
                      className="ml-1 hover:text-destructive transition-colors"
                      aria-label="Retirer le filtre taille"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {filters.minPrice && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-dore/20 border border-dore/50 rounded-full text-xs font-medium">
                    <span>Prix min: {filters.minPrice} DH</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, minPrice: undefined })}
                      className="ml-1 hover:text-destructive transition-colors"
                      aria-label="Retirer le filtre prix min"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {filters.maxPrice && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-dore/20 border border-dore/50 rounded-full text-xs font-medium">
                    <span>Prix max: {filters.maxPrice} DH</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, maxPrice: undefined })}
                      className="ml-1 hover:text-destructive transition-colors"
                      aria-label="Retirer le filtre prix max"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {filters.inStock !== undefined && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-dore/20 border border-dore/50 rounded-full text-xs font-medium">
                    <span>{filters.inStock ? 'En stock' : 'Rupture'}</span>
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, inStock: undefined })}
                      className="ml-1 hover:text-destructive transition-colors"
                      aria-label="Retirer le filtre stock"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
        </motion.div>

        {/* Produits avec animations en cascade */}
        {produitsLoading ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-dore border-t-transparent rounded-full mx-auto"
            />
          </div>
        ) : produits.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-muted-foreground text-lg">Aucun produit trouvé dans cette catégorie</p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/boutique">Retour à la boutique</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
            {produits.map((produit, index) => (
              <motion.div
                key={produit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -8 }}
                className="transition-transform duration-500 h-full"
              >
                <CarteProduit produit={produit} showActions={true} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bouton retour en haut */}
      {showScrollTop && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-24 right-6 z-50 rounded-full shadow-xl bg-dore text-charbon hover:bg-dore/90 transition-all duration-300 hover:scale-110"
            aria-label="Retour en haut"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </motion.div>
      )}

    </div>
  )
}

