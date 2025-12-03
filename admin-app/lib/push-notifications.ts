// Web Push Notification Registration for Admin App
// Uses Web Push API (VAPID) for browser-based push notifications

import { createClient } from './supabase/client'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

// Convert VAPID public key from base64 to Uint8Array
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  if (typeof window === 'undefined') return new Uint8Array()
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length))
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Ensure service worker is registered
const ensurePushServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported on this device.')
  }
  
  let registration = await navigator.serviceWorker.getRegistration('/sw.js')
  if (!registration) {
    await navigator.serviceWorker.register('/sw.js')
    registration = await navigator.serviceWorker.ready
  }
  return registration
}

// Get admin user identifier (using 'admin' as fixed identifier)
const getAdminUserId = (): string => {
  // Use fixed 'admin' identifier for all admin users
  // In the future, this could be replaced with actual admin email or ID
  return 'admin'
}

// Platform identifier
const PLATFORM = 'admin-web'

/**
 * Register device for push notifications using Web Push API
 */
export async function registerPushNotifications(): Promise<void> {
  try {
    // Check support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported on this browser')
      return
    }
    
    if (!VAPID_PUBLIC_KEY) {
      console.error('Missing VAPID public key. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY in environment variables.')
      return
    }

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('Push notification permission denied')
      return
    }

    // Register service worker
    const registration = await ensurePushServiceWorker()
    
    // Get or create subscription
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      })
    }

    // Store subscription directly in Supabase database
    // No edge function needed - RLS policies allow authenticated admins to insert
    const supabase = createClient()
    const { error } = await supabase
      .from('user_push_subscriptions')
      .upsert(
        {
          user_id: getAdminUserId(),
          platform: PLATFORM,
          subscription: subscription.toJSON(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,platform',
        }
      )

    if (error) {
      console.error('Error storing push subscription:', error)
      throw new Error(`Failed to store subscription: ${error.message}`)
    }

    console.log('✅ Push notification subscription registered successfully')
  } catch (error) {
    console.error('❌ Error registering push notifications:', error)
    throw error
  }
}

/**
 * Unregister push notifications
 */
export async function unregisterPushNotifications(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js')
    const existing = await registration?.pushManager.getSubscription()
    
    if (existing) {
      await existing.unsubscribe()
    }

    // Remove from Supabase directly
    // No edge function needed - RLS policies allow authenticated admins to delete
    const supabase = createClient()
    const { error } = await supabase
      .from('user_push_subscriptions')
      .delete()
      .eq('user_id', getAdminUserId())
      .eq('platform', PLATFORM)

    if (error) {
      console.error('Error removing push subscription:', error)
      throw new Error(`Failed to remove subscription: ${error.message}`)
    }

    console.log('✅ Push notification subscription removed')
  } catch (error) {
    console.error('❌ Error unregistering push notifications:', error)
    throw error
  }
}

/**
 * Check if push notifications are currently registered
 */
export async function isPushNotificationRegistered(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false
    }

    const registration = await navigator.serviceWorker.getRegistration('/sw.js')
    const subscription = await registration?.pushManager.getSubscription()
    
    return !!subscription
  } catch (error) {
    console.error('Error checking push notification registration:', error)
    return false
  }
}

/**
 * Get current push token status
 */
export async function getPushTokenStatus(): Promise<{
  registered: boolean
  token?: string
  device_type?: string
}> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { registered: false }
    }

    const registration = await navigator.serviceWorker.getRegistration('/sw.js')
    const subscription = await registration?.pushManager.getSubscription()
    
    if (!subscription) {
      return { registered: false }
    }

    // Get subscription from database to verify it's stored
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_push_subscriptions')
      .select('id, platform')
      .eq('user_id', getAdminUserId())
      .eq('platform', PLATFORM)
      .maybeSingle()

    if (error || !data) {
      return { registered: false }
    }

    return {
      registered: true,
      device_type: 'web',
    }
  } catch (error) {
    console.error('Error getting push token status:', error)
    return { registered: false }
  }
}
