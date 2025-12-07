'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes - keep unused data in cache for 30 minutes
            retry: 1,
            refetchOnWindowFocus: false, // Don't refetch on window focus for admin
            refetchOnReconnect: true, // Refetch when reconnecting
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  )
}

