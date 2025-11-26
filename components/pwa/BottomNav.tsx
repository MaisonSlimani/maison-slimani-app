'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, ShoppingBag, ShoppingCart, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/hooks/useCart'

export default function BottomNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()

  const navItems = [
    { href: '/pwa', icon: Home, label: 'Accueil' },
    { href: '/pwa/boutique', icon: ShoppingBag, label: 'Boutique' },
    { href: '/pwa/panier', icon: ShoppingCart, label: 'Panier', badge: totalItems },
    { href: '/pwa/contact', icon: Mail, label: 'Contact' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom w-full max-w-full"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-16 w-full max-w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/pwa' && pathname?.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors relative',
                isActive
                  ? 'text-dore'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-dore rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

