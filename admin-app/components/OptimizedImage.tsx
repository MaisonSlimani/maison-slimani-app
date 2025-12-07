'use client'

import { useState } from 'react'
import { isSupabaseImage, getResponsiveSizes } from '@/lib/utils/supabase-image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  className?: string
  fill?: boolean
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

/**
 * OptimizedImage component that uses pre-optimized images from Supabase Storage
 * instead of Vercel Image Optimization to reduce costs
 * 
 * Images are pre-optimized at upload time (WebP format, compressed)
 * This component uses regular img tags with proper attributes for performance
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes,
  className,
  fill = false,
  objectFit = 'cover',
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    setHasError(true)
  }

  if (hasError) {
    // Show placeholder on error
    return (
      <div
        className={cn(
          'bg-muted flex items-center justify-center',
          fill && 'absolute inset-0',
          className
        )}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <span className="text-muted-foreground text-sm">Image non disponible</span>
      </div>
    )
  }

  const imageProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    src,
    alt: alt || '', // Ensure alt is always present (empty string for decorative images)
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    onError: handleError,
    className: cn(
      fill && 'absolute inset-0 w-full h-full',
      objectFit === 'cover' && 'object-cover',
      objectFit === 'contain' && 'object-contain',
      objectFit === 'fill' && 'object-fill',
      objectFit === 'none' && 'object-none',
      objectFit === 'scale-down' && 'object-scale-down',
      className
    ),
    sizes: sizes || getResponsiveSizes(),
    ...(width && !fill && { width }),
    ...(height && !fill && { height }),
    ...props,
  }

  if (fill) {
    return (
      <div className="relative w-full h-full">
        <img {...imageProps} alt={alt || ''} />
      </div>
    )
  }

  return <img {...imageProps} alt={alt || ''} />
}

