'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { hapticFeedback } from '@/lib/haptics'
import { ArrowRight } from 'lucide-react'

/**
 * Unified Contact Section.
 * Uses the original elegant gradient transition (ecru → charbon).
 */
export function HomeContact({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <section className="py-16 md:py-32 pb-24 md:pb-32 px-4 md:px-6 bg-gradient-to-b from-ecru via-ecru/95 to-charbon relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/assets/pattern-gold.svg')] opacity-5" />
      <div className="relative container max-w-5xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8 md:mb-10">
            <h2 className="text-4xl md:text-6xl font-serif text-charbon mb-4 md:mb-6">
              Contactez-nous
            </h2>
            <div className="w-24 md:w-32 h-1 bg-gradient-to-r from-transparent via-dore to-transparent mx-auto mb-6 md:mb-8" />
            <p className="text-lg md:text-2xl text-charbon/80 max-w-3xl mx-auto leading-relaxed">
              Une question ? Un conseil personnalisé ? Notre équipe est à votre écoute.
            </p>
          </div>

          <motion.a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => hapticFeedback('medium')}
            className="inline-flex items-center gap-3 px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-dore via-dore/95 to-dore text-charbon font-serif text-lg md:text-2xl rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-dore/20 hover:border-dore/40"
          >
            <WhatsAppIcon className="w-5 h-5 md:w-6 md:h-6 text-charbon" />
            <span>Nous contacter</span>
            <ArrowRight className="w-5 h-5 text-charbon" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
