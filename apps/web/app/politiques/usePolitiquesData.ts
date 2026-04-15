'use client'

import { useState, useEffect } from 'react'

export function usePolitiquesData() {
  const [settings, setSettings] = useState({
    email_entreprise: 'support@maisonslimani.ma',
    telephone: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/v1/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setSettings({
              email_entreprise: result.data.email_entreprise || 'support@maisonslimani.ma',
              telephone: result.data.telephone || '',
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
