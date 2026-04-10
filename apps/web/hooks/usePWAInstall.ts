'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone)) {
      setIsInstalled(true); return
    }

    const handler = (e: Event) => {
      e.preventDefault(); setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!localStorage.getItem('pwa-install-dismissed')) setTimeout(() => setShowPrompt(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) toast.info('Appuyez sur Partager puis "Sur l\'écran d\'accueil"')
      return
    }
    deferredPrompt.prompt()
    if ((await deferredPrompt.userChoice).outcome === 'accepted') { setShowPrompt(false); setDeferredPrompt(null) }
  }

  const handleDismiss = () => { setShowPrompt(false); localStorage.setItem('pwa-install-dismissed', 'true') }

  return { showPrompt, isInstalled, deferredPrompt, handleInstall, handleDismiss }
}
