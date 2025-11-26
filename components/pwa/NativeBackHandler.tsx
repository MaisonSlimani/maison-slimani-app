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
    // Check if running in Capacitor
    const isCapacitor = typeof (window as any).Capacitor !== 'undefined'

    if (isCapacitor) {
      // Import and use Capacitor App plugin for hardware back button
      const setupCapacitorBackButton = async () => {
        try {
          const { App } = await import('@capacitor/app')
          
          // Listen for hardware back button
          const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
            // If on main PWA page, minimize app or exit
            if (pathname === '/pwa' || pathname === '/pwa/') {
              // Minimize the app (Android) or do nothing (iOS doesn't support this)
              App.minimizeApp()
            } else if (canGoBack || window.history.length > 1) {
              // Go back in history
              router.back()
            } else {
              // Navigate to PWA home
              router.push('/pwa')
            }
          })

          // Cleanup listener on unmount
          return () => {
            backButtonListener.then(listener => listener.remove())
          }
        } catch (error) {
          console.warn('Capacitor App plugin not available:', error)
        }
      }

      setupCapacitorBackButton()
    }

    // For PWA (standalone mode), handle popstate for additional control
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone && !isCapacitor) {
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

