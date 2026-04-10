'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import OptimizedImage from '@/components/OptimizedImage'
import { cn } from '@maison/shared'

interface ColorImage {
  couleur: string
  image: string | null
}

interface ProductCardImageProps {
  imageUrl: string | null
  nom: string
  hasMultipleColors: boolean
  colorImages: ColorImage[]
  currentColorIndex: number
  onPreviousColor: (e: React.MouseEvent) => void
  onNextColor: (e: React.MouseEvent) => void
  inWishlist: boolean
  isOutOfStock: boolean
  priority?: boolean
}

const ProductCardImage = ({
  imageUrl,
  nom,
  hasMultipleColors,
  colorImages,
  currentColorIndex,
  onPreviousColor,
  onNextColor,
  inWishlist,
  isOutOfStock,
  priority = false
}: ProductCardImageProps) => {
  return (
    <motion.div className="aspect-square overflow-hidden bg-muted relative group group/image">
      <OptimizedImage
        key={imageUrl || 'placeholder'}
        src={imageUrl || '/placeholder.jpg'}
        alt={nom}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        objectFit="cover"
        priority={priority}
      />

      {hasMultipleColors && (
        <>
          <button
            onClick={onPreviousColor}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover/image:opacity-100 transition-all"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onNextColor}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover/image:opacity-100 transition-all"
            aria-label="Suivant"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity">
            {colorImages.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all",
                  index === currentColorIndex ? "bg-dore w-4" : "bg-white/60"
                )}
              />
            ))}
          </div>
        </>
      )}

      {inWishlist && (
        <div className="absolute top-2 right-2 z-20 bg-dore/90 backdrop-blur-sm rounded-full p-1.5">
          <div className="w-3 h-3 text-charbon fill-current" />
        </div>
      )}

      {isOutOfStock && (
        <div className="absolute top-2 left-2 z-20 bg-red-600/95 backdrop-blur-sm rounded-md px-2 py-1">
          <span className="text-white text-[10px] font-semibold uppercase">Rupture</span>
        </div>
      )}
    </motion.div>
  )
}

export default ProductCardImage
