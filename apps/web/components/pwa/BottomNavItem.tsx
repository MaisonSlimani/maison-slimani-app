'use client'

import Link from 'next/link'
import { cn } from '@maison/shared'
import { hapticFeedback } from '@/lib/haptics'
import { LucideIcon } from 'lucide-react'

interface BottomNavItemProps {
  href: string
  icon: LucideIcon
  label: string
  isActive: boolean
  isCenter?: boolean
  badge?: number
  iconRef?: (el: HTMLDivElement | null) => void
}

export function BottomNavItem({ href, icon: Icon, label, isActive, isCenter, badge, iconRef }: BottomNavItemProps) {
  const content = isCenter ? (
    <div className={cn('w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all', isActive ? 'bg-dore text-charbon' : 'bg-muted text-muted-foreground')}>
      <Icon className="w-7 h-7" />
    </div>
  ) : (
    <>
      <div ref={iconRef} className="relative flex items-center justify-center">
        <Icon className="w-6 h-6" />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-dore rounded-full">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </>
  )

  return (
    <Link href={href} className={cn('flex flex-col items-center justify-center transition-colors relative', isCenter ? 'flex-none -mt-7 z-10' : 'flex-1 h-full', !isCenter && (isActive ? 'text-dore' : 'text-muted-foreground hover:text-foreground'))} onClick={() => hapticFeedback('light')}>
      {content}
    </Link>
  )
}
