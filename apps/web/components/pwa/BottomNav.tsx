'use client'

import { motion } from 'framer-motion'
import { useBottomNav } from '@/hooks/useBottomNav'
import { BottomNavItem } from './BottomNavItem'

export default function BottomNav() {
  const { pathname, navItems, activeIndex, indicatorLeft, iconRefs, isRouteActive } = useBottomNav()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom w-full max-w-full overflow-visible" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="absolute -bottom-5 left-0 right-0 bg-card" style={{ height: '1.5rem' }} />
      {activeIndex >= 0 && indicatorLeft !== null && (
        <motion.div className="absolute top-0 h-0.5 bg-dore" initial={false} animate={{ left: `${indicatorLeft}%`, width: '40px', x: '-50%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} style={{ boxShadow: '0 0 10px hsl(39, 46%, 57%)' }} />
      )}

      <div className="flex items-center justify-around h-16 w-full max-w-full relative overflow-visible pt-1">
        {navItems.map((item, index) => (
          <BottomNavItem key={item.href} href={item.href} icon={item.icon} label={item.label} isActive={isRouteActive(item.href, pathname)} isCenter={item.isCenter} badge={item.badge} iconRef={(el) => { iconRefs.current[index] = el }} />
        ))}
      </div>
    </nav>
  )
}
