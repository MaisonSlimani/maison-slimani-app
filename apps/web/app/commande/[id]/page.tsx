'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@maison/ui'
import { Card } from '@maison/ui'
import { CheckCircle } from 'lucide-react'

export default function CommandePage() {
  const params = useParams()
  const commandeId = params.id as string

  return (
    <div className="min-h-screen bg-gradient-to-b from-ecru to-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-12 md:p-20 text-center border-2 border-dore/20 shadow-2xl relative overflow-hidden bg-white/50 backdrop-blur-sm">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-dore rounded-full" />
            <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-dore rounded-full" />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-8"
            >
              <CheckCircle className="w-24 h-24 mx-auto text-green-600 drop-shadow-lg" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-serif mb-6 text-charbon leading-tight">
              Commande <span className="text-dore">Confirmée</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-4">
              Votre commande <span className="font-mono font-bold text-charbon">#{commandeId?.substring(0, 8).toUpperCase()}</span> est en cours de traitement.
            </p>

            <p className="text-lg text-charbon/70 mb-12 max-w-md mx-auto leading-relaxed">
              Nous vous contacterons par téléphone dans les plus brefs délais pour finaliser les détails de livraison.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild variant="outline" className="h-14 px-8 text-lg rounded-2xl border-charbon/10 bg-white">
                <Link href="/boutique">Continuer mes achats</Link>
              </Button>
              <Button asChild className="h-14 px-8 text-lg rounded-2xl bg-dore text-charbon hover:bg-dore/90">
                <Link href="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
