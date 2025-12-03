'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, ShoppingBag, ShoppingCart, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/hooks/useCart'
import { motion } from 'framer-motion'
import { hapticFeedback } from '@/lib/haptics'

export default function BottomNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/boutique', icon: ShoppingBag, label: 'Boutique' },
    { href: '/panier', icon: ShoppingCart, label: 'Panier', badge: totalItems },
    { href: '/menu', icon: Menu, label: 'Menu' },
  ]

  // Helper to check if a route is active
  const isRouteActive = (href: string, currentPath: string | null) => {
    if (!currentPath) return false
    
    // Home page - exact match only
    if (href === '/') {
      return currentPath === '/' || currentPath === ''
    }
    
    // Menu page - also active for contact, faq, and politiques
    if (href === '/menu') {
      return currentPath === '/menu' || 
             currentPath === '/contact' || 
             currentPath === '/faq' || 
             currentPath === '/politiques'
    }
    
    // Other routes - check if pathname starts with href
    return currentPath.startsWith(href)
  }

  // Find active index for gold indicator
  const activeIndex = navItems.findIndex(item => isRouteActive(item.href, pathname))

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom w-full max-w-full"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Gold Indicator Bar - Centered above active icon */}
      {activeIndex >= 0 && (
        <motion.div
          className="absolute top-0 h-0.5 bg-dore"
          initial={false}
          animate={{
            left: `${(activeIndex + 0.5) * (100 / navItems.length)}%`,
            width: '40px',
            x: '-50%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            boxShadow: '0 0 10px hsl(39, 46%, 57%)',
          }}
        />
      )}

      <div className="flex items-center justify-around h-16 w-full max-w-full">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = isRouteActive(item.href, pathname)
          
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
              onClick={() => hapticFeedback('light')}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge !== undefined && item.badge > 0 && (
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
