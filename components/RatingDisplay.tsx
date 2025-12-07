'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingDisplayProps {
  rating: number | null
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export default function RatingDisplay({
  rating,
  count = 0,
  size = 'md',
  showCount = true,
  interactive = false,
  onRatingChange,
  className,
}: RatingDisplayProps) {
  const displayRating = rating || 0
  const fullStars = Math.floor(displayRating)
  const hasHalfStar = displayRating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(
              sizeClasses[size],
              'fill-dore text-dore',
              interactive && 'cursor-pointer hover:scale-110 transition-transform'
            )}
            onClick={() => handleStarClick(i)}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star
              className={cn(
                sizeClasses[size],
                'text-muted-foreground/30'
              )}
            />
            <Star
              className={cn(
                sizeClasses[size],
                'fill-dore text-dore absolute inset-0 overflow-hidden',
                'clip-path-[inset(0% 50% 0% 0%)]',
                interactive && 'cursor-pointer hover:scale-110 transition-transform'
              )}
              onClick={() => handleStarClick(fullStars)}
            />
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(
              sizeClasses[size],
              'text-muted-foreground/30',
              interactive && 'cursor-pointer hover:scale-110 transition-transform hover:text-dore/50'
            )}
            onClick={() => handleStarClick(fullStars + (hasHalfStar ? 1 : 0) + i)}
          />
        ))}
      </div>
      
      {showCount && count > 0 && (
        <span className="text-sm text-muted-foreground ml-1">
          ({count})
        </span>
      )}
    </div>
  )
}

