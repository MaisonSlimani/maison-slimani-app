'use client'

import { cn } from '@/lib/utils'
import { Sparkles, Star, Crown } from 'lucide-react'

interface GoldDividerProps {
  variant?: 'full' | 'centered' | 'short'
  withIcon?: 'sparkles' | 'star' | 'crown' | 'dot' | 'diamond' | null
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
}

export default function GoldDivider({
  variant = 'centered',
  withIcon = null,
  className,
  spacing = 'md',
}: GoldDividerProps) {
  const spacingClasses = {
    sm: 'my-6',
    md: 'my-10',
    lg: 'my-16',
  }

  const widthClasses = {
    full: 'w-full',
    centered: 'w-2/5 mx-auto',
    short: 'w-24 mx-auto',
  }

  const IconComponent = {
    sparkles: Sparkles,
    star: Star,
    crown: Crown,
    dot: null,
    diamond: null,
  }[withIcon || 'dot']

  if (withIcon) {
    return (
      <div className={cn('flex items-center justify-center gap-4', spacingClasses[spacing], className)}>
        <div className={cn(
          'h-px bg-gradient-to-r from-transparent via-dore/60 to-transparent flex-1 max-w-32'
        )} />
        
        {withIcon === 'dot' ? (
          <span className="text-dore text-lg">•</span>
        ) : withIcon === 'diamond' ? (
          <span className="text-dore text-sm">◆</span>
        ) : IconComponent ? (
          <IconComponent className="w-4 h-4 text-dore" />
        ) : null}
        
        <div className={cn(
          'h-px bg-gradient-to-r from-transparent via-dore/60 to-transparent flex-1 max-w-32'
        )} />
      </div>
    )
  }

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      <div
        className={cn(
          'h-px bg-gradient-to-r from-transparent via-dore/50 to-transparent',
          widthClasses[variant]
        )}
      />
    </div>
  )
}

