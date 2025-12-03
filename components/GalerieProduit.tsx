'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageItem {
  url: string
  couleur?: string | null
  ordre?: number
}

interface Couleur {
  nom: string
  code?: string
  images?: string[]
}

interface GalerieProduitProps {
  images?: ImageItem[] | string[]
  couleurs?: Couleur[]
  imageUrl?: string // Fallback pour compatibilité
  className?: string
  showThumbnails?: boolean
  enableZoom?: boolean
  selectedColor?: string | null // Color selected from parent component
}

export default function GalerieProduit({
  images = [],
  couleurs = [],
  imageUrl,
  className = '',
  showThumbnails = true,
  enableZoom = true,
  selectedColor = null,
}: GalerieProduitProps) {
  // Normaliser les images: supporter à la fois array d'objets et array de strings
  const normalizeImages = (): ImageItem[] => {
    if (!images || images.length === 0) {
      // Fallback sur imageUrl si disponible
      return imageUrl ? [{ url: imageUrl, couleur: null, ordre: 1 }] : []
    }
    
    return images.map((img, index) => {
      if (typeof img === 'string') {
        return { url: img, couleur: null, ordre: index + 1 }
      }
      return img as ImageItem
    })
  }

  const normalizedImages = normalizeImages()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)

  // Handle touch/swipe for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Filtrer les images par couleur sélectionnée
  const getFilteredImages = (): ImageItem[] => {
    // Si on a des couleurs avec des images spécifiques, utiliser celles-ci
    if (selectedColor && couleurs && couleurs.length > 0) {
      const couleur = couleurs.find(c => c.nom === selectedColor)
      if (couleur?.images && couleur.images.length > 0) {
        return couleur.images.map((url, index) => ({
          url,
          couleur: selectedColor,
          ordre: index + 1,
        }))
      }
    }

    // Si couleur sélectionnée, filtrer par couleur dans les images
    if (selectedColor) {
      return normalizedImages.filter(img => img.couleur === selectedColor)
    }

    // Si pas de couleur sélectionnée, retourner toutes les images (pour produits sans couleurs)
    return normalizedImages
  }

  const filteredImages = getFilteredImages()

  // Navigation functions for gallery
  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1))
  }

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goToNext()
    }
    if (isRightSwipe) {
      goToPrevious()
    }
  }
  const currentImage = filteredImages[currentImageIndex] || filteredImages[0]

  // Réinitialiser l'index quand la couleur change
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedColor])

  // Preload adjacent images for instant switching
  useEffect(() => {
    if (filteredImages.length > 1) {
      // Clean up old preload links first
      const existingPreloads = document.querySelectorAll('link[rel="preload"][as="image"]')
      existingPreloads.forEach((link) => {
        const href = link.getAttribute('href')
        // Only keep preloads for current filtered images
        const isCurrentImage = filteredImages.some(img => img.url === href)
        if (!isCurrentImage) {
          link.remove()
        }
      })

      // Preload previous and next images
      const prevIndex = currentImageIndex === 0 ? filteredImages.length - 1 : currentImageIndex - 1
      const nextIndex = currentImageIndex === filteredImages.length - 1 ? 0 : currentImageIndex + 1
      
      const imagesToPreload = [
        filteredImages[prevIndex],
        filteredImages[nextIndex]
      ]

      imagesToPreload.forEach((img) => {
        if (img && img.url) {
          // Only add if not already preloaded
          const existingPreload = document.querySelector(`link[rel="preload"][href="${img.url}"]`)
          if (!existingPreload) {
            const link = document.createElement('link')
            link.rel = 'preload'
            link.as = 'image'
            link.href = img.url
            // Add fetchpriority to indicate this is important
            link.setAttribute('fetchpriority', 'high')
            document.head.appendChild(link)
          }
        }
      })
    }

    // Cleanup function to remove preload links when component unmounts or images change
    return () => {
      const preloads = document.querySelectorAll('link[rel="preload"][as="image"]')
      preloads.forEach((link) => {
        const href = link.getAttribute('href')
        const isCurrentImage = filteredImages.some(img => img.url === href)
        if (!isCurrentImage) {
          link.remove()
        }
      })
    }
  }, [filteredImages, currentImageIndex])

  // Gérer le hover pour le zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableZoom || !isHovering) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setHoverPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setHoverPosition(null)
  }

  const handleMouseEnter = () => {
    if (enableZoom) {
      setIsHovering(true)
    }
  }

  if (!currentImage) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Image principale avec zoom au hover (desktop) et clic pour galerie (mobile) */}
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-muted group cursor-zoom-in md:cursor-zoom-in cursor-pointer w-full"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          // On mobile, ouvrir la galerie au clic
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setGalleryOpen(true)
          }
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentImage.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={currentImage.url}
              alt={`${selectedColor ? `${selectedColor} - ` : ''}Image produit ${currentImageIndex + 1}${filteredImages.length > 1 ? ` sur ${filteredImages.length}` : ''}`}
              fill
              className={cn(
                'object-cover transition-transform duration-300',
                isHovering && enableZoom && 'scale-150'
              )}
              style={{
                transformOrigin: hoverPosition
                  ? `${hoverPosition.x}% ${hoverPosition.y}%`
                  : 'center',
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 28vw, 25vw"
              priority={currentImageIndex === 0}
              loading={currentImageIndex === 0 ? 'eager' : 'eager'}
              unoptimized={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Indicateur de zoom au hover (desktop uniquement) */}
        {isHovering && enableZoom && (
          <div className="absolute inset-0 pointer-events-none md:block hidden">
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              🔍 Zoom
            </div>
          </div>
        )}
      </div>

      {/* Miniatures d'images */}
      {showThumbnails && filteredImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {filteredImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border-2 transition-all',
                currentImageIndex === index
                  ? 'border-dore ring-2 ring-dore/20'
                  : 'border-transparent hover:border-muted-foreground/50'
              )}
            >
              <Image
                src={img.url}
                alt={`${selectedColor ? `${selectedColor} - ` : ''}Miniature ${index + 1}${filteredImages.length > 1 ? ` sur ${filteredImages.length}` : ''}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12.5vw"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal galerie pour mobile */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-full w-full h-full p-0 bg-black/95 border-none md:hidden">
          <DialogTitle className="sr-only">Galerie d'images du produit</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Bouton fermer */}
            <button
              onClick={() => setGalleryOpen(false)}
              className="absolute top-4 right-4 z-50 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image principale avec swipe */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={filteredImages[currentImageIndex]?.url}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {filteredImages[currentImageIndex] && (
                    <Image
                      src={filteredImages[currentImageIndex].url}
                      alt={`${selectedColor ? `${selectedColor} - ` : ''}Image produit ${currentImageIndex + 1}${filteredImages.length > 1 ? ` sur ${filteredImages.length}` : ''} - Maison Slimani`}
                      width={1200}
                      height={1200}
                      className="object-contain w-full h-full"
                      priority={currentImageIndex === 0}
                      loading="eager"
                      unoptimized={false}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Boutons navigation */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Indicateur de position */}
              {filteredImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
                  {filteredImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        index === currentImageIndex
                          ? 'bg-white w-8'
                          : 'bg-white/50 hover:bg-white/75'
                      )}
                      aria-label={`Aller à l'image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

