'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const steps = [
  { image: '/assets/etape1.jpg', title: 'Sélection', desc: 'Cuir premium sélectionné' },
  { image: '/assets/etape2.jpg', title: 'Découpe', desc: 'Précision artisanale' },
  { image: '/assets/etape3.jpg', title: 'Assemblage', desc: 'Techniques traditionnelles' },
  { image: '/assets/etape4.jpg', title: 'Finitions', desc: 'Détails méticuleux' },
  { image: '/assets/etape5.jpg', title: 'Excellence', desc: 'Qualité garantie' },
]

/**
 * Craftsmanship Process Section
 * Mobile: Vertical stack (one step per row, large centered images)
 * Desktop: Horizontal 5-column grid with hover effects and numbered badges
 */
export function HomeProcess() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 bg-ecru">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-serif text-charbon mb-4">
            Du cuir brut à l'excellence
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground uppercase tracking-[0.2em]">
            NOTRE PROCESSUS DE FABRICATION
          </p>
        </motion.div>

        <MobileProcessView />
        <DesktopProcessView />
      </div>
    </section>
  )
}

function MobileProcessView() {
  return (
    <div className="md:hidden grid grid-cols-1 gap-6">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.6 }}
          className="text-center"
        >
          <div className="relative w-48 h-48 mx-auto mb-6 rounded-lg overflow-hidden shadow-lg border-2 border-dore/20">
            <Image
              src={step.image}
              alt={step.title}
              fill
              className="object-cover"
              sizes="192px"
              loading="lazy"
            />
          </div>
          <h3 className="font-serif font-semibold text-charbon mb-2 text-lg">
            {step.title}
          </h3>
          <p className="text-base text-muted-foreground">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}

function DesktopProcessView() {
  return (
    <div className="hidden md:grid grid-cols-5 gap-8 lg:gap-12">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: index * 0.15, duration: 0.6 }}
          className="text-center group"
        >
          <div className="relative w-48 h-48 lg:w-56 lg:h-56 mx-auto mb-6 rounded-lg overflow-hidden shadow-xl border-2 border-dore/20 group-hover:border-dore/50 transition-all duration-300">
            <Image
              src={step.image}
              alt={step.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="224px"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 bg-dore text-charbon rounded-full w-8 h-8 flex items-center justify-center font-serif font-bold text-sm">
              {index + 1}
            </div>
          </div>
          <h3 className="font-serif font-semibold text-charbon mb-3 text-2xl lg:text-3xl">
            {step.title}
          </h3>
          <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
            {step.desc}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

