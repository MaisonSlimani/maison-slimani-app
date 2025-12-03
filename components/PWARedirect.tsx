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
 * 
 * Can be disabled via NEXT_PUBLIC_DISABLE_PWA_REDIRECT environment variable
 */
export default function PWARedirect() {
  const pathname = usePathname()
  const router = useRouter()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Check if redirect is disabled via environment variable
    const isRedirectDisabled = process.env.NEXT_PUBLIC_DISABLE_PWA_REDIRECT === 'true'
    if (isRedirectDisabled) {
      return
    }

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

    // IMPORTANT: With unified URLs, we don't redirect anymore
    // The pages themselves handle conditional rendering based on device
    // Only redirect if explicitly enabled via environment variable
    // For now, we disable automatic redirects to support unified URLs
    return

    // OLD REDIRECT LOGIC (disabled for unified URLs):
    // const ua = navigator.userAgent
    // const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    // const isWebView = ua.includes('wv') || ua.includes('Capacitor') || typeof (window as any).Capacitor !== 'undefined'
    // const isMobileBrowser = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    // if (isStandalone || isWebView || isMobileBrowser) {
    //   hasRedirected.current = true
    //   const pwaPath = pathname === '/' ? '/pwa' : `/pwa${pathname}`
    //   router.replace(pwaPath)
    // }
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
