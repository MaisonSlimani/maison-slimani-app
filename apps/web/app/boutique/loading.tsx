import CategoryCardSkeleton from '@/components/skeletons/CategoryCardSkeleton'

export default function Loading() {
  return (
    <div className="pt-20 bg-ecru min-h-screen">
      <section className="py-20 px-6">
        <div className="container max-w-6xl mx-auto">
          {/* Hero Skeleton */}
          <div className="text-center mb-16 space-y-4">
            <div className="h-12 w-64 bg-charbon/5 rounded-xl mx-auto animate-pulse"></div>
            <div className="h-6 w-96 bg-charbon/5 rounded-lg mx-auto animate-pulse"></div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid md:grid-cols-2 gap-8">
            <CategoryCardSkeleton count={4} />
          </div>
        </div>
      </section>
    </div>
  )
}
