'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Crown, ChevronDown } from 'lucide-react'
import ProductCard from '@/components/pwa/ProductCard'
import StickyHeader from '@/components/pwa/StickyHeader'
import GoldDivider from '@/components/ui/GoldDivider'
import { hapticFeedback } from '@/lib/haptics'

const heroImage = '/assets/hero-chaussures.jpg'
const lifestyleImage1 = '/assets/lookbook-lifestyle-1.jpg'
const lifestyleImage2 = '/assets/lookbook-lifestyle-2.jpg'
const lifestyleImage3 = '/assets/lookbook-atelier.jpg'
const maisonImage = '/assets/lookbook-atelier.jpg'

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
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Chaussures luxe Maison Slimani"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </div>
        
        <motion.div
          className="relative z-10 w-full text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-serif text-white mb-6 text-balance leading-tight drop-shadow-2xl">
            L'excellence du cuir <span className="text-dore">marocain</span>
          </h1>
          <p className="text-xl text-white/95 mb-8 max-w-md mx-auto leading-relaxed drop-shadow-lg font-light">
            Chaussures homme haut de gamme, confectionnées avec passion
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-dore text-charbon hover:bg-dore/90 text-lg px-8 py-6 rounded-lg shadow-lg"
            onClick={() => hapticFeedback('medium')}
          >
            <Link href="/pwa/boutique">Découvrir</Link>
          </Button>
        </motion.div>
      </section>

      {/* Trust Bar - Exact Match */}
      <section className="bg-charbon text-ecru py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 md:gap-6 text-sm md:text-base">
          <span className="font-light">LIVRAISON GRATUITE</span>
          <span className="text-dore">•</span>
          <span className="font-light">FAIT MAIN</span>
          <span className="text-dore">•</span>
          <span className="font-light">RETOURS 7J</span>
        </div>
      </section>

      {/* Collections Section */}
      {!loadingCategories && (
        <section className="pt-12 pb-6 px-4 bg-ecru">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-serif text-foreground mb-8 text-center">Collections</h2>
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {categories.slice(0, 4).map((categorie, index) => (
                  <motion.div
                    key={categorie.lien}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <Link 
                      href={categorie.lien} 
                      className="block group"
                      onClick={() => hapticFeedback('light')}
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-3 border-2 border-transparent group-hover:border-dore transition-all duration-300">
                        <Image
                          src={categorie.image}
                          alt={categorie.titre}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <h3 className="font-serif font-medium text-foreground text-center text-sm md:text-base">
                        {categorie.titre}
                      </h3>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Aucune catégorie disponible pour le moment</p>
              </div>
            )}
          </div>
        </section>
      )}

      <GoldDivider variant="centered" spacing="sm" />

      {/* La Maison Teaser - Dark Background with Overlay */}
      <section className="py-4 md:py-6 px-4 bg-ecru relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto rounded-lg overflow-hidden shadow-xl">
          <div className="relative aspect-[4/3] md:aspect-[16/9]">
            <Image
              src={maisonImage}
              alt="Atelier Maison Slimani - Savoir-faire ancestral"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 90vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charbon/90 via-charbon/70 to-charbon/50" />
            
            {/* N Badge */}
            <div className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-charbon/80 backdrop-blur-sm border border-dore/50 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center items-center px-6 md:px-12 z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto text-center"
              >
                <p className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mb-6 md:mb-8 italic leading-relaxed drop-shadow-lg">
                  "Chaque paire raconte l'histoire d'un savoir-faire ancestral"
                </p>
                <div className="flex justify-start md:justify-center">
                  <Link 
                    href="/pwa/boutique"
                    className="text-dore hover:text-dore/80 font-serif text-base md:text-lg flex items-center gap-2 transition-colors"
                    onClick={() => hapticFeedback('light')}
                  >
                    Découvrir la Maison <span>{'>'}</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <GoldDivider variant="centered" withIcon="sparkles" spacing="lg" />

      {/* Sélection Section */}
      {!loadingVedette && (
        <section className="pt-6 pb-6 px-4 bg-ecru/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-serif text-foreground">Sélection</h2>
              {produitsVedette.length > 0 && (
                <Link href="/pwa/boutique">
                  <Button variant="ghost" size="sm" className="text-dore">
                    Voir tout <span className="ml-1">{'>'}</span>
                  </Button>
                </Link>
              )}
            </div>
            {produitsVedette.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {produitsVedette.slice(0, 6).map((produit: any, index: number) => (
                  <motion.div
                    key={produit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard produit={produit} priority={index < 2} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Aucun produit disponible pour le moment</p>
                <Link href="/pwa/boutique">
                  <Button variant="outline" className="mt-4">
                    Voir la boutique
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <GoldDivider variant="centered" spacing="sm" />

      {/* Inspiration Carousel */}
      <section className="pt-6 pb-12 px-4 bg-ecru overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif text-foreground mb-8 text-center">Inspiration</h2>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4">
            {[
              { src: lifestyleImage1, alt: 'Style urbain élégant' },
              { src: lifestyleImage2, alt: 'Élégance intemporelle' },
              { src: lifestyleImage3, alt: 'Artisanat traditionnel' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative w-[85vw] md:w-[60vw] h-[60vh] flex-shrink-0 snap-center rounded-lg overflow-hidden shadow-xl"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 85vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charbon/70 via-transparent to-transparent" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider variant="centered" withIcon="crown" spacing="lg" />

      {/* Craftsmanship Timeline - Numbered Circles */}
      <section className="py-16 px-4 bg-ecru">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4 text-center">
            Du cuir brut à l'excellence
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-sm uppercase tracking-wide">
            NOTRE PROCESSUS DE FABRICATION
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { num: '01', title: 'Sélection', desc: 'Cuir premium sélectionné' },
              { num: '02', title: 'Découpe', desc: 'Précision artisanale' },
              { num: '03', title: 'Assemblage', desc: 'Techniques traditionnelles' },
              { num: '04', title: 'Finitions', desc: 'Détails méticuleux' },
              { num: '05', title: 'Excellence', desc: 'Qualité garantie' },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-dore/10 border-2 border-dore/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-serif text-dore font-bold">{step.num}</span>
                  </div>
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider variant="centered" spacing="lg" />

      {/* WhatsApp CTA - Green Button */}
      <section className="py-16 px-4 bg-ecru">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-lg text-muted-foreground mb-6">
              Une question sur nos créations?
            </p>
            <Button
              asChild
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-lg"
              onClick={() => hapticFeedback('success')}
            >
              <a
                href="https://wa.me/212XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      <GoldDivider variant="centered" withIcon="star" spacing="lg" />

      {/* VIP Newsletter - Dark Section */}
      <section className="py-16 px-4 bg-charbon text-ecru">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Crown className="w-12 h-12 mx-auto mb-6 text-dore" />
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Rejoignez le Cercle Slimani
            </h2>
            <p className="text-ecru/80 text-lg mb-8">
              Accès exclusif aux nouvelles collections et offres privées
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-3 rounded-lg border border-dore/30 bg-charbon/50 text-ecru placeholder:text-ecru/50 focus:outline-none focus:ring-2 focus:ring-dore"
              />
              <Button
                type="submit"
                className="bg-dore text-charbon hover:bg-dore/90 px-8"
                onClick={(e) => {
                  e.preventDefault()
                  hapticFeedback('success')
                }}
              >
                S'inscrire
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
