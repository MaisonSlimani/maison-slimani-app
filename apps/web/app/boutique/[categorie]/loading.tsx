import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton'

export default function Loading() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        {/* Header Skeleton */}
        <div className="mb-12 space-y-4">
          <div className="h-10 w-48 bg-charbon/5 rounded-lg animate-pulse"></div>
          <div className="h-6 w-96 bg-charbon/5 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block space-y-8">
            <div className="h-64 bg-charbon/5 rounded-2xl animate-pulse"></div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="lg:col-span-3">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <ProductCardSkeleton count={6} />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
