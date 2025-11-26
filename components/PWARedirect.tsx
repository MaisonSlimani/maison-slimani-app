'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Client-side PWA detection and redirect
 * 
 * Detects:
 * - Standalone mode (installed PWA)
 * - iOS standalone mode
 * - Capacitor WebView (Android/iOS app)
 * 
 * Redirects to /pwa if in app mode and not already on /pwa routes
 */
export default function PWARedirect() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Skip if already on /pwa routes or admin/login routes
    if (
      pathname?.startsWith('/pwa') ||
      pathname?.startsWith('/admin') ||
      pathname === '/login'
    ) {
      return
    }

    // Detect standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS standalone detection
      (window.navigator as any).standalone === true

    // Detect Capacitor WebView
    const isCapacitor =
      typeof (window as any).Capacitor !== 'undefined' ||
      window.navigator.userAgent.includes('Capacitor')

    // Detect Android WebView
    const isAndroidWebView =
      window.navigator.userAgent.includes('wv') &&
      window.navigator.userAgent.includes('Android')

    // If in app mode, redirect to PWA version
    if (isStandalone || isCapacitor || isAndroidWebView) {
      // Build the PWA path
      const pwaPath = pathname === '/' ? '/pwa' : `/pwa${pathname}`
      router.replace(pwaPath)
    }
  }, [pathname, router])

  // This component doesn't render anything
  return null
}

