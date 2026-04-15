'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@maison/ui'
import { Card } from '@maison/ui'
import { Home } from 'lucide-react'

/**
 * Unified 404 Page
 * 
 * Leverages the global NavigationWrapper for consistent header/footer.
 */
export default function NotFound() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
      <div className="container max-w-2xl mx-auto">
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
          <Card className="p-12 md:p-20 text-center bg-white/50 backdrop-blur-sm border-charbon/5 rounded-[2.5rem] shadow-xl">
            <h1 className="text-8xl font-serif mb-6 text-charbon/10 italic">404</h1>
            <h2 className="text-3xl font-serif mb-4 text-charbon">Page introuvable</h2>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              Désolé, la page que vous recherchez semble s'être égarée dans nos ateliers.
            </p>
            <Button asChild size="lg" className="bg-dore text-charbon hover:bg-dore/90 rounded-2xl h-16 px-10">
              <Link href="/">
                <Home className="w-5 h-5 mr-3" />
                Retour à l'accueil
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

