'use client'

import { useState } from 'react'
import { getResponsiveSizes } from '../lib/utils/supabase-image'
import { cn } from '@maison/shared'

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  src: string; alt: string; width?: number; height?: number; priority?: boolean
  sizes?: string; className?: string; fill?: boolean; objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

const Fallback = ({ fill, width, height, className }: { fill?: boolean; width?: number; height?: number; className?: string }) => (
  <div className={cn('bg-muted flex items-center justify-center', fill && 'absolute inset-0', className)} style={!fill && width && height ? { width, height } : undefined}>
    <span className="text-muted-foreground text-sm">Image non disponible</span>
  </div>
)

export default function OptimizedImage({
  src, alt, width, height, priority = false, sizes, className, fill = false, objectFit = 'cover', ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)
  if (hasError) return <Fallback fill={fill} width={width} height={height} className={className} />

  const imgProps = {
    src, alt: alt || '', loading: (priority ? 'eager' : 'lazy') as "eager" | "lazy", decoding: 'async' as const, onError: () => setHasError(true),
    className: cn(fill && 'absolute inset-0 w-full h-full', objectFit && `object-${objectFit}`, className),
    sizes: sizes || getResponsiveSizes(), ...(width && !fill && { width }), ...(height && !fill && { height }), ...props
  }

  return fill ? <div className="relative w-full h-full"><img {...imgProps} /></div> : <img {...imgProps} />
}
