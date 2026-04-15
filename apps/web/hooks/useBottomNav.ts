'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useCart } from '@/lib/hooks/useCart'
import { Home, ShoppingBag, ShoppingCart, Menu, LayoutGrid } from 'lucide-react'
import { BottomNavState, BottomNavItem } from '@/types/views'

export function useBottomNav(): BottomNavState {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const iconRefs = useRef<(HTMLDivElement | null)[]>([])
  const [indicatorLeft, setIndicatorLeft] = useState<number | null>(null)

  const navItems: BottomNavItem[] = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/boutique', icon: ShoppingBag, label: 'Collections' },
    { href: '/boutique/tous', icon: LayoutGrid, label: 'Catalogue', isCenter: true },
    { href: '/panier', icon: ShoppingCart, label: 'Panier', badge: totalItems },
    { href: '/menu', icon: Menu, label: 'Menu' },
  ]

  const isRouteActive = (href: string, currentPath: string | null) => {
    if (!currentPath) return false
    if (href === '/') return currentPath === '/' || currentPath === ''
    if (href === '/boutique/tous') return currentPath === '/boutique/tous' || currentPath.startsWith('/boutique/tous')
    if (href === '/boutique') return currentPath === '/boutique' || (currentPath.startsWith('/boutique/') && !currentPath.startsWith('/boutique/tous'))
    if (href === '/menu') return ['/menu', '/contact', '/faq', '/politiques'].includes(currentPath)
    return currentPath.startsWith(href)
  }

  const activeIndex = navItems.findIndex(item => isRouteActive(item.href, pathname) && !item.isCenter)

  useEffect(() => {
    if (activeIndex >= 0 && iconRefs.current[activeIndex]) {
      const el = iconRefs.current[activeIndex]
      const nav = el?.closest('nav')
      if (el && nav) {
        const center = (el.getBoundingClientRect().left - nav.getBoundingClientRect().left) + el.getBoundingClientRect().width / 2
        setIndicatorLeft((center / nav.getBoundingClientRect().width) * 100)
      }
    } else { setIndicatorLeft(null) }
  }, [activeIndex, pathname])

  return { pathname, navItems, activeIndex, indicatorLeft, iconRefs, isRouteActive }
}
