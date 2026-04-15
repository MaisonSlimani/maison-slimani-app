'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@maison/ui'
import { CheckCircle, Home, ShoppingBag, Truck } from 'lucide-react'

export default function MobileOrderSuccessView() {
  return (
    <div className="w-full min-h-screen bg-ecru/30 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-serif text-charbon leading-tight">Merci pour votre commande !</h1>
        <p className="text-charbon/70 leading-relaxed">
          Votre commande a été confirmée. Nous vous contacterons très bientôt par téléphone pour la livraison.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 w-full space-y-3"
      >
        <Button asChild className="w-full h-14 bg-dore text-charbon text-lg rounded-2xl">
          <Link href="/boutique"><ShoppingBag className="mr-2" /> Continuer mes achats</Link>
        </Button>
        <Button asChild variant="outline" className="w-full h-14 border-charbon/10 text-lg rounded-2xl bg-white">
          <Link href="/"><Home className="mr-2" /> Retour à l'accueil</Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 flex items-center gap-3 text-muted-foreground text-sm"
      >
        <Truck className="w-5 h-5" />
        <span>Livraison express à domicile</span>
      </motion.div>
    </div>
  )
}
