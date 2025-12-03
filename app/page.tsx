'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import CarteCategorie from '@/components/CarteCategorie'
import CarteProduit from '@/components/CarteProduit'
import SoundPlayer from '@/components/SoundPlayer'
import { Truck, RefreshCcw, Award } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// Chemins des images (Next.js Image nécessite des chemins relatifs depuis public/)
const heroImage = '/assets/hero-chaussures.jpg'
const lookbookImage = '/assets/lookbook-1.jpg'

export default function AccueilPage() {
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
    queryKey: ['produits', 'vedette'],
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
  }, [])

  // SEO Meta Tags - Dynamic
  useEffect(() => {
    // Update title
    document.title = 'Maison Slimani - Chaussures Homme Luxe Maroc | Accueil'
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    const description = 'Maison Slimani : chaussures homme haut de gamme en cuir marocain. Qualité artisanale et savoir-faire d\'excellence. Collections exclusives confectionnées à la main. Livraison gratuite au Maroc. Retours sous 7 jours.'
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
      ogTitle.setAttribute('content', 'Maison Slimani - Chaussures Homme Luxe Maroc | Accueil')
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:title')
      meta.content = 'Maison Slimani - Chaussures Homme Luxe Maroc | Accueil'
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

    // Add structured data (Organization, Website)
    const existingScript = document.getElementById('home-structured-data')
    if (existingScript) {
      existingScript.remove()
    }
    
    const script = document.createElement('script')
    script.id = 'home-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${window.location.origin}/#organization`,
          name: 'Maison Slimani',
          url: window.location.origin,
          logo: `${window.location.origin}/assets/logos/logo_nobg.png`,
          description: 'Maison Slimani : chaussures homme haut de gamme en cuir marocain. Qualité artisanale et savoir-faire d\'excellence.',
          sameAs: [],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            availableLanguage: ['French', 'Arabic']
          }
        },
        {
          '@type': 'WebSite',
          '@id': `${window.location.origin}/#website`,
          url: window.location.origin,
          name: 'Maison Slimani',
          description: description,
          publisher: {
            '@id': `${window.location.origin}/#organization`
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${window.location.origin}/boutique?search={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${window.location.origin}/#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Accueil',
              item: window.location.origin
            }
          ]
        }
      ]
    })
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const chargerCategories = async () => {
      try {
        const response = await fetch('/api/categories?active=true', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Erreur API catégories: ${response.status}`)
        }

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
        if ((error as Error).name === 'AbortError') {
          return
        }
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

    return () => controller.abort()
  }, [])



  const handleButtonClick = () => {
    // Click sound removed
  }

  return (
    <div className="overflow-x-hidden">
      <SoundPlayer enabled={true} />
      <NavigationDesktop />
      <EnteteMobile />

      {/* Hero Section avec overlay - plein écran sur mobile, pas de marges latérales */}
      <section className="hero-section-mobile relative h-[90vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 hero-image-container z-0"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            minWidth: '100%',
            minHeight: '100%',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <Image
            src={heroImage}
            alt="Chaussures luxe Maison Slimani"
            fill
            className="object-cover"
            style={{
              objectPosition: 'center 40%',
              width: '100%',
              height: '100%',
              minWidth: '100%',
              minHeight: '100%',
            }}
            priority
            sizes="100vw"
          />
        </motion.div>
        {/* Overlay dégradé sombre pour améliorer la lisibilité - très léger */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40 z-[1]" />
        {/* Dégradé de transition vers ecru - uniquement en bas, pas sur les côtés */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-ecru/30 to-ecru pointer-events-none z-[2]" style={{ bottom: '-1px' }} />
        
        <motion.div
          className="relative z-10 w-full text-center px-4 md:container md:px-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9 }}
        >
          <h1 className="text-5xl md:text-7xl font-serif text-[#f8f5f0] mb-6 text-balance leading-tight drop-shadow-lg">
            L'excellence du cuir{' '}
            <span 
              className="text-dore relative inline-block"
              style={{
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 165, 116, 0.5)',
                filter: 'drop-shadow(0 0 10px rgba(212, 165, 116, 0.6))',
              }}
            >
              marocain
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#f8f5f0]/90 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Chaussures homme haut de gamme, confectionnées avec passion
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-dore text-charbon hover:bg-dore/90 border-dore"
              onClick={handleButtonClick}
            >
              <Link href="/boutique">Découvrir la collection</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Nos Catégories */}
      {!loadingCategories && (
        <section className="py-20 px-6 bg-ecru -mt-32 pt-32 md:-mt-32 md:pt-32" style={{ marginTop: '-8rem', marginBottom: '-1px' }}>
          <div className="container max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-serif mb-4 text-charbon">
                Nos Catégories
              </h2>
              <p className="text-lg text-charbon/70 max-w-2xl mx-auto">
                Découvrez nos collections exclusives, chacune incarnant l'excellence marocaine
              </p>
            </motion.div>

            {categories.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {categories.map((categorie, index) => (
                  <motion.div
                    key={categorie.titre}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <CarteCategorie {...categorie} priority={index === 0} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-charbon/70 text-lg mb-4">Aucune catégorie disponible pour le moment</p>
                <Button 
                  asChild 
                  variant="outline"
                  className="border-charbon/30 text-charbon hover:bg-charbon/10"
                  onClick={handleButtonClick}
                >
                  <Link href="/boutique">Découvrir la boutique</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Produits en Vedette */}
      {!loadingVedette && (
        <section className="py-12 md:py-20 px-3 md:px-6 bg-ecru">
          <div className="container max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-serif mb-4">
                Produits en Vedette
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Découvrez nos créations les plus emblématiques, sélectionnées pour leur excellence
              </p>
            </motion.div>

            {produitsVedette.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
                  {produitsVedette.map((produit, index) => (
                    <motion.div
                      key={produit.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.1,
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{ y: -8 }}
                      className="transition-transform duration-500 h-full"
                    >
                      <CarteProduit 
                        produit={{
                          id: produit.id,
                          nom: produit.nom,
                          prix: produit.prix,
                          image_url: produit.image_url,
                          image: produit.image_url,
                          stock: produit.stock,
                          has_colors: produit.has_colors,
                          couleurs: produit.couleurs,
                          taille: produit.taille,
                          matiere: produit.matiere,
                          images: produit.images,
                          slug: produit.slug,
                        }}
                        showActions={true}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-12">
                  <Button 
                    asChild 
                    size="lg" 
                    variant="outline"
                    className="border-dore text-dore hover:bg-dore hover:text-charbon"
                    onClick={handleButtonClick}
                  >
                    <Link href="/boutique">Voir toute la collection</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-4">Aucun produit disponible pour le moment</p>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="border-dore text-dore hover:bg-dore hover:text-charbon"
                  onClick={handleButtonClick}
                >
                  <Link href="/boutique">Découvrir la boutique</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Notre Savoir-Faire */}
      <section className="py-20 px-6 bg-ecru">
        <motion.div
          className="container max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl md:text-5xl font-serif mb-6 text-charbon">
                Un savoir-faire ancestral
              </h2>
              <p className="text-charbon/80 text-lg mb-6 leading-relaxed">
                Maison Slimani perpétue l'excellence de l'artisanat marocain. 
                Chaque paire est confectionnée à la main par nos maîtres artisans, 
                dans le respect des traditions séculaires du travail du cuir.
              </p>
              <p className="text-charbon/70 text-base mb-8 leading-relaxed italic">
                Du choix des peaux les plus nobles à la finition minutieuse, 
                chaque étape incarne notre passion pour l'excellence et notre attachement 
                au patrimoine marocain.
              </p>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-cuir text-cuir hover:bg-cuir hover:text-ecru"
                onClick={handleButtonClick}
              >
                <Link href="/maison">Découvrir la Maison</Link>
              </Button>
            </div>
            <motion.div
              className="order-1 md:order-2 overflow-hidden rounded-lg shadow-xl relative aspect-square"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={lookbookImage}
                alt="Artisanat Maison Slimani"
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Craftsmanship Timeline - Desktop */}
      <section className="py-24 px-6 bg-ecru">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-charbon mb-4">
              Du cuir brut à l'excellence
            </h2>
            <p className="text-lg text-muted-foreground uppercase tracking-wide">
              NOTRE PROCESSUS DE FABRICATION
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
            {[
              { image: '/assets/etape1.jpg', title: 'Sélection', desc: 'Cuir premium sélectionné' },
              { image: '/assets/etape2.jpg', title: 'Découpe', desc: 'Précision artisanale' },
              { image: '/assets/etape3.jpg', title: 'Assemblage', desc: 'Techniques traditionnelles' },
              { image: '/assets/etape4.jpg', title: 'Finitions', desc: 'Détails méticuleux' },
              { image: '/assets/etape5.jpg', title: 'Excellence', desc: 'Qualité garantie' },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="text-center group"
              >
                <div className="relative w-48 h-48 lg:w-56 lg:h-56 mx-auto mb-6 rounded-lg overflow-hidden shadow-xl border-2 border-dore/20 group-hover:border-dore/50 transition-all duration-300">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 224px"
                    loading="lazy"
                  />
                  {/* Step number badge - hidden on mobile, shown on desktop */}
                  <div className="hidden md:flex absolute top-2 left-2 bg-dore text-charbon rounded-full w-8 h-8 items-center justify-center font-serif font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-serif font-semibold text-charbon mb-3 text-2xl lg:text-3xl">
                  <span className="md:hidden">{String(index + 1).padStart(2, '0')}. </span>
                  {step.title}
                </h3>
                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contactez-nous Section */}
      {whatsappNumber && (
        <section className="py-20 md:py-32 px-6 bg-gradient-to-b from-ecru via-ecru/95 to-charbon relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/pattern-gold.svg')] opacity-5" />
          <div className="relative container max-w-5xl mx-auto text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-10">
                <h2 className="text-5xl md:text-6xl font-serif text-charbon mb-6">
                  Contactez-nous
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-dore to-transparent mx-auto mb-8" />
                <p className="text-xl md:text-2xl text-charbon/80 max-w-3xl mx-auto leading-relaxed">
                  Une question ? Un conseil personnalisé ? Notre équipe est à votre écoute pour vous accompagner dans votre choix.
                </p>
              </div>
              
              <motion.a
                href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleButtonClick}
              className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-dore via-dore/95 to-dore text-charbon font-serif text-xl md:text-2xl rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-dore/20 hover:border-dore/40"
            >
              <svg
                width="28"
                height="28"
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
                width="24"
                height="24"
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

      {/* Bannière de Confiance */}
      <section className="bg-charbon text-dore py-8">
        <div className="container px-6 mx-auto">
          <div className="flex items-center justify-center gap-12 flex-wrap text-center">
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Truck className="w-8 h-8" />
              <span className="font-serif text-lg">Livraison gratuite</span>
              <span className="text-ecru/70 text-sm">Dans tout le Maroc</span>
            </motion.div>
            
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <RefreshCcw className="w-8 h-8" />
              <span className="font-serif text-lg">Retours sous 7 jours</span>
              <span className="text-ecru/70 text-sm">Satisfait ou remboursé</span>
            </motion.div>
            
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Award className="w-8 h-8" />
              <span className="font-serif text-lg">Artisanat d'exception</span>
              <span className="text-ecru/70 text-sm">Fait main au Maroc</span>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}

