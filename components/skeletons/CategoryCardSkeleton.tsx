import { cn } from '@/lib/utils'

interface CategoryCardSkeletonProps {
    count?: number
    className?: string
}

export default function CategoryCardSkeleton({ count = 4, className }: CategoryCardSkeletonProps) {
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
                    <div className="relative aspect-[4/3] bg-muted">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    </div>

                    {/* Content skeleton */}
                    <div className="p-4 md:p-6 space-y-3">
                        {/* Title */}
                        <div className="h-6 md:h-7 bg-muted rounded w-2/3" />

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-full" />
                            <div className="h-4 bg-muted rounded w-5/6" />
                        </div>

                        {/* Button */}
                        <div className="h-10 bg-muted rounded w-1/2 mt-4" />
                    </div>
                </div>
            ))}
        </>
    )
}
