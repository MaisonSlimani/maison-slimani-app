'use client'

import { useState, useEffect } from 'react'
import { SiteSettings } from '@maison/domain'

export function useContactData(initialSettings?: SiteSettings | null) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (initialSettings) return initialSettings
    return {
      companyEmail: null,
      phone: null,
      address: null,
      facebook: null,
      instagram: null,
      description: null,
      metaPixelCode: null,
      gtmHeader: null,
      gtmBody: null,
    }
  })
  const [loading, setLoading] = useState(!initialSettings)

  useEffect(() => {
    if (initialSettings) return

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/v1/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setSettings(result.data)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [initialSettings])

  return { settings, loading }
}
