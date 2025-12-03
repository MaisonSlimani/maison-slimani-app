'use client'

import { useIsPWA } from '@/lib/hooks/useIsPWA'
import PWAMenuPage from '../pwa/menu/page'

export default function MenuPage() {
  const { isPWA, isLoading } = useIsPWA()

  // Show loading state while detecting device
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dore mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // On desktop, redirect to home (menu is only for mobile)
  if (!isPWA) {
    // For desktop, we could show a different page or redirect
    // For now, just show the menu (it will look fine on desktop too)
    return <PWAMenuPage />
  }

  // Render PWA menu
  return <PWAMenuPage />
}

