'use client'

import { cn } from '@/lib/utils'

interface GoldSkeletonProps {
  className?: string
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button'
}

/**
 * Elegant gold shimmer skeleton loader
 * Used throughout the app for luxury loading states
 */
export default function GoldSkeleton({ 
  className, 
  variant = 'default' 
}: GoldSkeletonProps) {
  const baseClasses = 'animate-gold-shimmer rounded'
  
  const variantClasses = {
    default: 'h-4 w-full',
    card: 'aspect-square w-full',
    text: 'h-3 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-9 w-24',
  }

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} />
  )
}

/**
 * Product card skeleton for loading states
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full border border-border/50 rounded-lg overflow-hidden bg-card">
      <GoldSkeleton variant="card" className="rounded-none" />
      <div className="p-3 space-y-2">
        <GoldSkeleton variant="text" className="w-full" />
        <GoldSkeleton variant="text" className="w-1/2" />
        <div className="pt-2 flex gap-2">
          <GoldSkeleton variant="button" className="flex-1" />
          <GoldSkeleton variant="button" className="w-9" />
        </div>
      </div>
    </div>
  )
}

/**
 * Category card skeleton
 */
export function CategoryCardSkeleton() {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden">
      <GoldSkeleton variant="card" className="rounded-none" />
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
        <GoldSkeleton variant="text" className="w-2/3 h-4" />
      </div>
    </div>
  )
}

/**
 * Hero skeleton
 */
export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] flex items-center justify-center">
      <GoldSkeleton className="absolute inset-0 rounded-none" />
      <div className="relative z-10 w-full text-center px-6 space-y-4">
        <GoldSkeleton className="h-8 w-3/4 mx-auto" />
        <GoldSkeleton className="h-4 w-1/2 mx-auto" />
        <GoldSkeleton variant="button" className="mx-auto mt-6 w-32" />
      </div>
    </div>
  )
}

export { GoldSkeleton }

