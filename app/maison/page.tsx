'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'

const lookbookImage = '/assets/lookbook-atelier.jpg'

export default function MaisonPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // SEO Meta Tags
  useEffect(() => {
    // Update title
    document.title = "Notre Maison - L'Histoire de Maison Slimani"
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    const description = "Découvrez l'histoire et les valeurs de Maison Slimani, marque marocaine de chaussures homme haut de gamme. Un savoir-faire transmis de génération en génération."
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
      ogTitle.setAttribute('content', "Notre Maison - L'Histoire de Maison Slimani")
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:title')
      meta.content = "Notre Maison - L'Histoire de Maison Slimani"
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

    // Add structured data (AboutPage)
    const existingScript = document.getElementById('maison-structured-data')
    if (existingScript) {
      existingScript.remove()
    }
    
    const script = document.createElement('script')
    script.id = 'maison-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: "Notre Maison - Maison Slimani",
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
            name: 'Notre Maison',
            item: window.location.href
          }
        ]
      }
    })
    document.head.appendChild(script)
  }, [])

  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <NavigationDesktop />
      <EnteteMobile />

      <div className="container px-6 py-12 max-w-4xl mx-auto">
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-12"
        >
          <header>
            <h1 className="text-4xl md:text-5xl font-serif mb-6">Notre Maison</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              L'histoire d'une passion transmise de génération en génération
            </p>
          </header>

          <motion.div
            className="relative aspect-video overflow-hidden rounded-lg shadow-2xl"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
            whileHover={{ scale: 1.02 }}
          >
            <Image
              src={lookbookImage}
              alt="Artisans Maison Slimani"
              fill
              className="object-cover transition-transform duration-700"
              style={{
                objectPosition: 'center 40%',
              }}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </motion.div>

          <section className="prose prose-lg max-w-none space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-serif mb-4">Un héritage artisanal</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Fondée au cœur de Casablanca, Maison Slimani perpétue l'excellence 
                de l'artisanat marocain du cuir. Nos maîtres artisans, formés selon 
                les techniques ancestrales, confectionnent chaque paire avec une 
                attention méticuleuse aux détails.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h2 className="text-3xl font-serif mb-4 mt-12">Notre engagement qualité</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Nous sélectionnons rigoureusement les meilleurs cuirs, tannés de 
                manière traditionnelle. Chaque modèle est le fruit d'heures de travail 
                manuel, garantissant une durabilité et un confort exceptionnels.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h2 className="text-3xl font-serif mb-4 mt-12">Made in Morocco</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Fièrement marocaine, Maison Slimani contribue à la préservation d'un 
                savoir-faire unique. Nous sommes engagés dans une démarche durable, 
                respectueuse de nos artisans et de l'environnement.
              </p>
            </motion.div>
          </section>
        </motion.article>
      </div>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}
