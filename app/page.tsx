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

// Chemins des images (Next.js Image nécessite des chemins relatifs depuis public/)
const heroImage = '/assets/hero-chaussures.jpg'
const lookbookImage = '/assets/lookbook-1.jpg'
const categorieClassiques = '/assets/categorie-classiques.jpg'
const categorieExotiques = '/assets/categorie-exotiques.jpg'
const categorieLimitees = '/assets/categorie-limitees.jpg'
const categorieNouveautes = '/assets/categorie-nouveautes.jpg'
const lookbookLifestyle1 = '/assets/lookbook-lifestyle-1.jpg'
const lookbookAtelier = '/assets/lookbook-atelier.jpg'
const lookbookLifestyle2 = '/assets/lookbook-lifestyle-2.jpg'
const produitMocassin = '/assets/produit-mocassin.jpg'
const produitRichelieu = '/assets/produit-richelieu.jpg'
const produitBoots = '/assets/produit-boots.jpg'

export default function AccueilPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const categories = [
    {
      titre: 'Classiques',
      tagline: "L'essence de l'élégance quotidienne",
      image: categorieClassiques,
      lien: '/boutique/classiques',
    },
    {
      titre: 'Cuirs Exotiques',
      tagline: 'Le luxe dans sa forme la plus rare',
      image: categorieExotiques,
      lien: '/boutique/cuirs-exotiques',
    },
    {
      titre: 'Éditions Limitées',
      tagline: 'Des pièces uniques pour les connaisseurs',
      image: categorieLimitees,
      lien: '/boutique/editions-limitees',
    },
    {
      titre: 'Nouveautés',
      tagline: 'Les dernières créations de nos ateliers',
      image: categorieNouveautes,
      lien: '/boutique/nouveautes',
    },
  ]

  const produitsVedette = [
    {
      id: '1',
      nom: 'Mocassin Fès',
      slug: 'mocassin-fes',
      prix: 2800,
      image: produitMocassin,
      matiere: 'Cuir de veau premium',
    },
    {
      id: '2',
      nom: 'Richelieu Marrakech',
      slug: 'richelieu-marrakech',
      prix: 3200,
      image: produitRichelieu,
      matiere: 'Cuir italien',
    },
    {
      id: '3',
      nom: 'Boots Casablanca',
      slug: 'boots-casablanca',
      prix: 3600,
      image: produitBoots,
      matiere: 'Cuir grainé',
    },
  ]

  const lookbookImages = [
    { src: lookbookLifestyle1, caption: "L'élégance marocaine contemporaine" },
    { src: lookbookAtelier, caption: "Nos maîtres artisans au travail" },
    { src: lookbookLifestyle2, caption: 'Le souci du détail' },
  ]

  const handleButtonClick = () => {
    if ((window as any).playClickSound) {
      ;(window as any).playClickSound()
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
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
            L'excellence du cuir <span className="text-dore">marocain</span>
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

          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((categorie, index) => (
              <motion.div
                key={categorie.titre}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <CarteCategorie {...categorie} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Produits en Vedette */}
      <section className="py-20 px-6">
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
              Nos créations les plus prisées, alliant tradition et modernité
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {produitsVedette.map((produit, index) => (
              <motion.div
                key={produit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="group"
              >
                <motion.div 
                  className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <CarteProduit produit={produit} />
                </motion.div>
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
        </div>
      </section>

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

      {/* Lookbook / Inspiration */}
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-0">
          <motion.div
            className="text-center mb-16 px-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-4">
              Inspiration
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              L'élégance marocaine contemporaine
            </p>
          </motion.div>

          <div className="space-y-0">
            {lookbookImages.map((item, index) => (
              <motion.div
                key={index}
                className="relative h-[70vh] overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1 }}
              >
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                >
                  <Image
                    src={item.src}
                    alt={item.caption}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="100vw"
                  />
                </motion.div>
                {/* Overlay dégradé pour améliorer la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-t from-charbon/80 via-charbon/30 to-transparent" />
                <motion.div
                  className="absolute bottom-12 left-0 right-0 text-center px-6 z-10"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <p className="text-2xl md:text-3xl font-serif text-[#f8f5f0] drop-shadow-lg">
                    {item.caption}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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

