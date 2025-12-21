/**
 * Utility functions for generating product URLs
 * Supports hierarchical URLs: /boutique/[categorie]/[slug]
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Generate hierarchical product URL
 * Format: /boutique/[category-slug]/[product-slug]
 * 
 * @param productSlug - Product slug
 * @param categorySlug - Category slug (optional, will fetch if not provided)
 * @param categoryName - Category name (used to fetch slug if categorySlug not provided)
 * @returns Product URL
 */
export async function getProductUrl(
  productSlug: string,
  categorySlug?: string,
  categoryName?: string
): Promise<string> {
  // If category slug is provided, use it directly
  if (categorySlug) {
    return `/boutique/${categorySlug}/${productSlug}`
  }

  // If category name is provided, fetch the slug
  if (categoryName) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/categories?slug=${encodeURIComponent(
          slugify(categoryName)
        )}`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data && data.data.length > 0) {
          return `/boutique/${data.data[0].slug}/${productSlug}`
        }
      }
    } catch (error) {
      console.error('Error fetching category slug:', error)
    }
  }

  // Fallback: use slugified category name
  if (categoryName) {
    return `/boutique/${slugify(categoryName)}/${productSlug}`
  }

  // Ultimate fallback: use old URL structure
  return `/produits/${productSlug}`
}

/**
 * Generate product URL synchronously (client-side)
 * Requires categorySlug to be provided
 */
export function getProductUrlSync(
  productSlug: string,
  categorySlug: string
): string {
  return `/boutique/${categorySlug}/${productSlug}`
}

/**
 * Get category slug from category name (client-side)
 * This is a helper for components that need to generate URLs
 */
export async function getCategorySlug(categoryName: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/api/categories?active=true`
    )
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        const category = data.data.find((cat: any) => cat.nom === categoryName)
        return category?.slug || null
      }
    }
  } catch (error) {
    console.error('Error fetching category slug:', error)
  }
  return null
}

