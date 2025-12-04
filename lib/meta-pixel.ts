/**
 * Meta Pixel Tracking Utility
 * Provides functions to track e-commerce events for Meta Pixel
 */

declare global {
  interface Window {
    fbq: (
      action: string,
      eventName: string,
      params?: Record<string, any>
    ) => void
  }
}

/**
 * Initialize Meta Pixel (called after pixel code loads)
 */
export function initMetaPixel(): boolean {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    return true
  }
  return false
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Meta Pixel not loaded, event not tracked:', eventName)
    }
    return
  }

  try {
    window.fbq('track', eventName, params)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracking Meta Pixel event:', error)
    }
  }
}

/**
 * Track PageView
 */
export function trackPageView() {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return
  }

  try {
    window.fbq('track', 'PageView')
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracking PageView:', error)
    }
  }
}

/**
 * Track ViewContent - Product page view
 */
export function trackViewContent(product: {
  content_name: string
  content_ids: string[]
  content_type: 'product'
  value: number
  currency: string
  contents?: Array<{
    id: string
    quantity: number
    item_price: number
  }>
}) {
  trackEvent('ViewContent', {
    content_name: product.content_name,
    content_ids: product.content_ids,
    content_type: product.content_type,
    value: product.value,
    currency: product.currency,
    contents: product.contents,
  })
}

/**
 * Track AddToCart
 */
export function trackAddToCart(product: {
  content_name: string
  content_ids: string[]
  content_type: 'product'
  value: number
  currency: string
  contents: Array<{
    id: string
    quantity: number
    item_price: number
  }>
}) {
  trackEvent('AddToCart', {
    content_name: product.content_name,
    content_ids: product.content_ids,
    content_type: product.content_type,
    value: product.value,
    currency: product.currency,
    contents: product.contents,
  })
}

/**
 * Track InitiateCheckout
 */
export function trackInitiateCheckout(data: {
  value: number
  currency: string
  contents: Array<{
    id: string
    quantity: number
    item_price: number
  }>
  num_items: number
}) {
  trackEvent('InitiateCheckout', {
    value: data.value,
    currency: data.currency,
    contents: data.contents,
    num_items: data.num_items,
  })
}

/**
 * Track AddPaymentInfo
 */
export function trackAddPaymentInfo(data: {
  value: number
  currency: string
  contents: Array<{
    id: string
    quantity: number
    item_price: number
  }>
}) {
  trackEvent('AddPaymentInfo', {
    value: data.value,
    currency: data.currency,
    contents: data.contents,
  })
}

/**
 * Track Purchase - Most important event!
 */
export function trackPurchase(data: {
  value: number
  currency: string
  contents: Array<{
    id: string
    quantity: number
    item_price: number
  }>
  order_id: string
  num_items: number
}) {
  trackEvent('Purchase', {
    value: data.value,
    currency: data.currency,
    contents: data.contents,
    order_id: data.order_id,
    num_items: data.num_items,
  })
}

/**
 * Track Search
 */
export function trackSearch(searchString: string) {
  trackEvent('Search', {
    search_string: searchString,
  })
}

/**
 * Track ViewCategory
 */
export function trackViewCategory(categoryName: string) {
  trackEvent('ViewCategory', {
    content_name: categoryName,
    content_category: categoryName,
  })
}

/**
 * Track AddToWishlist
 */
export function trackAddToWishlist(product: {
  content_name: string
  content_ids: string[]
  content_type: 'product'
  value: number
  currency: string
}) {
  trackEvent('AddToWishlist', {
    content_name: product.content_name,
    content_ids: product.content_ids,
    content_type: product.content_type,
    value: product.value,
    currency: product.currency,
  })
}

