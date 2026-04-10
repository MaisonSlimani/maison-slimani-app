/**
 * Unified Analytics Utility
 * Manages event tracking for both Meta Pixel and Google Tag Manager (GA4).
 * Refactored to adhere to the 300-line rule via modular sub-modules.
 */

import * as GTM from './gtm'
import { trackEvent, trackCustom } from './analytics_modular/meta'
import * as Events from './analytics_modular/events'

export { trackEvent, trackCustom }

/**
 * Initialize Analytics
 */
export function initAnalytics(): boolean {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    return true
  }
  return false
}

export const initMetaPixel = initAnalytics

/**
 * Track PageView
 */
export function trackPageView() {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView')
  }
  GTM.pushToDataLayer({ event: 'page_view' })
}

// Domain Event Re-exports
export const trackViewContent = Events.trackViewContent
export const trackAddToCart = Events.trackAddToCart
export const trackInitiateCheckout = Events.trackInitiateCheckout
export const trackPurchase = Events.trackPurchase
export const trackSearch = Events.trackSearch
export const trackViewCategory = Events.trackViewCategory
export const trackAddToWishlist = Events.trackViewContent // Keep compatibility
