'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@maison/ui'

const heroImage = '/assets/hero-chaussures.jpg'

export function HomeHero() {
  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      <Image src={heroImage} alt="Maison Slimani" fill className="object-cover" priority sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40 z-[1]" />
      
      <motion.div className="relative z-10 text-center container px-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-7xl font-serif text-[#f8f5f0] mb-6 drop-shadow-lg">
          L'excellence du cuir <span className="text-dore drop-shadow-[0_0_15px_rgba(212,165,116,0.6)]">marocain</span>
        </h1>
        <p className="text-2xl text-[#f8f5f0]/90 mb-10 max-w-2xl mx-auto leading-relaxed">Artisanat d'exception fait avec passion</p>
        <Button asChild size="lg" className="bg-dore text-charbon hover:bg-dore/90 px-10 h-16 text-lg">
          <Link href="/boutique">Découvrir la collection</Link>
        </Button>
      </motion.div>
    </section>
  )
}
