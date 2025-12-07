'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import RatingDisplay from './RatingDisplay'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ProductRatingSummaryProps {
  produitId: string
  averageRating: number | null
  ratingCount: number
  className?: string
}

interface RatingBreakdown {
  [key: number]: number // rating -> count
}

export default function ProductRatingSummary({
  produitId,
  averageRating,
  ratingCount,
  className,
}: ProductRatingSummaryProps) {
  const [breakdown, setBreakdown] = useState<RatingBreakdown>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  })

  useEffect(() => {
    // Fetch rating breakdown
    const fetchBreakdown = async () => {
      try {
        const response = await fetch(`/api/commentaires?produit_id=${produitId}&limit=1000`)
        const data = await response.json()

        if (data.success && data.data) {
          const counts: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          data.data.forEach((comment: { rating: number }) => {
            counts[comment.rating as keyof RatingBreakdown]++
          })
          setBreakdown(counts)
        }
      } catch (error) {
        console.error('Erreur lors du chargement du détail des notes:', error)
      }
    }

    if (produitId && ratingCount > 0) {
      fetchBreakdown()
    }
  }, [produitId, ratingCount])

  if (ratingCount === 0 || !averageRating || averageRating === 0) {
    return null
  }

  const percentage = (count: number) => (ratingCount > 0 ? (count / ratingCount) * 100 : 0)

  return (
    <Card className={cn('p-6 border border-border/50 bg-card', className)}>
      <div className="space-y-4">
        {/* Average rating display */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold font-serif text-foreground">
              {averageRating?.toFixed(1) || '0.0'}
            </div>
            <RatingDisplay
              rating={averageRating}
              count={ratingCount}
              size="lg"
              className="justify-center mt-2"
            />
          </div>
          <div className="flex-1 space-y-2">
            {/* Rating breakdown bars */}
            {[5, 4, 3, 2, 1].map((star) => {
              const count = breakdown[star] || 0
              const pct = percentage(count)
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-8 text-foreground">{star}</span>
                  <Star className="w-4 h-4 fill-dore text-dore" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-dore transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}

