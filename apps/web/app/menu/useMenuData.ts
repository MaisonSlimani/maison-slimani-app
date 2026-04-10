'use client'

import { useEffect, useState } from 'react'
import { useWishlist } from '@/lib/hooks/useWishlist'

export function useMenuData() {
  const [socials, setSocials] = useState<{ facebook?: string; instagram?: string }>({})
  const { items: wishlistItems, isLoaded: wishlistLoaded } = useWishlist()

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setSocials({
              facebook: result.data.facebook,
              instagram: result.data.instagram,
            })
          }
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
