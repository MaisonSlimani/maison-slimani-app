'use client'

import { useEffect } from 'react'
import BottomNav from '@/components/pwa/BottomNav'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'
import NativeBackHandler from '@/components/pwa/NativeBackHandler'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'

export default function PWALayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      // Register service worker (works in both dev and production)
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
        })
        .catch((error) => {
          // In development, this might fail if the file isn't accessible
          // This is non-critical - PWA will still work without service worker
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Service Worker not available in dev mode (this is normal)')
          } else {
            console.error('❌ Service Worker registration failed:', error)
          }
        })
    }

    
    // Set viewport meta for PWA
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      )
    } else {
      const meta = document.createElement('meta')
      meta.name = 'viewport'
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      document.head.appendChild(meta)
    }

    // Set theme color for status bar
    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) {
      themeColor.setAttribute('content', '#D4AF37')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = '#D4AF37'
      document.head.appendChild(meta)
    }

    // Set apple-mobile-web-app-capable (for iOS Safari)
    const appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]')
    if (appleCapable) {
      appleCapable.setAttribute('content', 'yes')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'apple-mobile-web-app-capable'
      meta.content = 'yes'
      document.head.appendChild(meta)
    }

    // Set mobile-web-app-capable (modern standard, replaces apple-mobile-web-app-capable)
    const mobileCapable = document.querySelector('meta[name="mobile-web-app-capable"]')
    if (mobileCapable) {
      mobileCapable.setAttribute('content', 'yes')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'mobile-web-app-capable'
      meta.content = 'yes'
      document.head.appendChild(meta)
    }

    // Set apple-mobile-web-app-status-bar-style
    const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    if (appleStatusBar) {
      appleStatusBar.setAttribute('content', 'black-translucent')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'apple-mobile-web-app-status-bar-style'
      meta.content = 'black-translucent'
      document.head.appendChild(meta)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-top safe-area-bottom overflow-x-hidden w-full max-w-full">
      <style jsx global>{`
        :root {
          --safe-area-inset-top: env(safe-area-inset-top, 0px);
          --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        }
        .safe-area-top {
          padding-top: var(--safe-area-inset-top);
        }
        .safe-area-bottom {
          padding-bottom: calc(var(--safe-area-inset-bottom) + 4rem);
        }
        body {
          overflow-x: hidden;
          max-width: 100vw;
        }
        html {
          overflow-x: hidden;
          max-width: 100vw;
        }
      `}</style>
      <main className="flex-1 pb-16 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
      <PWAInstallPrompt />
      <NativeBackHandler />
      <Toaster />
      <Sonner />
    </div>
  )
}
