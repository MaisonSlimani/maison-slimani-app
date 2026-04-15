'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, ShoppingBag, Mail, LayoutGrid } from 'lucide-react'
import { cn } from '@maison/shared'
import { useCart } from '@/lib/hooks/useCart'

const MenuBasNavigation = () => {
  const pathname = usePathname()
  const { items, isLoaded } = useCart()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => { if (isLoaded) setCartCount(items.length) }, [items, isLoaded])

  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem('cart')
      if (saved) { try { setCartCount(JSON.parse(saved).length) } catch { /* ignore */ } } 
      else setCartCount(0)
    }
    window.addEventListener('cartUpdated', sync)
    return () => window.removeEventListener('cartUpdated', sync)
  }, [])

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/boutique', icon: Package, label: 'Collections' },
    { href: '/boutique/tous', icon: LayoutGrid, label: 'Catalogue', isCenter: true },
    { href: '/panier', icon: ShoppingBag, label: 'Panier' },
    { href: '/contact', icon: Mail, label: 'Contact' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border/50 shadow-lg">
      <div className="absolute -bottom-5 left-0 right-0 h-6 bg-background/95 backdrop-blur-md" />
      <div className="container px-4 h-16 flex items-center justify-around relative">
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} cartCount={cartCount} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({ item, pathname, cartCount }: { item: { href: string; icon: React.ElementType; label: string; isCenter?: boolean }; pathname: string; cartCount: number }) {
  const isActive = item.href === '/boutique/tous' 
    ? pathname.startsWith('/boutique/tous')
    : item.href === '/boutique'
      ? pathname === '/boutique' || (pathname.startsWith('/boutique/') && !pathname.startsWith('/boutique/tous'))
      : pathname === item.href

  const Icon = item.icon
  const isPanier = item.href === '/panier'

  return (
    <Link href={item.href} className={cn('flex flex-col items-center justify-center transition-all', item.isCenter ? '-mt-6 z-10' : 'gap-1 px-3 py-2 min-w-[70px]', !item.isCenter && (isActive ? 'text-dore scale-105' : 'text-muted-foreground'))}>
      {item.isCenter ? (
        <div className={cn('w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all', isActive ? 'bg-dore text-charbon' : 'bg-muted text-muted-foreground')}>
          <Icon className="w-7 h-7" />
        </div>
      ) : (
        <>
          <div className="relative">
            <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
            {isPanier && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold bg-dore text-charbon">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">{item.label}</span>
        </>
      )}
    </Link>
  )
}

export default MenuBasNavigation
