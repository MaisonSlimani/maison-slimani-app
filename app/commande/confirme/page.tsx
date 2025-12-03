'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function CommandeConfirmePage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <NavigationDesktop />
      <EnteteMobile />

      {/* Section de confirmation élégante */}
      <section className="py-20 md:py-32 px-6 bg-gradient-to-b from-ecru via-ecru/95 to-background">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Icône de succès avec animation douce */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: 0.2, 
                type: 'spring', 
                stiffness: 200, 
                damping: 15,
                duration: 0.6
              }}
              className="mb-8"
            >
              <div className="relative inline-block">
                <CheckCircle className="w-20 h-20 md:w-24 md:h-24 mx-auto text-green-600" />
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  transition={{ 
                    delay: 0.4,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  <CheckCircle className="w-20 h-20 md:w-24 md:h-24 mx-auto text-green-400/40" />
                </motion.div>
              </div>
            </motion.div>

            {/* Titre principal avec animation élégante */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.4, 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1] 
              }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-6 text-charbon leading-tight">
                Merci pour votre
                <span className="block text-dore mt-2">achat</span>
              </h1>
            </motion.div>

            {/* Message de confirmation */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.6, 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="text-lg md:text-xl text-charbon/80 mb-6 max-w-2xl mx-auto leading-relaxed"
            >
              Votre commande a été confirmée avec succès.
            </motion.p>

            {/* Message de contact */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.8, 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="text-base md:text-lg text-charbon/70 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Nous vous contacterons dans les plus brefs délais pour finaliser les détails de livraison.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Action Buttons Section */}
      <section className="py-8 px-6 bg-gradient-to-b from-background to-ecru/30">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 1.0, 
              duration: 0.8, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full sm:w-auto"
            >
              <Button 
                asChild 
                variant="outline" 
                className="w-full sm:w-[200px] text-base md:text-lg py-6 px-8 border-charbon/20 hover:border-charbon/40 transition-all duration-300"
              >
                <Link href="/boutique">Continuer mes achats</Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full sm:w-auto"
            >
              <Button 
                asChild 
                className="w-full sm:w-[200px] text-base md:text-lg py-6 px-8 bg-dore text-charbon hover:bg-dore/90 transition-all duration-300"
              >
                <Link href="/">Retour à l'accueil</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}

