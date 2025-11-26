'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { Truck, RefreshCcw, Award } from 'lucide-react'
import ProductCard from '@/components/pwa/ProductCard'
import StickyHeader from '@/components/pwa/StickyHeader'

const heroImage = '/assets/hero-chaussures.jpg'

export default function PWAPage() {
  const [categories, setCategories] = useState<Array<{
    titre: string
    tagline: string
    image: string
    lien: string
  }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const {
    data: produitsVedette = [],
    isPending: loadingVedette,
  } = useQuery({
    queryKey: ['produits', 'vedette', 'pwa'],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/produits?vedette=true&limit=6', {
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
    
    const chargerCategories = async () => {
      try {
        const response = await fetch('/api/categories?active=true')
        if (!response.ok) throw new Error(`Erreur API catégories: ${response.status}`)
        const payload = await response.json()
        const categoriesData = payload?.data || []

        const categoriesMapped = categoriesData
          .filter((cat: any) => cat.image_url && cat.image_url.trim() !== '')
          .map((cat: any) => ({
            titre: cat.nom,
            tagline: cat.description || '',
            image: cat.image_url,
            lien: `/pwa/boutique/${cat.slug}`,
          }))

        setCategories(categoriesMapped)
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    chargerCategories()
  }, [])

  return (
    <div className="w-full">
      <StickyHeader />
      
      {/* Hero Section - Mobile Optimized */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Chaussures luxe Maison Slimani"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
        
        <motion.div
          className="relative z-10 w-full text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-serif text-white mb-4 text-balance leading-tight drop-shadow-lg">
            L'excellence du cuir <span className="text-dore">marocain</span>
          </h1>
          <p className="text-lg text-white/90 mb-6 max-w-md mx-auto leading-relaxed drop-shadow-md">
            Chaussures homme haut de gamme, confectionnées avec passion
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-dore text-charbon hover:bg-dore/90"
          >
            <Link href="/pwa/boutique">Découvrir</Link>
          </Button>
        </motion.div>
      </section>

      {/* Features - Mobile Optimized */}
      <section className="py-8 px-4 bg-ecru">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="flex flex-col items-center text-center">
            <Truck className="w-6 h-6 text-dore mb-2" />
            <span className="text-xs text-muted-foreground">Livraison gratuite</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <RefreshCcw className="w-6 h-6 text-dore mb-2" />
            <span className="text-xs text-muted-foreground">Retours faciles</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Award className="w-6 h-6 text-dore mb-2" />
            <span className="text-xs text-muted-foreground">Qualité premium</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      {!loadingCategories && categories.length > 0 && (
        <section className="py-8 px-4">
          <h2 className="text-2xl font-serif text-foreground mb-6 text-center">Catégories</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {categories.slice(0, 4).map((categorie, index) => (
              <motion.div
                key={categorie.lien}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={categorie.lien} className="block group">
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                    <Image
                      src={categorie.image}
                      alt={categorie.titre}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  <h3 className="font-serif font-semibold text-foreground text-center">
                    {categorie.titre}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {!loadingVedette && produitsVedette.length > 0 && (
        <section className="py-8 px-4 bg-ecru/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-foreground">Produits vedettes</h2>
            <Link href="/pwa/boutique">
              <Button variant="ghost" size="sm" className="text-dore">
                Voir tout
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {produitsVedette.slice(0, 4).map((produit: any, index: number) => (
              <motion.div
                key={produit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard produit={produit} />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

