'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/hooks/useCart'

const EnteteMobile = () => {
  const { items, isLoaded } = useCart()
  const [cartCount, setCartCount] = useState(0)

  // Calculer le nombre total d'articles dans le panier
  useEffect(() => {
    if (isLoaded) {
      const total = items.reduce((acc, item) => acc + item.quantite, 0)
      setCartCount(total)
    }
  }, [items, isLoaded])

  // Écouter les changements du panier
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isLoaded) {
        const total = items.reduce((acc, item) => acc + item.quantite, 0)
        setCartCount(total)
      }
    }
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [items, isLoaded])

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b md:hidden">
      <div className="container px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src="/assets/logos/logo_nobg.png"
              alt="Maison Slimani"
              fill
              className="object-contain"
              sizes="32px"
              priority
              unoptimized
              onError={(e) => {
                // Fallback silencieux si le logo n'existe pas encore
                const target = e.target as HTMLImageElement
                if (target.parentElement) {
                  target.parentElement.style.display = 'none'
                }
              }}
            />
          </div>
          <h1 className="text-2xl font-serif tracking-tight">
            Maison <span className="text-primary">Slimani</span>
          </h1>
        </Link>

        <Button variant="ghost" size="icon" asChild className="relative">
          <Link href="/panier">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-dore text-charbon">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
            <span className="sr-only">Panier</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}

export default EnteteMobile
