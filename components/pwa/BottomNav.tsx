'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { Home, ShoppingBag, ShoppingCart, Menu, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/hooks/useCart'
import { motion } from 'framer-motion'
import { hapticFeedback } from '@/lib/haptics'

export default function BottomNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const iconRefs = useRef<(HTMLDivElement | null)[]>([])
  const [indicatorLeft, setIndicatorLeft] = useState<number | null>(null)

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/boutique', icon: ShoppingBag, label: 'Collections' },
    { href: '/boutique/tous', icon: LayoutGrid, label: 'Catalogue', isCenter: true },
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
    
    // Catalogue page - check for /boutique/tous
    if (href === '/boutique/tous') {
      return currentPath === '/boutique/tous' || currentPath.startsWith('/boutique/tous')
    }
    
    // Collections (/boutique) - match /boutique exactly or /boutique/[category] but NOT /boutique/tous
    if (href === '/boutique') {
      return currentPath === '/boutique' || 
             (currentPath.startsWith('/boutique/') && !currentPath.startsWith('/boutique/tous'))
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

  // Find active index for gold indicator (only for non-center buttons)
  const activeIndex = navItems.findIndex(item => 
    isRouteActive(item.href, pathname) && !item.isCenter
  )

  // Calculate indicator position based on actual icon positions
  useEffect(() => {
    if (activeIndex >= 0 && iconRefs.current[activeIndex]) {
      const iconElement = iconRefs.current[activeIndex]
      const navElement = iconElement?.closest('nav')
      if (iconElement && navElement) {
        const iconRect = iconElement.getBoundingClientRect()
        const navRect = navElement.getBoundingClientRect()
        const relativeLeft = iconRect.left - navRect.left
        const iconCenter = relativeLeft + iconRect.width / 2
        const percentage = (iconCenter / navRect.width) * 100
        setIndicatorLeft(percentage)
      }
    } else {
      setIndicatorLeft(null)
    }
  }, [activeIndex, pathname])

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom w-full max-w-full overflow-visible"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Extended background to cover any gaps below */}
      <div className="absolute -bottom-5 left-0 right-0 bg-card" style={{ height: '1.5rem' }} />
      {/* Gold Indicator Bar - Centered above active icon (not for center button) */}
      {activeIndex >= 0 && indicatorLeft !== null && (
        <motion.div
          className="absolute top-0 h-0.5 bg-dore"
          initial={false}
          animate={{
            left: `${indicatorLeft}%`,
            width: '40px',
            x: '-50%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            boxShadow: '0 0 10px hsl(39, 46%, 57%)',
          }}
        />
      )}

      <div className="flex items-center justify-around h-16 w-full max-w-full relative overflow-visible pt-1">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = isRouteActive(item.href, pathname)
          const isCenter = item.isCenter
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center transition-colors relative',
                isCenter 
                  ? 'flex-none -mt-7 z-10' 
                  : 'flex-1 h-full',
                !isCenter && (isActive
                  ? 'text-dore'
                  : 'text-muted-foreground hover:text-foreground')
              )}
              onClick={() => hapticFeedback('light')}
            >
              {isCenter ? (
                <div className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300',
                  isActive
                    ? 'bg-dore text-charbon'
                    : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="w-7 h-7" />
                </div>
              ) : (
                <>
                  <div 
                    ref={(el) => { iconRefs.current[index] = el }}
                    className="relative flex items-center justify-center"
                  >
                    {Icon && <Icon className="w-6 h-6" />}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-dore rounded-full">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
