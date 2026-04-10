'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@maison/shared'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ThumbnailList } from './gallery/ThumbnailList'
import { MobileGalleryDialog } from './gallery/MobileGalleryDialog'

interface ImageItem { url: string; couleur?: string | null }
interface GalerieProduitProps { 
  images?: (string | ImageItem)[]; 
  imageUrl?: string; 
  selectedColor?: string | null;
  enableZoom?: boolean;
  showThumbnails?: boolean;
}

export default function GalerieProduit({ 
  images = [], 
  imageUrl, 
  selectedColor = null,
  enableZoom = true,
  showThumbnails = true
}: GalerieProduitProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  
  const normalized: ImageItem[] = images.length > 0 
    ? images.map((img) => typeof img === 'string' ? { url: img, couleur: null } : img) 
    : (imageUrl ? [{ url: imageUrl, couleur: null }] : [])
    
  // Filter by color IF there are images matching that specific color, otherwise show everything
  const filtered = (selectedColor && normalized.some(img => img.couleur === selectedColor))
    ? normalized.filter((img) => img.couleur === selectedColor) 
    : normalized;

  useEffect(() => setCurrentIndex(0), [selectedColor])

  const next = () => setCurrentIndex(i => (i === filtered.length - 1 ? 0 : i + 1))
  const prev = () => setCurrentIndex(i => (i === 0 ? filtered.length - 1 : i - 1))

  if (filtered.length === 0) return null

  return (
    <div className="space-y-4">
      <div className={cn(
        "relative aspect-square overflow-hidden rounded-xl bg-muted group",
        enableZoom && "cursor-zoom-in"
      )} onClick={() => setGalleryOpen(true)}>
        <AnimatePresence mode="wait">
          <motion.div key={filtered[currentIndex].url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            <Image src={filtered[currentIndex].url} alt="Produit" fill className="object-cover" priority />
          </motion.div>
        </AnimatePresence>
        
        {filtered.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-2 rounded-full"><ChevronLeft/></button>
            <button onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-2 rounded-full"><ChevronRight/></button>
          </>
        )}
      </div>

      {showThumbnails && (
        <ThumbnailList images={filtered} currentIndex={currentIndex} setIndex={setCurrentIndex} _colorContext={selectedColor} />
      )}
      
      <MobileGalleryDialog 
        open={galleryOpen} onOpenChange={setGalleryOpen} images={filtered} currentIndex={currentIndex}
        onNext={next} onPrevious={prev} onSetIndex={setCurrentIndex}
      />
    </div>
  )
}
