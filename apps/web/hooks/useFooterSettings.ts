'use client'

import { useState, useEffect } from 'react'
import { SiteSettings } from '@maison/domain'
import { apiFetch, ENDPOINTS } from '@/lib/api/client'

export function useFooterSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    email_entreprise: '',
    telephone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    adresse: '',
    description: '',
    meta_pixel_code: null,
    google_tag_manager_header: null,
    google_tag_manager_body: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await apiFetch<SiteSettings>(ENDPOINTS.SETTINGS)
        if (result.success && result.data) {
          setSettings(mapToSiteSettings(result.data))
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

function mapToSiteSettings(d: unknown): SiteSettings {
  const data = d as Record<string, string | null | undefined>
  const trim = (val: string | null | undefined) => val?.trim() || ''
  return {
    email_entreprise: trim(data.email_entreprise),
    telephone: trim(data.telephone),
    whatsapp: trim(data.whatsapp),
    adresse: trim(data.adresse),
    facebook: trim(data.facebook),
    instagram: trim(data.instagram),
    description: trim(data.description),
    meta_pixel_code: (data.meta_pixel_code as string | null) || null,
    google_tag_manager_header: (data.google_tag_manager_header as string | null) || null,
    google_tag_manager_body: (data.google_tag_manager_body as string | null) || null,
  }
}
