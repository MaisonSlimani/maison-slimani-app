'use client'

import { Button } from '@maison/ui'
import { X, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export default function PWAInstallPrompt() {
  const { showPrompt, isInstalled, deferredPrompt, handleInstall, handleDismiss } = usePWAInstall()

  if (isInstalled || !showPrompt || !deferredPrompt) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-serif font-semibold text-foreground mb-1">Installer l'application</h3>
              <p className="text-sm text-muted-foreground">Ajoutez Maison Slimani à votre écran d'accueil pour une expérience optimale</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={handleDismiss}><X className="h-4 w-4" /></Button>
          </div>
          <Button onClick={handleInstall} className="w-full bg-dore hover:bg-dore/90 text-charbon"><Download className="h-4 w-4 mr-2" />Installer</Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
