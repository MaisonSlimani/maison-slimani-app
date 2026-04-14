'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { hapticFeedback } from '@/lib/haptics'
import { CategoryCardItem } from '@/types/views'

interface HomeCategoriesProps {
  categories: CategoryCardItem[]
  loading: boolean
}

/**
 * Unified Home Categories Section
 * Switches between immersive mobile PWA squares and premium desktop luxury banners.
 */
export function HomeCategories({ categories, loading }: HomeCategoriesProps) {
  if (loading) {
    return <div className="py-20 text-center font-serif text-charbon/50">Chargement...</div>;
  }

  return (
    <section className="py-12 md:py-24 px-4 md:px-6 bg-ecru">
      {/* Section Header */}
      <div className="container max-w-6xl mx-auto text-center mb-10 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-serif mb-4 md:mb-6 text-charbon">Nos Collections</h2>
        <p className="text-base md:text-xl text-charbon/70 max-w-2xl mx-auto">L'excellence de l'artisanat marocain</p>
      </div>

      <div className="container max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8">
          {categories.slice(0, 4).map((cat, i: number) => (
            <motion.div 
              key={cat.link} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link 
                href={cat.link} 
                className="group block relative overflow-hidden rounded-xl md:rounded-lg shadow-md md:shadow-lg bg-white"
                onClick={() => hapticFeedback('light')}
              >
                {/* Image Container with specific responsive Aspect Ratio */}
                <div className="relative aspect-square md:aspect-[4/3] overflow-hidden w-full">
                  <motion.div
                    className="absolute inset-0 w-full h-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover w-full h-full"
                      priority={i < 2}
                      sizes="(max-width: 768px) 50vw, 40vw"
                    />
                  </motion.div>
                  
                  {/* Desktop Only: Dark gradient overlay and overlay text */}
                  <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-charbon/80 via-charbon/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="hidden md:flex absolute inset-0 flex-col justify-end p-6 text-[#f8f5f0]">
                    <h3 className="text-2xl font-serif">{cat.title}</h3>
                  </div>
                </div>

                {/* Mobile Only: Text below image for PWA feel */}
                <div className="md:hidden p-3 text-center">
                  <h3 className="font-serif text-sm text-charbon">{cat.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
