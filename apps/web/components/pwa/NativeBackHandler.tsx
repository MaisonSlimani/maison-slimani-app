'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * NativeBackHandler - Handles native back button for PWA/Capacitor
 * 
 * For Capacitor (Android/iOS): Intercepts hardware back button
 * For PWA (browser): Browser handles back button automatically via history API
 */
export default function NativeBackHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {

    // For PWA (standalone mode), handle popstate for additional control
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    if (isStandalone) {
      // Prevent accidental exit on main page by pushing extra history entry
      if (pathname === '/pwa' || pathname === '/pwa/') {
        // Only push if we don't have enough history
        if (window.history.length <= 2) {
          window.history.pushState({ pwaHome: true }, '', pathname)
        }
      }

      const handlePopState = (event: PopStateEvent) => {
        // If on PWA home and trying to go back, stay on home
        if ((pathname === '/pwa' || pathname === '/pwa/') && event.state?.pwaHome) {
          window.history.pushState({ pwaHome: true }, '', pathname)
        }
      }

      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname, router])

  return null
}

