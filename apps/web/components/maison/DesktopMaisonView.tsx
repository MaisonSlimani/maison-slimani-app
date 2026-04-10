'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const lookbookImage = '/assets/lookbook-atelier.jpg'

export default function DesktopMaisonView() {
  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-24"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h1 className="text-7xl font-serif text-charbon leading-tight">
              L'excellence du <span className="text-dore">Savoir-faire</span>
            </h1>
            <p className="text-2xl text-charbon/70 font-light leading-relaxed">
              Maison Slimani est le fruit d'une passion familiale pour l'art de la chaussure en cuir, née entre les remparts de Fès et l'énergie de Casablanca.
            </p>
          </div>
          <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
            <Image src={lookbookImage} alt="Atelier" fill className="object-cover" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-y border-charbon/5 py-20">
          <div className="space-y-4">
            <h3 className="text-2xl font-serif text-dore tracking-wider uppercase text-sm">Héritage</h3>
            <p className="text-lg text-charbon/80 leading-relaxed">
              Inspirés par la tradition fassie, nos modèles allient classicisme et modernité pour l'homme contemporain.
            </p>
          </div>
          <div className="space-y-4 border-x border-charbon/5 px-12">
            <h3 className="text-2xl font-serif text-dore tracking-wider uppercase text-sm">Matériaux</h3>
            <p className="text-lg text-charbon/80 leading-relaxed">
              Nous utilisons exclusivement des cuirs pleine fleur, sélectionnés pour leur grain unique et leur patine future.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-serif text-dore tracking-wider uppercase text-sm">Philosophie</h3>
            <p className="text-lg text-charbon/80 leading-relaxed">
              Chaque paire est confectionnée à la commande, dans une démarche de "slow fashion" respectueuse de l'artisanat.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
