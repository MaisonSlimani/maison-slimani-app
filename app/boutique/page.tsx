'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import CarteCategorie from '@/components/CarteCategorie'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function BoutiquePage() {
  const [categories, setCategories] = useState<Array<{
    titre: string
    tagline: string
    image: string
    lien: string
  }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const chargerCategories = async () => {
      try {
        const supabase = createClient()
        
        // Charger les catégories actives depuis la base de données
        const { data: categoriesData, error } = await supabase
          .from('categories')
          .select('nom, description, image_url, slug, ordre')
          .eq('active', true)
          .order('ordre', { ascending: true })

        if (error) throw error

        // Mapper les données de la base vers le format attendu par CarteCategorie
        // Filtrer les catégories sans image_url pour éviter les fallbacks
        const categoriesMapped = (categoriesData || [])
          .filter((cat) => cat.image_url && cat.image_url.trim() !== '') // Seulement les catégories avec image
          .map((cat) => ({
            titre: cat.nom,
            tagline: cat.description || '',
            image: cat.image_url, // Pas de fallback - on filtre déjà les vides
            lien: `/boutique/${cat.slug}`,
          }))

        setCategories(categoriesMapped)
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error)
        // En cas d'erreur, laisser categories vide - la section ne s'affichera pas
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    chargerCategories()
  }, [])

  // SEO Meta Tags - Dynamic (mis à jour quand les catégories sont chargées)
  useEffect(() => {
    if (loadingCategories) return // Attendre que les catégories soient chargées
    
    // Update title
    document.title = 'Boutique - Nos Collections | Maison Slimani'
    
    // Update meta description - dynamique basé sur les catégories chargées
    const metaDescription = document.querySelector('meta[name="description"]')
    const categoryNames = categories.length > 0 
      ? categories.map(c => c.titre).join(', ')
      : 'nos collections exclusives'
    const description = `Découvrez ${categoryNames} de chaussures homme haut de gamme. Livraison gratuite au Maroc.`
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = description
      document.head.appendChild(meta)
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Boutique - Nos Collections | Maison Slimani')
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:title')
      meta.content = 'Boutique - Nos Collections | Maison Slimani'
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

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
      ogUrl.setAttribute('content', window.location.href)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:url')
      meta.content = window.location.href
      document.head.appendChild(meta)
    }

    // Add structured data (CollectionPage, BreadcrumbList)
    const existingScript = document.getElementById('boutique-structured-data')
    if (existingScript) {
      existingScript.remove()
    }
    
    const script = document.createElement('script')
    script.id = 'boutique-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Boutique - Nos Collections',
      description: description,
      url: window.location.href,
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
            item: window.location.href
          }
        ]
      }
    })
    document.head.appendChild(script)
  }, [categories, loadingCategories])

  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <NavigationDesktop />
      <EnteteMobile />

      {/* Section Catégories avec animations luxueuses */}
      {!loadingCategories && categories.length > 0 && (
        <section className="py-20 px-6 bg-ecru">
          <div className="container max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl md:text-6xl font-serif mb-6 text-charbon">
                Nos Collections
              </h1>
              <p className="text-lg md:text-xl text-charbon/70 max-w-2xl mx-auto leading-relaxed">
                Découvrez nos collections exclusives, chacune incarnant l'excellence marocaine
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {categories.map((categorie, index) => (
                <motion.div
                  key={categorie.titre}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -8 }}
                  className="transition-transform duration-500"
                >
                  <CarteCategorie {...categorie} priority={index < 2} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loading state */}
      {loadingCategories && (
        <section className="py-20 px-6 bg-ecru">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dore mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des collections...</p>
            </div>
          </div>
        </section>
      )}

      {/* Section "Voir tous nos produits" */}
      <section className="py-20 px-6">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-3xl md:text-5xl font-serif mb-4">
              Voir tous nos produits
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
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
                className="bg-dore text-charbon hover:bg-dore/90 font-medium px-10 py-6 transition-all duration-300 hover:scale-105"
              >
                <Link href="/boutique/tous">Découvrir toute la collection</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}
