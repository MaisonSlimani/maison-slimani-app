'use client'

import React from 'react'
import { Button } from '@maison/ui'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function DesktopMenuView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-charbon text-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <h1 className="text-6xl font-serif mb-8 text-dore">Maison Slimani</h1>
        <p className="text-xl text-white/70 mb-12 leading-relaxed">
          Le menu de navigation est accessible directement depuis l'en-tête de notre boutique exclusive.
        </p>
        <Button asChild size="lg" className="bg-dore text-charbon hover:bg-dore/90 px-10 h-16 text-lg">
          <Link href="/boutique">
            <ArrowLeft className="mr-3 w-5 h-5" /> Retour à la boutique
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
