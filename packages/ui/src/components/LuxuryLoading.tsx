'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@maison/shared'

interface LuxuryLoadingProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export const LuxuryLoading: React.FC<LuxuryLoadingProps> = ({ 
  message = "Chargement...", 
  fullScreen = false,
  className 
}) => {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      fullScreen ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" : "w-full min-h-[200px]",
      className
    )}>
      <div className="relative w-24 h-24 mb-6">
        {/* Outer ring */}
        <motion.div 
          className="absolute inset-0 border-t-2 border-r-2 border-dore rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner logo placeholder */}
        <motion.div 
          className="absolute inset-4 bg-charbon rounded-full flex items-center justify-center border border-dore/30 shadow-[0_0_15px_rgba(197,160,89,0.3)]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-dore font-serif text-xl font-bold">MS</span>
        </motion.div>
      </div>
      
      <AnimatePresence>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-primary font-serif italic text-lg tracking-widest"
        >
          {message}
        </motion.p>
      </AnimatePresence>
      
      {/* Decorative dots */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-dore/50"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  )

  return fullScreen ? content : <div className="w-full">{content}</div>
}
