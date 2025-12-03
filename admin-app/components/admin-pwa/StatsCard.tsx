'use client'

import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export default function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-serif font-semibold text-foreground">
            {typeof value === 'number' ? value.toLocaleString('fr-MA') : value}
          </p>
          {trend && (
            <p
              className={cn(
                'text-xs mt-1',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </p>
          )}
        </div>
        <div className="p-2 bg-dore/10 rounded-lg">
          <Icon className="w-5 h-5 text-dore" />
        </div>
      </div>
    </Card>
  )
}

