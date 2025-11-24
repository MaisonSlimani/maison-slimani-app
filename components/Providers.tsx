'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { CartDrawerProvider } from '@/lib/contexts/CartDrawerContext'
import CartDrawerWrapper from '@/components/CartDrawerWrapper'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <CartDrawerProvider>
        {children}
        <CartDrawerWrapper />
      </CartDrawerProvider>
    </TooltipProvider>
  )
}

