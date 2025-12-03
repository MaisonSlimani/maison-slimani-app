'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Package, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/pwa', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/pwa/commandes', icon: ShoppingBag, label: 'Commandes' },
    { href: '/pwa/produits', icon: Package, label: 'Produits' },
    { href: '/pwa/settings', icon: Settings, label: 'Paramètres' },
  ]

  // Don't show on login page
  if (pathname === '/login') return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/pwa' && pathname?.startsWith(item.href)) ||
            (item.href === '/pwa' && pathname === '/pwa')
          
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
              <Icon className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

