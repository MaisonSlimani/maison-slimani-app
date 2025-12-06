'use client'

import { useEffect } from 'react'

/**
 * Redirect /pwa to / (unified URLs)
 * This maintains backward compatibility for old /pwa links
 */
export default function PWAPage() {
  useEffect(() => {
    // Use window.location for a hard redirect that works reliably in PWA standalone mode
    // This ensures the redirect completes immediately
    if (typeof window !== 'undefined') {
      window.location.replace('/')
    }
  }, [])

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
