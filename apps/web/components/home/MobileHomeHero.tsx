'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@maison/ui'
import { hapticFeedback } from '@/lib/haptics'

const heroImage = '/assets/hero-chaussures.jpg'

export function MobileHomeHero() {
  return (
    <section className="relative h-[75vh] flex items-center justify-center overflow-hidden">
      <Image src={heroImage} alt="Maison Slimani" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      <motion.div className="relative z-10 text-center px-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-5xl font-serif text-white mb-4 leading-tight">L'excellence du cuir <span className="text-dore">marocain</span></h1>
        <p className="text-lg text-white/90 mb-8 font-light">Artisanat d'exception fait main</p>
        <Button asChild size="lg" className="bg-dore text-charbon hover:bg-dore/90" onClick={() => hapticFeedback('medium')}>
          <Link href="/boutique">Découvrir</Link>
        </Button>
      </motion.div>
    </section>
  )
}
