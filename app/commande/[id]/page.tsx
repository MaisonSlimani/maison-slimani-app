'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { useIsPWA } from '@/lib/hooks/useIsPWA'
import PWACommandeContent from './PWACommandeContent'

export default function CommandePage() {
  const { isPWA, isLoading } = useIsPWA()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Render PWA version
  if (!isLoading && isPWA) {
    return <PWACommandeContent />
  }

  // Render desktop version
  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20 min-h-screen bg-gradient-to-b from-ecru to-background flex items-center justify-center">

      <div className="container px-6 py-8 mx-auto max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center min-h-[60vh]"
        >
          <Card className="p-16 md:p-20 text-center bg-gradient-to-br from-ecru via-green-50/30 to-ecru border-2 border-dore/20 shadow-2xl relative w-full">
            {/* Décoration de fond élégante */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-32 h-32 border-2 border-dore rounded-full" />
              <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-dore rounded-full" />
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  <CheckCircle className="w-24 h-24 md:w-28 md:h-28 mx-auto text-green-600 drop-shadow-lg" />
                  <div className="absolute inset-0 animate-ping">
                    <CheckCircle className="w-24 h-24 md:w-28 md:h-28 mx-auto text-green-400 opacity-30" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif mb-6 text-charbon leading-tight">
                  Merci pour votre
                  <span className="block text-dore mt-2">achat</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed"
              >
                Votre commande a été confirmée avec succès.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-lg md:text-xl text-charbon mb-12 max-w-xl mx-auto leading-relaxed font-medium"
              >
                Nous vous contacterons dans les plus brefs délais pour finaliser les détails de livraison.
              </motion.p>

              {/* Boutons d'action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
              >
                <Button asChild variant="outline" className="text-lg py-6 px-8">
                  <Link href="/boutique">Continuer mes achats</Link>
                </Button>
                <Button asChild className="text-lg py-6 px-8 bg-dore text-charbon hover:bg-dore/90">
                  <Link href="/">Retour à l'accueil</Link>
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

