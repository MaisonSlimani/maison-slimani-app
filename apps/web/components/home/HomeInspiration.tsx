'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const lifestyleImage1 = '/assets/lookbook-lifestyle-1.jpg'
const lifestyleImage2 = '/assets/lookbook-lifestyle-2.jpg'
const lifestyleImage3 = '/assets/lookbook-atelier.jpg'

const inspirationItems = [
  { src: lifestyleImage1, alt: 'Style urbain élégant' },
  { src: lifestyleImage2, alt: 'Élégance intemporelle' },
  { src: lifestyleImage3, alt: 'Artisanat traditionnel' },
]

/**
 * Horizontal-swipe Inspiration Gallery.
 * Shows lifestyle/lookbook images in a snap-scroll carousel on mobile,
 * and a wider grid on desktop.
 */
export function HomeInspiration() {
  return (
    <section className="py-8 md:py-16 px-4 bg-ecru overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-serif text-charbon mb-8 md:mb-12 text-center">
          Inspiration
        </h2>
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {inspirationItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative w-[85vw] md:w-auto h-[60vh] md:h-[50vh] flex-shrink-0 md:flex-shrink snap-center rounded-lg overflow-hidden shadow-xl"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 85vw, 33vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charbon/70 via-transparent to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
