'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import CarteProduit from '@/components/CarteProduit'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowUp, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const categoriesConfig: Record<string, { nom: string; image: string; description: string }> = {
  classiques: {
    nom: 'Classiques',
    image: '/assets/categorie-classiques.jpg',
    description: "L'essence de l'élégance quotidienne. Nos modèles classiques allient tradition et modernité pour un style intemporel.",
  },
  'cuirs-exotiques': {
    nom: 'Cuirs Exotiques',
    image: '/assets/categorie-exotiques.jpg',
    description: 'Le luxe dans sa forme la plus rare. Des cuirs précieux et exotiques pour des créations d\'exception.',
  },
  'editions-limitees': {
    nom: 'Éditions Limitées',
    image: '/assets/categorie-limitees.jpg',
    description: 'Des pièces uniques pour les connaisseurs. Chaque édition limitée raconte une histoire unique.',
  },
  nouveautes: {
    nom: 'Nouveautés',
    image: '/assets/categorie-nouveautes.jpg',
    description: 'Les dernières créations de nos ateliers. Découvrez nos nouveautés qui célèbrent l\'innovation et le savoir-faire marocain.',
  },
  tous: {
    nom: 'Tous nos produits',
    image: '/assets/hero-chaussures.jpg',
    description: 'Explorez notre collection complète de chaussures homme haut de gamme, confectionnées avec passion au Maroc.',
  },
}

export default function CategoriePage() {
  const params = useParams()
  const categorieSlug = params.categorie as string
  
  // Initialize categorieInfo immediately based on the slug to prevent flash
  const getInitialCategorieInfo = () => {
    if (categorieSlug && categoriesConfig[categorieSlug]) {
      return categoriesConfig[categorieSlug]
    }
    return {
      nom: 'Collection',
      image: '/assets/hero-chaussures.jpg',
      description: 'Découvrez notre collection exclusive.',
    }
  }
  
  const [produits, setProduits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [triPrix, setTriPrix] = useState<string>('pertinence')
  const [categorieInfo, setCategorieInfo] = useState<{ nom: string; image: string; description: string }>(getInitialCategorieInfo())

  useEffect(() => {
    window.scrollTo(0, 0)
    // Update categorieInfo immediately when slug changes
    if (categorieSlug && categoriesConfig[categorieSlug]) {
      setCategorieInfo(categoriesConfig[categorieSlug])
    }
  }, [categorieSlug])

  // Charger la catégorie depuis la base si elle existe (prioritaire sur le fallback local)
  useEffect(() => {
    const chargerCategorieDepuisDB = async () => {
      try {
        if (!categorieSlug) return
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .select('nom, description, image_url, slug, active')
          .eq('slug', categorieSlug)
          .eq('active', true)
          .single()

        if (error || !data) return

        setCategorieInfo({
          nom: data.nom || categorieInfo.nom,
          image: data.image_url || categorieInfo.image,
          description: data.description || categorieInfo.description,
        })
      } catch (e) {
        // en cas d'erreur on garde le fallback local
        console.warn('Impossible de charger la catégorie depuis la base:', e)
      }
    }

    chargerCategorieDepuisDB()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    const chargerProduits = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        
        // Mapper le slug vers le nom de catégorie
        const categorieMap: Record<string, string> = {
          'classiques': 'Classiques',
          'cuirs-exotiques': 'Cuirs Exotiques',
          'editions-limitees': 'Éditions Limitées',
          'nouveautes': 'Nouveautés',
        }

        let query = supabase.from('produits').select('*')

        // Déterminer le nom de catégorie et filtrer
        let categorieNom: string | null = null
        
        if (categorieSlug !== 'tous') {
          // Essayer d'abord le mapping direct
          if (categorieMap[categorieSlug]) {
            categorieNom = categorieMap[categorieSlug]
            query = query.eq('categorie', categorieNom)
          }
        }

        // Appliquer le tri
        if (triPrix === 'prix-asc') {
          query = query.order('prix', { ascending: true })
        } else if (triPrix === 'prix-desc') {
          query = query.order('prix', { ascending: false })
        } else {
          query = query.order('date_ajout', { ascending: false })
        }

        const { data } = await query

        setProduits(data || [])
        
        // Mettre à jour les infos de catégorie - PRIORITÉ: utiliser la catégorie réelle des produits
        if (data && data.length > 0) {
          const firstProductCategorie = data[0]?.categorie
          if (firstProductCategorie) {
            // Si on a une config pour ce slug, l'utiliser, sinon utiliser la catégorie réelle
            if (categoriesConfig[categorieSlug]) {
              setCategorieInfo(categoriesConfig[categorieSlug])
            } else {
              setCategorieInfo({
                nom: firstProductCategorie,
                image: data[0]?.image_url || '/assets/hero-chaussures.jpg',
                description: `Découvrez notre collection ${firstProductCategorie.toLowerCase()}.`,
              })
            }
          }
        } else if (categoriesConfig[categorieSlug]) {
          // Si pas de produits mais config existe, utiliser la config
          setCategorieInfo(categoriesConfig[categorieSlug])
        } else if (categorieNom) {
          // Fallback: utiliser le nom de catégorie mappé
          setCategorieInfo({
            nom: categorieNom,
            image: '/assets/hero-chaussures.jpg',
            description: `Découvrez notre collection ${categorieNom.toLowerCase()}.`,
          })
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error)
      } finally {
        setLoading(false)
      }
    }

    chargerProduits()
  }, [categorieSlug, triPrix])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <NavigationDesktop />
      <EnteteMobile />

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

      {/* Contenu avec filtres et produits */}
      <div className="container px-6 py-12 mx-auto">
        {/* Filtres avec animation */}
        <motion.div
          className="flex flex-wrap gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Select value={triPrix} onValueChange={setTriPrix}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pertinence">Pertinence</SelectItem>
              <SelectItem value="prix-asc">Prix croissant</SelectItem>
              <SelectItem value="prix-desc">Prix décroissant</SelectItem>
              <SelectItem value="nouveaute">Nouveautés</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Produits avec animations en cascade */}
        {loading ? (
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
          <div className="grid md:grid-cols-3 gap-8">
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
                className="transition-transform duration-500"
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

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}

