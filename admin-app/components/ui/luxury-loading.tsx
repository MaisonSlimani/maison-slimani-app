'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LuxuryLoadingProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export function LuxuryLoading({ 
  message = 'Chargement...', 
  fullScreen = false,
  className = '' 
}: LuxuryLoadingProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-6 ${fullScreen ? 'min-h-screen' : 'py-16'} ${className}`}>
      <div className="flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-dore animate-spin" />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
        className="text-sm font-medium text-foreground/80 font-serif tracking-wide"
      >
        {message}
      </motion.p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}

