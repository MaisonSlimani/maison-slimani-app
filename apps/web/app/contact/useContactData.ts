'use client'

import { useState, useEffect } from 'react'
import { SiteSettings } from '@maison/domain'

export function useContactData(initialSettings?: SiteSettings | null) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (initialSettings) return initialSettings
    return {
      email_entreprise: null,
      telephone: null,
      adresse: null,
      facebook: null,
      instagram: null,
      description: null,
      meta_pixel_code: null,
      google_tag_manager_header: null,
      google_tag_manager_body: null,
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
            setSettings({
              email_entreprise: result.data.email_entreprise || null,
              telephone: result.data.telephone || null,
              adresse: result.data.adresse || null,
              facebook: result.data.facebook || null,
              instagram: result.data.instagram || null,
              description: result.data.description || null,
              meta_pixel_code: result.data.meta_pixel_code || null,
              google_tag_manager_header: result.data.google_tag_manager_header || null,
              google_tag_manager_body: result.data.google_tag_manager_body || null,
            })
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
