'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, ShoppingBag, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/hooks/useCart'

const MenuBasNavigation = () => {
  const pathname = usePathname()
  const { items, isLoaded } = useCart()
  const [cartCount, setCartCount] = useState(0)

  // Calculer le nombre d'éléments différents dans le panier (pas la quantité totale)
  useEffect(() => {
    if (isLoaded) {
      setCartCount(items.length)
    }
  }, [items, isLoaded])

  // Écouter les changements du panier depuis localStorage
  useEffect(() => {
    const handleCartUpdate = () => {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          try {
            const cartItems = JSON.parse(savedCart)
            // Compter le nombre d'éléments différents, pas la quantité totale
            setCartCount(cartItems.length)
          } catch (error) {
            console.error('Erreur lors de la lecture du panier:', error)
          }
        } else {
          setCartCount(0)
        }
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/boutique', icon: Package, label: 'Boutique' },
    { href: '/panier', icon: ShoppingBag, label: 'Panier' },
    { href: '/contact', icon: Mail, label: 'Contact' },
  ]

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-background/95 backdrop-blur-md border-t border-border/50 shadow-lg"
      )}
    >
      <div className="container px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const isPanier = item.href === '/panier'

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all duration-200 min-w-[70px] relative',
                isActive
                  ? 'text-dore scale-105'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              )}
              onClick={() => {
                // Click sound removed
              }}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                {isPanier && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold bg-dore text-charbon">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MenuBasNavigation

