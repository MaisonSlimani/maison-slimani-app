'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function PWACommandePage() {
  const params = useParams()
  const commandeId = params.id as string

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="w-full min-h-screen pb-20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center bg-gradient-to-br from-ecru via-green-50/30 to-ecru border-2 border-dore/20">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-6"
          >
            <div className="relative inline-block">
              <CheckCircle className="w-20 h-20 mx-auto text-green-600" />
              <div className="absolute inset-0 animate-ping">
                <CheckCircle className="w-20 h-20 mx-auto text-green-400 opacity-30" />
              </div>
            </div>
          </motion.div>

          <h1 className="text-2xl font-serif text-foreground mb-3">
            Commande confirmée !
          </h1>
          <p className="text-muted-foreground mb-2">
            Votre commande #{commandeId?.substring(0, 8) || 'N/A'} a été enregistrée avec succès.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Vous recevrez un email de confirmation sous peu.
          </p>

          <div className="space-y-3">
            <Button
              asChild
              size="lg"
              className="w-full bg-dore text-charbon hover:bg-dore/90"
            >
              <Link href="/pwa">Retour à l'accueil</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Link href="/pwa/boutique">Continuer les achats</Link>
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

