'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import NavigationDesktop from '@/components/NavigationDesktop'
import EnteteMobile from '@/components/EnteteMobile'
import Footer from '@/components/Footer'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import { Home } from 'lucide-react'

export default function NotFound() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen pb-24">
      <NavigationDesktop />
      <EnteteMobile />

      <div className="container px-6 py-12 mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 text-center">
            <h1 className="text-6xl font-serif mb-4">404</h1>
            <h2 className="text-2xl font-serif mb-4">Page introuvable</h2>
            <p className="text-muted-foreground mb-8">
              La page que vous recherchez n'existe pas ou a été déplacée.
            </p>
            <Button asChild size="lg">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
          </Card>
        </motion.div>
      </div>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}

