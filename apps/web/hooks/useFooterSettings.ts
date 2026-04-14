'use client'

import { useState, useEffect } from 'react'
import { SiteSettings } from '@maison/domain'
import { apiFetch, ENDPOINTS } from '@/lib/api/client'

export function useFooterSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    companyEmail: '',
    phone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    address: '',
    description: '',
    metaPixelCode: null,
    gtmHeader: null,
    gtmBody: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await apiFetch<SiteSettings>(ENDPOINTS.SETTINGS)
        if (result.success && result.data) {
          setSettings(result.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  return { settings, loading }
}
