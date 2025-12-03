'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect if the app is running in PWA mode
 * 
 * Detects:
 * 1. Installed PWA (Standalone mode)
 * 2. WebView App (Capacitor / Android WebView)
 * 3. Normal Mobile Browser (optional - can be disabled)
 * 
 * @returns { isPWA: boolean, isLoading: boolean }
 */
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') {
      setIsLoading(false)
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
    // This can be disabled if you want desktop UI on mobile browsers
    const isMobileBrowser =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)

    // Set PWA mode if any condition is true
    setIsPWA(isStandalone || isWebView || isMobileBrowser)
    setIsLoading(false)
  }, [])

  return { isPWA, isLoading }
}

