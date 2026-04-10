'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@maison/ui'
import { CheckCircle, ArrowRight, Truck, ShieldCheck } from 'lucide-react'

export default function DesktopOrderSuccessView() {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="relative inline-block">
          <CheckCircle className="w-24 h-24 mx-auto text-green-600" />
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle className="w-24 h-24 text-green-400/40" />
          </motion.div>
        </div>

        <div className="space-y-6">
          <h1 className="text-6xl font-serif text-charbon leading-tight">
            Merci pour votre <span className="text-dore">confiance</span>
          </h1>
          <p className="text-2xl text-charbon/70 max-w-2xl mx-auto leading-relaxed">
            Votre commande a été enregistrée avec succès. Notre équipe prépare déjà votre colis avec le plus grand soin.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 py-12 border-y border-charbon/5">
          <div className="flex flex-col items-center gap-3">
            <Truck className="w-8 h-8 text-dore" />
            <h4 className="font-bold uppercase tracking-widest text-xs">Expédition Rapide</h4>
            <p className="text-xs text-muted-foreground">Sous 24/48h partout au Maroc</p>
          </div>
          <div className="flex flex-col items-center gap-3 border-x border-charbon/5 px-8">
            <ShieldCheck className="w-8 h-8 text-dore" />
            <h4 className="font-bold uppercase tracking-widest text-xs">Paiement Sécurisé</h4>
            <p className="text-xs text-muted-foreground">Paiement à la livraison par cash</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-8 h-8 text-dore" />
            <h4 className="font-bold uppercase tracking-widest text-xs">Artisanat de Fès</h4>
            <p className="text-xs text-muted-foreground">100% Cuir Véritable</p>
          </div>
        </div>

        <div className="flex gap-6 justify-center pt-8">
          <Button asChild size="lg" variant="outline" className="h-20 px-12 text-xl rounded-3xl border-2">
            <Link href="/boutique">Boutique</Link>
          </Button>
          <Button asChild size="lg" className="h-20 px-12 text-xl rounded-2xl bg-dore text-charbon hover:bg-dore/90">
            <Link href="/">Accueil <ArrowRight className="ml-3" /></Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
