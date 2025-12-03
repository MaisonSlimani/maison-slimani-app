'use client'

import { useEffect } from 'react'
import AdminBottomNav from '@/components/admin-pwa/BottomNav'
import AdminStickyHeader from '@/components/admin-pwa/StickyHeader'

export default function PWALayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Register for push notifications when layout loads
  useEffect(() => {
    import('@/lib/push-notifications').then(({ registerPushNotifications }) => {
      registerPushNotifications().catch((error) => {
        console.error('Error registering push notifications:', error)
      })
    })
  }, [])

  return (
    <>
      <AdminStickyHeader />
      <main className="flex-1 pb-16">
        {children}
      </main>
      <AdminBottomNav />
    </>
  )
}

