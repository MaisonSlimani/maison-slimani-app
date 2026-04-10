'use client'

import { useState, useEffect } from 'react'
import { SiteSettings } from '@/types'

export function useFooterSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    email_entreprise: '',
    telephone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    adresse: '',
    description: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings')
        const result = await res.json()
        if (result.success && result.data) {
          const d = result.data
          setSettings({
            email_entreprise: d.email_entreprise?.trim() || '',
            telephone: d.telephone?.trim() || '',
            whatsapp: d.whatsapp?.trim() || '',
            adresse: d.adresse?.trim() || '',
            facebook: d.facebook?.trim() || '',
            instagram: d.instagram?.trim() || '',
            description: d.description?.trim() || ''
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return { settings, loading }
}
