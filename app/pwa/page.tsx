'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect /pwa to / (unified URLs)
 * This maintains backward compatibility for old /pwa links
 */
export default function PWAPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to unified home URL
    router.replace('/')
  }, [router])

  // Show loading state during redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dore mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirection...</p>
      </div>
    </div>
  )
}
