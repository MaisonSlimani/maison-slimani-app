'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import CarteCategorie from '@/components/CarteCategorie'
import CarteProduit from '@/components/CarteProduit'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

// Images des catégories
const categorieClassiques = '/assets/categorie-classiques.jpg'
const categorieExotiques = '/assets/categorie-exotiques.jpg'
const categorieLimitees = '/assets/categorie-limitees.jpg'
const categorieNouveautes = '/assets/categorie-nouveautes.jpg'

export default function BoutiquePage() {
  const [produitsVedette, setProduitsVedette] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const chargerProduits = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        
        // Charger produits vedette uniquement
        const { data: vedette } = await supabase
          .from('produits')
          .select('*')
          .eq('vedette', true)
          .limit(6)

        setProduitsVedette(vedette || [])
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error)
      } finally {
        setLoading(false)
      }
    }

    chargerProduits()
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

  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <NavigationDesktop />
      <EnteteMobile />

      {/* Section Catégories avec animations luxueuses */}
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
                <CarteCategorie {...categorie} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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

          {/* Produits en vedette */}
          {produitsVedette.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-16"
            >
              <h3 className="text-2xl md:text-3xl font-serif mb-8 text-center">
                Produits en vedette
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
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
                    className="transition-transform duration-500"
                  >
                    <CarteProduit produit={produit} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}
