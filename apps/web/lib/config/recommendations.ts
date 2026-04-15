/**
 * Configuration for product recommendations system
 */

export const RECOMMENDATIONS_CONFIG = {
  // Default number of similar products to return
  defaultLimit: 6,

  // Price range tolerance (±20% means products within 80%-120% of current product price)
  priceRangeTolerance: 0.2, // 20%

  // Whether to include out-of-stock products in recommendations
  includeOutOfStock: false,

  // Cache TTL in seconds (5 minutes)
  cacheTTL: 300,

  // Stale-while-revalidate time in seconds (10 minutes)
  staleWhileRevalidate: 600,
} as const

export type RecommendationsConfig = typeof RECOMMENDATIONS_CONFIG

