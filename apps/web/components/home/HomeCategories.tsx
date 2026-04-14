'use client'

import React from 'react'
import { motion } from 'framer-motion'
import CarteCategorie from '@/components/CarteCategorie'
import { CategoryCardItem } from '@/types/views'

interface HomeCategoriesProps {
  categories: CategoryCardItem[]
  loading: boolean
}

export function HomeCategories({ categories, loading }: HomeCategoriesProps) {
  return (
    <section className="py-24 px-6 bg-ecru">
      <div className="container max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-5xl font-serif mb-6 text-charbon">Nos Collections</h2>
        <p className="text-xl text-charbon/70 max-w-2xl mx-auto">L'excellence de l'artisanat marocain</p>
      </div>
      {!loading ? (
        <div className="grid md:grid-cols-2 gap-8 container max-w-6xl mx-auto">
          {categories.map((cat, i: number) => (
            <motion.div key={cat.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <CarteCategorie {...cat} priority={i === 0} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 font-serif text-charbon/50">Chargement des collections...</div>
      )}
    </section>
  )
}
