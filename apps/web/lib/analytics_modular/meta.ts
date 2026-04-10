/**
 * Meta Pixel Base Tracking
 * Uses the global Window.fbq declaration from types/globals.d.ts
 */

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params)
    } catch (error) {
      console.error('Meta Pixel error:', error)
    }
  }
}

export function trackCustom(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, params)
  }
}
