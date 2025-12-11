/**
 * Unified Analytics Utility
 * Manages event tracking for both Meta Pixel and Google Tag Manager (GA4)
 */

import * as GTM from './gtm'

// Re-export type for window global augmenting if needed, though GTM handles its own.
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
 * Initialize Analytics
 */
export function initAnalytics(): boolean {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    return true
  }
  return false
}

// Initializer alias for backwards compatibility
export const initMetaPixel = initAnalytics

/**
 * Track a custom event to both platforms
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  // Track Meta Pixel
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params)
    } catch (error) {
      console.error('Error tracking Meta Pixel event:', error)
    }
  }

  // Track GTM (Generic event fallback)
  GTM.pushToDataLayer({
    event: eventName,
    ...params
  })
}

/**
 * Track Custom Event (Meta only mostly, but we push generic to GTM)
 */
export function trackCustom(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, params)
  }
  GTM.pushToDataLayer({
    event: eventName,
    ...params
  })
}

/**
 * Track PageView
 */
export function trackPageView() {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView')
  }
  // GTM usually handles page views automatically via the History Change trigger or base tag,
  // but if manual tracking is needed for SPA transitions not caught:
  GTM.pushToDataLayer({ event: 'page_view' })
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
  // Extra fields for mapping
  id?: string
  nom?: string
  prix?: number
  categorie?: string
  contents?: Array<{
    id: string
    quantity: number
    item_price: number
  }>
}) {
  // META
  trackEvent('ViewContent', {
    content_name: product.content_name,
    content_ids: product.content_ids,
    content_type: product.content_type,
    value: product.value,
    currency: product.currency,
    contents: product.contents,
  })

  // GTM (GA4 view_item)
  // We explicitly map the props necessary for GTM
  GTM.gtmViewItem({
    id: product.content_ids[0] || product.id,
    nom: product.content_name,
    prix: product.value,
    categorie: product.categorie || 'General', // Fallback
    quantity: 1
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
  // Extra fields for GTM
  id?: string
  nom?: string
  prix?: number
  categorie?: string
  quantity?: number
  contents: Array<{
    id: string
    quantity: number
    item_price: number
  }>
}) {
  // META
  trackEvent('AddToCart', {
    content_name: product.content_name,
    content_ids: product.content_ids,
    content_type: product.content_type,
    value: product.value,
    currency: product.currency,
    contents: product.contents,
  })

  // GTM (GA4 add_to_cart)
  GTM.gtmAddToCart({
    id: product.content_ids[0],
    nom: product.content_name,
    prix: product.value, // Unit price ideally, but total value passed usually? check source
    // In many implementations 'value' is total. For unit price we need it separate.
    // Assuming passed 'value' is unit price * quantity if it comes from single add.
    // We'll use the first item in 'contents' for unit price if available.
    quantity: product.contents?.[0]?.quantity || 1,
    categorie: product.categorie || 'General'
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
    // Extra fields
    nom?: string
  }>
  num_items: number
}) {
  // META
  trackEvent('InitiateCheckout', {
    value: data.value,
    currency: data.currency,
    contents: data.contents,
    num_items: data.num_items,
  })

  // GTM (GA4 begin_checkout)
  // We need full product details for GA4 items array, typically 'contents' from Meta only supports id/quantity/price.
  // We will map what we have.
  const gtmItems = data.contents.map(item => ({
    id: item.id,
    nom: item.nom || 'Product ' + item.id, // Fallback name if key is missing
    prix: item.item_price,
    quantity: item.quantity
  }))

  GTM.gtmBeginCheckout(gtmItems, data.value)
}

/**
 * Track AddPaymentInfo (Payment step or submission)
 */
export function trackAddPaymentInfo(data: {
  value: number
  currency: string
  contents: Array<{
    id: string
    quantity: number
    item_price: number
  }>
  payment_type?: string
}) {
  // META
  trackEvent('AddPaymentInfo', {
    value: data.value,
    currency: data.currency,
    contents: data.contents,
  })

  // GTM
  const gtmItems = data.contents.map(item => ({
    id: item.id,
    nom: 'Product ' + item.id,
    prix: item.item_price,
    quantity: item.quantity
  }))

  GTM.gtmAddPaymentInfo(gtmItems, data.value, data.payment_type || 'unspecified')
}

/**
 * Track Purchase
 */
export function trackPurchase(data: {
  value: number
  currency: string
  contents: Array<{
    id: string
    quantity: number
    item_price: number
    nom?: string // Helpful if we can pass this
  }>
  order_id: string
  num_items: number
  tax?: number
  shipping?: number
}) {
  // META
  trackEvent('Purchase', {
    value: data.value,
    currency: data.currency,
    contents: data.contents,
    order_id: data.order_id,
    num_items: data.num_items,
  })

  // GTM
  const gtmItems = data.contents.map(item => ({
    id: item.id,
    nom: item.nom || 'Product ' + item.id,
    prix: item.item_price,
    quantity: item.quantity
  }))

  GTM.gtmPurchase({
    id: data.order_id,
    value: data.value,
    tax: data.tax,
    shipping: data.shipping,
    items: gtmItems
  })
}

/**
 * Track Search
 */
export function trackSearch(searchString: string) {
  // META
  trackEvent('Search', {
    search_string: searchString,
  })

  // GTM
  GTM.gtmSearch(searchString)
}

/**
 * Track ViewCategory
 */
export function trackViewCategory(categoryName: string, products: any[] = []) {
  // META
  trackCustom('ViewCategory', {
    content_name: categoryName,
    content_category: categoryName,
  })

  // GTM
  GTM.gtmViewItemList(categoryName, products)
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
  // Extra
  id?: string
}) {
  // META
  trackEvent('AddToWishlist', {
    content_name: product.content_name,
    content_ids: product.content_ids,
    content_type: product.content_type,
    value: product.value,
    currency: product.currency,
  })

  // GTM
  GTM.gtmAddToWishlist({
    id: product.content_ids[0] || product.id,
    nom: product.content_name,
    prix: product.value,
    quantity: 1
  })
}


