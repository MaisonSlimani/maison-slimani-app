'use client'

import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@maison/ui'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@maison/shared'

interface MobileGalleryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: { url: string }[]
  currentIndex: number
  onPrevious: () => void
  onNext: () => void
  onSetIndex: (idx: number) => void
}

export const MobileGalleryDialog = ({
  open,
  onOpenChange,
  images,
  currentIndex,
  onPrevious,
  onNext,
  onSetIndex
}: MobileGalleryDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-full h-full p-0 bg-black/95 border-none md:hidden">
        <DialogTitle className="sr-only">Galerie</DialogTitle>
        <div className="relative w-full h-full flex flex-col justify-center">
          <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4 z-50 text-white p-2 bg-black/50 rounded-full">
            <X className="w-6 h-6" />
          </button>

          <div className="relative flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={images[currentIndex]?.url}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full h-full relative"
              >
                {images[currentIndex] && (
                  <Image src={images[currentIndex].url} alt="Gallery" fill className="object-contain" />
                )}
              </motion.div>
            </AnimatePresence>

            <button onClick={onPrevious} className="absolute left-4 p-3 bg-black/50 text-white rounded-full"><ChevronLeft /></button>
            <button onClick={onNext} className="absolute right-4 p-3 bg-black/50 text-white rounded-full"><ChevronRight /></button>
          </div>

          <div className="flex justify-center gap-2 p-4">
            {images.map((_, i) => (
              <button key={i} onClick={() => onSetIndex(i)} className={cn("w-2 h-2 rounded-full", i === currentIndex ? "bg-white w-6" : "bg-white/50")} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
