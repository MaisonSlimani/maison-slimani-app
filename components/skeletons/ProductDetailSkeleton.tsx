import { cn } from '@/lib/utils'

interface ProductDetailSkeletonProps {
    className?: string
}

export default function ProductDetailSkeleton({ className }: ProductDetailSkeletonProps) {
    return (
        <div className={cn("animate-pulse", className)}>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {/* Image Gallery Skeleton */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    </div>

                    {/* Thumbnail Gallery */}
                    <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Info Skeleton */}
                <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-3">
                        <div className="h-8 bg-muted rounded w-3/4" />
                        <div className="h-6 bg-muted rounded w-1/2" />
                    </div>

                    {/* Price */}
                    <div className="h-10 bg-muted rounded w-1/3" />

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                    </div>

                    {/* Color Selector */}
                    <div className="space-y-3">
                        <div className="h-5 bg-muted rounded w-24" />
                        <div className="flex gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-12 w-12 rounded-full bg-muted" />
                            ))}
                        </div>
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-3">
                        <div className="h-5 bg-muted rounded w-24" />
                        <div className="grid grid-cols-6 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-12 bg-muted rounded" />
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                        <div className="h-12 bg-muted rounded w-full" />
                        <div className="h-12 bg-muted rounded w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
