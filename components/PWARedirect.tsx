'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Client-side PWA detection and redirect
 * 
 * Detects:
 * 1. Installed PWA (Standalone)
 * 2. WebView App (Capacitor / Android WebView)
 * 3. Normal Mobile Browser
 * 
 * Redirects to /pwa if in app mode or mobile browser
 */
export default function PWARedirect() {
  const pathname = usePathname()
  const router = useRouter()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return

    // Skip if already on /pwa routes or admin/login routes
    if (
      pathname?.startsWith('/pwa') ||
      pathname?.startsWith('/admin') ||
      pathname === '/login' ||
      pathname?.startsWith('/api') ||
      pathname?.startsWith('/_next')
    ) {
      return
    }

    const ua = navigator.userAgent

    // 1. Detect installed PWA (Standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    // 2. Detect WebView App (Capacitor / Android WebView)
    const isWebView =
      ua.includes('wv') ||
      ua.includes('Capacitor') ||
      typeof (window as any).Capacitor !== 'undefined'

    // 3. Detect normal mobile browser (UA only, NOT screen width)
    const isMobileBrowser =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)

    // Redirect to PWA version if any condition is true
    if (isStandalone || isWebView || isMobileBrowser) {
      hasRedirected.current = true
      // Build the PWA path
      const pwaPath = pathname === '/' ? '/pwa' : `/pwa${pathname}`
      router.replace(pwaPath)
    }
  }, [pathname, router])

  // Reset redirect flag when pathname changes to non-PWA route
  useEffect(() => {
    if (!pathname?.startsWith('/pwa') && !pathname?.startsWith('/admin') && pathname !== '/login') {
      hasRedirected.current = false
    }
  }, [pathname])

  // This component doesn't render anything
  return null
}
