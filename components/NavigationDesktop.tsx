'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'
import { useWishlistDrawer } from '@/lib/contexts/WishlistDrawerContext'

const NavigationDesktop = () => {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const { items, isLoaded } = useCart()
  const { items: wishlistItems, isLoaded: wishlistLoaded } = useWishlist()
  const { openDrawer: openCartDrawer } = useCartDrawer()
  const { openDrawer: openWishlistDrawer } = useWishlistDrawer()
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculer le nombre d'éléments différents dans le panier (pas la quantité totale)
  useEffect(() => {
    if (isLoaded) {
      setCartCount(items.length)
    }
  }, [items, isLoaded])

  // Calculer le nombre d'éléments dans la wishlist
  useEffect(() => {
    if (wishlistLoaded) {
      setWishlistCount(wishlistItems.length)
    }
  }, [wishlistItems, wishlistLoaded])

  // Écouter les changements du panier depuis localStorage (pour les mises à jour en temps réel)
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

    // Écouter l'événement personnalisé
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    // Écouter aussi les événements de storage (au cas où le panier est modifié depuis un autre onglet)
    window.addEventListener('storage', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('storage', handleCartUpdate)
    }
  }, [])

  // Écouter les changements de la wishlist
  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (typeof window !== 'undefined') {
        const savedWishlist = localStorage.getItem('wishlist')
        if (savedWishlist) {
          try {
            const wishlistItems = JSON.parse(savedWishlist)
            setWishlistCount(wishlistItems.length)
          } catch (error) {
            console.error('Erreur lors de la lecture de la wishlist:', error)
          }
        } else {
          setWishlistCount(0)
        }
      }
    }

    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    window.addEventListener('storage', handleWishlistUpdate)
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
      window.removeEventListener('storage', handleWishlistUpdate)
    }
  }, [])

  const menuItems = [
    { href: '/', label: 'Accueil' },
    { href: '/boutique', label: 'Boutique' },
    { href: '/maison', label: 'La Maison' },
    { href: '/contact', label: 'Contact' },
  ]

  // Sur la page d'accueil, on garde la nav transparente avec texte clair
  // Sur les autres pages, on utilise un fond solide avec meilleur contraste
  const isHomePage = pathname === '/'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 hidden md:block',
        isHomePage
          ? scrolled
            ? 'bg-background/98 backdrop-blur-md border-b shadow-sm'
            : 'bg-transparent'
          : 'bg-background/98 backdrop-blur-md border-b shadow-sm'
      )}
    >
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo à gauche */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src="/assets/logos/logo_nobg.png"
              alt="Maison Slimani"
              fill
              className="object-contain"
              sizes="40px"
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
          <h1 className={cn(
            "text-2xl font-serif tracking-tight transition-colors",
            isHomePage && !scrolled 
              ? "text-[#f8f5f0] drop-shadow-lg" 
              : "text-foreground"
          )}>
            Maison <span className={cn(
              "transition-colors",
              isHomePage
                ? "text-[#d4a574] drop-shadow-lg" // Reste doré sur la page d'accueil même après scroll
                : "text-[#d4a574] group-hover:text-[#c9975e]"
            )}>Slimani</span>
          </h1>
        </Link>

        {/* Menu centre */}
        <div className="flex items-center gap-8">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative text-sm font-medium transition-all duration-300 group px-2 py-1',
                  isHomePage && !scrolled
                    ? isActive
                      ? 'text-[#f8f5f0] drop-shadow-md'
                      : 'text-[#f8f5f0]/90 hover:text-[#f8f5f0] drop-shadow-md'
                    : isActive
                      ? 'text-charbon font-semibold'
                      : 'text-charbon/90 hover:text-charbon'
                )}
                onClick={() => {
                  // Click sound removed
                }}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#d4a574] transition-all duration-300" />
                )}
                {!isActive && (
                  <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#d4a574] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                )}
              </Link>
            )
          })}
        </div>

                {/* Panier et Wishlist à droite */}
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={openWishlistDrawer}
                    className={cn(
                      "transition-colors relative",
                      isHomePage && !scrolled && "text-[#f8f5f0] hover:text-[#d4a574] drop-shadow-md"
                    )}
                  >
                    <Heart className={cn(
                      "w-5 h-5",
                      wishlistCount > 0 && "fill-current"
                    )} />
                    {wishlistCount > 0 && (
                      <span className={cn(
                        "absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                        isHomePage && !scrolled
                          ? "bg-[#d4a574] text-[#f8f5f0]"
                          : "bg-dore text-charbon"
                      )}>
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </span>
                    )}
                    <span className="sr-only">Favoris</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={openCartDrawer}
                    className={cn(
                      "transition-colors relative",
                      isHomePage && !scrolled && "text-[#f8f5f0] hover:text-[#d4a574] drop-shadow-md"
                    )}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className={cn(
                        "absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                        isHomePage && !scrolled
                          ? "bg-[#d4a574] text-[#f8f5f0]"
                          : "bg-dore text-charbon"
                      )}>
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                    <span className="sr-only">Panier</span>
                  </Button>
                </div>
      </nav>
    </header>
  )
}

export default NavigationDesktop
