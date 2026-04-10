'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const lookbookImage = '/assets/lookbook-atelier.jpg'

export default function MobileMaisonView() {
  return (
    <div className="w-full min-h-screen pb-20 bg-ecru">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-charbon/5 px-4 py-3 flex items-center gap-3">
        <h1 className="text-2xl font-serif">La Maison</h1>
      </div>

      <div className="px-4 py-8 space-y-12">
        <header>
          <h2 className="text-4xl font-serif mb-4 leading-tight">Notre Histoire</h2>
          <p className="text-lg text-charbon/70 font-light italic">"L'art de la chaussure, un héritage de Fès à Casablanca."</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <Image src={lookbookImage} alt="Atelier Slimani" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charbon/80 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="text-sm font-light uppercase tracking-widest text-dore mb-2 font-bold">L'Excellence</p>
            <p className="text-xl font-serif leading-tight">Chaque paire est une pièce unique façonnée à la main.</p>
          </div>
        </motion.div>

        <div className="space-y-10">
          <section className="space-y-4">
            <h3 className="text-2xl font-serif border-l-4 border-dore pl-4">Héritage Artisanal</h3>
            <p className="text-charbon/80 leading-relaxed">
              Depuis des décennies, notre famille cultive l'amour du beau soulier. Originaires de Fès, nous avons importé à Casablanca l'exigence du cuir parfait.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-2xl font-serif border-l-4 border-dore pl-4">Matériaux d'exception</h3>
            <p className="text-charbon/80 leading-relaxed">
              Nous sélectionnons uniquement des cuirs de premier choix, tannés de manière végétale pour assurer souplesse, longévité et respect de la peau.
            </p>
          </section>

          <section className="space-y-4 border-t border-charbon/5 pt-10">
            <p className="text-center font-serif text-charbon/40 text-sm tracking-[0.3em] uppercase">Maison Slimani • Fondée avec Passion</p>
          </section>
        </div>
      </div>
    </div>
  )
}
