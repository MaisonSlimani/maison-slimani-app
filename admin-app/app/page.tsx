'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Root redirect page - detects device type and redirects to appropriate UI
 * Desktop → /admin (desktop layout)
 * Mobile → /pwa (mobile layout)
 */
export default function RootRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Detect if device is mobile
    const isMobile = 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (typeof window !== 'undefined' && window.innerWidth < 768)

    // Redirect based on device type
    if (isMobile) {
      router.replace('/pwa')
    } else {
      router.replace('/admin')
    }
  }, [router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-lg font-serif mb-2">Maison Slimani Admin</div>
        <div className="text-sm text-muted-foreground">Chargement...</div>
      </div>
    </div>
  )
}
