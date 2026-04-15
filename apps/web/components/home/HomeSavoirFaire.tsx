'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@maison/ui'

const lookbookImage = '/assets/lookbook-1.jpg'

/**
 * Unified Savoir-Faire Section
 * Restored the full rich copy from the original design with responsive layout.
 */
export function HomeSavoirFaire() {
  return (
    <section className="py-16 md:py-24 px-6 bg-ecru">
      <motion.div
        className="container max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-5xl font-serif mb-6 text-charbon">
              Un savoir-faire ancestral
            </h2>
            <p className="text-charbon/80 text-base md:text-lg mb-6 leading-relaxed">
              Maison Slimani perpétue l'excellence de l'artisanat marocain.
              Chaque paire est confectionnée à la main par nos maîtres artisans,
              dans le respect des traditions séculaires du travail du cuir.
            </p>
            <p className="text-charbon/70 text-sm md:text-base mb-8 leading-relaxed italic">
              Du choix des peaux les plus nobles à la finition minutieuse,
              chaque étape incarne notre passion pour l'excellence et notre attachement
              au patrimoine marocain.
            </p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-cuir text-cuir hover:bg-cuir hover:text-ecru"
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
  )
}
