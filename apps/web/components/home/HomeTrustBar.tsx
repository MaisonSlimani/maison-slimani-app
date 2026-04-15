'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Truck, RefreshCcw, Award } from 'lucide-react'

/**
 * Unified Trust Bar — matches the original dark, premium aesthetic.
 * Desktop only (mobile uses the compact black ribbon in HomeClient).
 */
export function HomeTrustBar() {
  return (
    <section className="bg-charbon text-dore py-10">
      <div className="container px-6 mx-auto">
        <div className="flex items-center justify-center gap-16 flex-wrap text-center">
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Truck className="w-8 h-8" />
            <span className="font-serif text-lg">Livraison gratuite</span>
            <span className="text-ecru/70 text-sm">Dans tout le Maroc</span>
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <RefreshCcw className="w-8 h-8" />
            <span className="font-serif text-lg">Retours sous 7 jours</span>
            <span className="text-ecru/70 text-sm">Satisfait ou remboursé</span>
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Award className="w-8 h-8" />
            <span className="font-serif text-lg">Artisanat d'exception</span>
            <span className="text-ecru/70 text-sm">Fait main au Maroc</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
