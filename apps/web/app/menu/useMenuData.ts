'use client'

import { useState, useEffect } from 'react'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { apiFetch, ENDPOINTS } from '@/lib/api/client'
import { SiteSettings } from '@maison/domain'

export function useMenuData() {
  const [socials, setSocials] = useState<{ facebook?: string; instagram?: string }>({})
  const { items: wishlistItems, isLoaded: wishlistLoaded } = useWishlist()

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const result = await apiFetch<SiteSettings>(ENDPOINTS.SETTINGS)
        if (result.success && result.data) {
          setSocials({
            facebook: result.data.facebook || undefined,
            instagram: result.data.instagram || undefined,
          })
        }
      } catch (error) {
        console.error('Error fetching socials:', error)
      }
    }
    fetchSocials()
  }, [])

  return {
    socials,
    wishlistItems,
    wishlistLoaded
  }
}
