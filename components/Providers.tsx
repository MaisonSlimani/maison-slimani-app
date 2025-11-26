'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CartDrawerProvider } from '@/lib/contexts/CartDrawerContext'
import CartDrawerWrapper from '@/components/CartDrawerWrapper'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2 minutes
            gcTime: 10 * 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartDrawerProvider>
          {children}
          <CartDrawerWrapper />
        </CartDrawerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

