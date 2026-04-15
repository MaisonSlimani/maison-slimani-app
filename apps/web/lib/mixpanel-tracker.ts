'use client'

import { core } from './mixpanel/core'
import * as productTracking from './mixpanel/product'
import * as cartTracking from './mixpanel/cart'
import * as checkoutTracking from './mixpanel/checkout'

/**
 * Mixpanel Analytics Tracker Entry Point
 * Refactored to adhere to the 300-line rule via modular sub-modules.
 */
class LegacyMixpanelTracker {
  init() {
    core.init()
  }

  track(event: string, props?: Record<string, unknown>) {
    core.track(event, props)
  }

  // Backward compatibility delegates
  trackPageView(pageUrl?: string, pageTitle?: string) {
    core.track('Page Viewed', { page_url: pageUrl, page_title: pageTitle })
  }

  trackProductViewed = productTracking.trackProductViewed
  trackProductClicked = productTracking.trackProductClicked
  trackProductListViewed = productTracking.trackProductListViewed
  trackSizeSelected = productTracking.trackSizeSelected

  trackAddToCart = cartTracking.trackAddToCart
  trackRemoveFromCart = cartTracking.trackRemoveFromCart
  trackAddToWishlist = cartTracking.trackAddToWishlist
  
  trackCartViewed(items: unknown[], total: number) {
    core.track('Cart Viewed', { num_items: items.length, total_value: total })
  }

  trackCartQuantityUpdated(product: { id: string; name: string }, oldVal: number, newVal: number) {
    core.track('Cart Quantity Updated', { 
      product_id: product.id, 
      product_name: product.name,
      old_quantity: oldVal,
      new_quantity: newVal 
    })
  }

  trackCheckoutStarted = checkoutTracking.trackCheckoutStarted
  trackCheckoutStepViewed = checkoutTracking.trackCheckoutStepViewed
  trackOrderCompleted = checkoutTracking.trackOrderCompleted

  trackError(errorType: string, errorMessage: string, extraProps?: Record<string, unknown>) {
    core.track('Error Occurred', { error_type: errorType, error_message: errorMessage, ...extraProps })
  }

  trackScrollDepth(depth: number) {
    core.track('Scroll Depth Reached', { depth_percentage: depth })
  }

  trackTimeOnPage(seconds: number, pageUrl?: string) {
    core.track('Time On Page', { duration_seconds: seconds, page_url: pageUrl })
  }

  trackSlowPageLoad(loadTimeMs: number, pageUrl?: string) {
    core.track('Slow Page Load', { load_time_ms: loadTimeMs, page_url: pageUrl })
  }

  setUserProfile(profile: Record<string, unknown>) {
    core.setUserProfile(profile)
  }
}

export const tracker = new LegacyMixpanelTracker()
