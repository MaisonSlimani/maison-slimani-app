'use client'

import { useState, useEffect } from 'react'
import { SiteSettings } from '@/types'

export function useContactData() {
  const [settings, setSettings] = useState<SiteSettings>({
    email_entreprise: '',
    telephone: '',
    whatsapp: '',
    adresse: '',
    facebook: '',
    instagram: '',
    description: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setSettings({
              email_entreprise: result.data.email_entreprise || '',
              telephone: result.data.telephone || '',
              whatsapp: result.data.whatsapp || '',
              adresse: result.data.adresse || '',
              facebook: result.data.facebook || '',
              instagram: result.data.instagram || '',
              description: result.data.description || '',
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
  }, [])

  return { settings, loading }
}
