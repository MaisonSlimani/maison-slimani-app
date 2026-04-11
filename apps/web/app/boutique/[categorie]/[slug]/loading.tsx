import ProductDetailSkeleton from '@/components/skeletons/ProductDetailSkeleton'

/**
 * Product Detail Loading State
 * 
 * Specifically overrides the parent category grid skeleton to provide
 * a layout-matched loading experience for single product pages.
 */
export default function Loading() {
  return (
    <div className="pt-24 pb-32 min-h-screen">
      <div className="container max-w-7xl mx-auto px-6">
        <ProductDetailSkeleton />
      </div>
    </div>
  )
}
