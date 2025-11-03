'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, ShoppingBag, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const MenuBasNavigation = () => {
  const pathname = usePathname()
  // La barre reste toujours visible pour un accès rapide
  // C'est une pratique courante sur mobile de cacher la barre lors du scroll vers le bas
  // pour économiser de l'espace écran, mais pour un e-commerce, il vaut mieux la garder
  // visible pour un accès rapide au panier et à la navigation

  const items = [
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
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all duration-200 min-w-[70px]',
                isActive
                  ? 'text-dore scale-105'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              )}
              onClick={() => {
                if ((window as any).playClickSound) {
                  (window as any).playClickSound()
                }
              }}
            >
              <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MenuBasNavigation

