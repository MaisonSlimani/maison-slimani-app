'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect /pwa to / (unified URLs)
 * This maintains backward compatibility for old /pwa links
 */
export default function PWAPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect immediately without showing anything
    if (typeof window !== 'undefined') {
      router.replace('/')
    }
  }, [router])

  // Return null to show nothing while redirecting
  return null
}
