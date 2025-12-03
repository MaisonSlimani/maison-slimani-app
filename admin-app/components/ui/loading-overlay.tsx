'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ isLoading, message = 'Traitement en cours...', className }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            'bg-background/80 backdrop-blur-sm',
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border-2 border-dore/30 shadow-2xl"
          >
            <div className="relative">
              <Loader2 className="w-12 h-12 text-dore animate-spin" />
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-12 h-12 border-2 border-dore/20 rounded-full border-t-dore" />
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-medium text-foreground/80 font-serif"
            >
              {message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface LoadingButtonProps {
  isLoading: boolean
  message?: string
  className?: string
}

export function LoadingButton({ isLoading, message = 'Traitement...', className }: LoadingButtonProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'fixed top-4 right-4 z-50',
            'flex items-center gap-3 px-6 py-3',
            'bg-card border-2 border-dore/30 rounded-lg',
            'shadow-lg backdrop-blur-sm',
            className
          )}
        >
          <Loader2 className="w-5 h-5 text-dore animate-spin" />
          <span className="text-sm font-medium text-foreground font-serif">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

