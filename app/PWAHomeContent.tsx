'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import ProductCard from '@/components/pwa/ProductCard'
import StickyHeader from '@/components/pwa/StickyHeader'
import GoldDivider from '@/components/ui/GoldDivider'
import { hapticFeedback } from '@/lib/haptics'

const heroImage = '/assets/hero-chaussures.jpg'
const lifestyleImage1 = '/assets/lookbook-lifestyle-1.jpg'
const lifestyleImage2 = '/assets/lookbook-lifestyle-2.jpg'
const lifestyleImage3 = '/assets/lookbook-atelier.jpg'
const maisonImage = '/assets/lookbook-atelier.jpg'

export default function PWAHomeContent() {
  const [categories, setCategories] = useState<Array<{
    titre: string
    tagline: string
    image: string
    lien: string
  }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)

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
            lien: `/boutique/${cat.slug}`,
          }))

        setCategories(categoriesMapped)
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    const chargerSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.telephone) {
            // Format phone number for WhatsApp: remove spaces, dashes, and ensure it starts with country code
            let phone = result.data.telephone.replace(/\s+/g, '').replace(/-/g, '').replace(/\+/g, '')
            // If it doesn't start with 212, add it (Morocco country code)
            if (!phone.startsWith('212')) {
              // Remove leading 0 if present
              if (phone.startsWith('0')) {
                phone = phone.substring(1)
              }
              phone = '212' + phone
            }
            setWhatsappNumber(phone)
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
      }
    }

    chargerCategories()
    chargerSettings()
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
            <Link href="/boutique">Découvrir</Link>
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
                {categories.map((categorie, index) => (
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
                <div className="flex justify-center">
                  <Link 
                    href="/boutique"
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
                <Link href="/boutique">
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
                <Link href="/boutique">
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

      {/* Craftsmanship Timeline - Images */}
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
              { image: '/assets/etape1.jpg', title: 'Sélection', desc: 'Cuir premium sélectionné' },
              { image: '/assets/etape2.jpg', title: 'Découpe', desc: 'Précision artisanale' },
              { image: '/assets/etape3.jpg', title: 'Assemblage', desc: 'Techniques traditionnelles' },
              { image: '/assets/etape4.jpg', title: 'Finitions', desc: 'Détails méticuleux' },
              { image: '/assets/etape5.jpg', title: 'Excellence', desc: 'Qualité garantie' },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto mb-6 rounded-lg overflow-hidden shadow-lg border-2 border-dore/20">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 192px, 224px"
                  />
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-2 text-lg md:text-xl">{step.title}</h3>
                <p className="text-base md:text-lg text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <GoldDivider variant="centered" withIcon="sparkles" spacing="lg" />

      {/* Contactez-nous Section */}
      {whatsappNumber && (
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-ecru via-ecru/95 to-charbon relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/pattern-gold.svg')] opacity-5" />
          <div className="relative max-w-4xl mx-auto text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-serif text-charbon mb-4">
                  Contactez-nous
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-dore to-transparent mx-auto mb-6" />
                <p className="text-lg md:text-xl text-charbon/80 max-w-2xl mx-auto leading-relaxed">
                  Une question ? Un conseil personnalisé ? Notre équipe est à votre écoute pour vous accompagner dans votre choix.
                </p>
              </div>
              
              <motion.a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => hapticFeedback('medium')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-dore via-dore/95 to-dore text-charbon font-serif text-lg md:text-xl rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-dore/20 hover:border-dore/40"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-charbon"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                    fill="currentColor"
                  />
                </svg>
                <span>Nous contacter</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-charbon"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </motion.a>
            </motion.div>
          </div>
        </section>
      )}

      {/* Floating WhatsApp Button */}
      {whatsappNumber && (
        <motion.a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
          onClick={() => hapticFeedback('medium')}
          aria-label="Contacter sur WhatsApp"
        >
        {/* Authentic WhatsApp Icon SVG */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
            fill="currentColor"
          />
        </svg>
      </motion.a>
      )}

    </div>
  )
}

