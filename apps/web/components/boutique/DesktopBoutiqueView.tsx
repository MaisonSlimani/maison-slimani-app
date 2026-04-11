'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import CarteCategorie from '@/components/CarteCategorie'
import { Button } from '@maison/ui'
import CategoryCardSkeleton from '@/components/skeletons/CategoryCardSkeleton'

import { Category } from '@maison/domain'

import { useBoutiqueData } from '@/hooks/useBoutiqueData'

interface BoutiqueCategory {
  titre: string;
  tagline: string;
  image: string;
  lien: string;
}

export default function DesktopBoutiqueView({ initialCategories }: { initialCategories?: Category[] }) {
  const { categoriesWithImages, loadingCategories } = useBoutiqueData('tous', '', initialCategories)

  useBoutiqueSEO(categoriesWithImages, loadingCategories)

  if (loadingCategories) return <BoutiqueSkeleton />

  return (
    <div className="pb-0 pt-20">
      <section className="py-20 px-6 bg-ecru">
        <div className="container max-w-6xl mx-auto">
          <BoutiqueHero />
          <CategoryGrid categories={categoriesWithImages} />
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container max-w-6xl mx-auto">
          <BoutiqueFooterCTA />
        </div>
      </section>
    </div>
  )
}

function useBoutiqueSEO(categories: BoutiqueCategory[], loading: boolean) {
  useEffect(() => {
    if (loading) return
    document.title = 'Boutique - Nos Collections | Maison Slimani'
    const script = document.createElement('script')
    script.id = 'boutique-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Boutique - Nos Collections', url: window.location.href })
    document.head.appendChild(script)
    return () => { document.getElementById('boutique-structured-data')?.remove() }
  }, [categories, loading])
}

function BoutiqueHero() {
  return (
    <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      <h1 className="text-4xl md:text-6xl font-serif mb-6 text-charbon">Nos Collections</h1>
      <p className="text-lg md:text-xl text-charbon/70 max-w-2xl mx-auto leading-relaxed">
        Découvrez nos collections exclusives, chacune incarnant l'excellence marocaine
      </p>
    </motion.div>
  )
}

function CategoryGrid({ categories }: { categories: BoutiqueCategory[] }) {
  if (categories.length === 0) return (
    <div className="text-center py-16">
      <p className="text-charbon/70 text-lg mb-6">Aucune catégorie disponible</p>
      <Button asChild variant="outline">
        <Link href="/boutique/tous">Voir tous les produits</Link>
      </Button>
    </div>
  )

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {categories.map((cat, i) => (
        <motion.div key={cat.titre} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.8 }} whileHover={{ y: -8 }}>
          <CarteCategorie {...cat} priority={i < 2} />
        </motion.div>
      ))}
    </div>
  )
}

function BoutiqueSkeleton() {
  return (
    <section className="py-20 px-6 bg-ecru pt-40">
      <div className="container max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8"><CategoryCardSkeleton count={4} /></div>
      </div>
    </section>
  )
}

function BoutiqueFooterCTA() {
  return (
    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      <h2 className="text-3xl md:text-5xl font-serif mb-4">Voir tous nos produits</h2>
      <p className="text-lg text-muted-foreground mb-8">Explorez notre collection complète</p>
      <Button asChild size="lg" className="bg-dore text-charbon hover:bg-dore/90 px-10">
        <Link href="/boutique/tous">Découvrir toute la collection</Link>
      </Button>
    </motion.div>
  )
}
