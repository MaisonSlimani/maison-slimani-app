import { cn } from '@/lib/utils'

interface ProductCardSkeletonProps {
    count?: number
    className?: string
}

export default function ProductCardSkeleton({ count = 6, className }: ProductCardSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        "group relative rounded-lg overflow-hidden bg-card border border-border animate-pulse",
                        className
                    )}
                >
                    {/* Image skeleton */}
                    <div className="relative aspect-square bg-muted">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    </div>

                    {/* Content skeleton */}
                    <div className="p-3 md:p-4 space-y-3">
                        {/* Title */}
                        <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-4 bg-muted rounded w-1/2" />
                        </div>

                        {/* Price */}
                        <div className="h-6 bg-muted rounded w-1/3" />

                        {/* Colors or stock indicator */}
                        <div className="flex gap-2">
                            <div className="h-6 w-6 rounded-full bg-muted" />
                            <div className="h-6 w-6 rounded-full bg-muted" />
                            <div className="h-6 w-6 rounded-full bg-muted" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}
