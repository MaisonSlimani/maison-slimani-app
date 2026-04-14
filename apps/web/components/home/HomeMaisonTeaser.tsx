'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { hapticFeedback } from '@/lib/haptics'

const maisonImage = '/assets/lookbook-atelier.jpg'

/**
 * Cinematic "La Maison" teaser section.
 * Dark overlay with a centered quote over the atelier image.
 * Mobile-first with responsive typography scaling.
 */
export function HomeMaisonTeaser() {
  return (
    <section className="py-4 md:py-8 px-4 md:px-6 bg-ecru relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto rounded-lg overflow-hidden shadow-xl">
        <div className="relative aspect-[4/3] md:aspect-[16/9]">
          <Image
            src={maisonImage}
            alt="Atelier Maison Slimani - Savoir-faire ancestral"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 90vw"
            loading="lazy"
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
              <p className="text-2xl md:text-4xl font-serif text-white mb-6 md:mb-8 italic leading-relaxed drop-shadow-lg">
                "Chaque paire raconte l'histoire d'un savoir-faire ancestral"
              </p>
              <Link
                href="/maison"
                className="text-dore hover:text-dore/80 font-serif text-base md:text-lg flex items-center justify-center gap-2 transition-colors"
                onClick={() => hapticFeedback('light')}
              >
                Découvrir la Maison <span>{'>'}</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
