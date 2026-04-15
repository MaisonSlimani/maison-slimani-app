'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Label } from '@maison/ui'
import { cn } from '@maison/shared'

interface RatingInputProps {
  rating: number | null
  setRating: (rating: number) => void
  disabled?: boolean
}

export function RatingInput({ rating, setRating, disabled }: RatingInputProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const displayRating = hoveredStar || rating || 0

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Note <span className="text-dore">*</span>
      </Label>
      <div className="flex items-center gap-1" onMouseLeave={() => setHoveredStar(null)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            disabled={disabled}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'w-6 h-6 transition-colors',
                star <= displayRating ? 'fill-dore text-dore' : 'text-muted-foreground/30'
              )}
            />
          </button>
        ))}
        {rating && <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>}
      </div>
    </div>
  )
}
