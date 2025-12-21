import { cn } from '@/lib/utils'

interface ListSkeletonProps {
    count?: number
    className?: string
}

export default function ListSkeleton({ count = 5, className }: ListSkeletonProps) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        "rounded-lg bg-card border border-border p-4 animate-pulse",
                        className
                    )}
                >
                    <div className="flex items-center gap-4">
                        {/* Icon/Image placeholder */}
                        <div className="h-12 w-12 rounded-lg bg-muted flex-shrink-0" />

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
