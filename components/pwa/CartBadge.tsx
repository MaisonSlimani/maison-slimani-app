'use client'

import { useCart } from '@/lib/hooks/useCart'
import { cn } from '@/lib/utils'

interface CartBadgeProps {
  className?: string
}

export default function CartBadge({ className }: CartBadgeProps) {
  const { totalItems } = useCart()

  if (totalItems === 0) return null

  return (
    <span
      className={cn(
        'flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-dore rounded-full',
        className
      )}
    >
      {totalItems > 99 ? '99+' : totalItems}
    </span>
  )
}

