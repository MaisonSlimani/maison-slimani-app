'use client'

import { useIsPWA } from '@/lib/hooks/useIsPWA'
import ContactContent from './ContactContent'
import PWAContactContent from './PWAContactContent'
import { useEffect, useState } from 'react'

async function getSettings() {
  try {
    const response = await fetch('/api/settings')
    if (!response.ok) {
      console.error('Settings API error:', response.status, response.statusText)
      return { email_entreprise: '', telephone: '', adresse: '' }
    }

    const result = await response.json()
    if (result.success && result.data) {
      const data = result.data
      return {
        email_entreprise: (data.email_entreprise && data.email_entreprise.trim()) || '',
        telephone: (data.telephone && data.telephone.trim()) || '',
        adresse: (data.adresse && data.adresse.trim()) || '',
      }
    }

    console.warn('Settings API returned no data:', result)
    return { email_entreprise: '', telephone: '', adresse: '' }
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return { email_entreprise: '', telephone: '', adresse: '' }
  }
}

export default function ContactPage() {
  const { isPWA, isLoading } = useIsPWA()
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [settings, setSettings] = useState({
    email_entreprise: '',
    telephone: '',
    adresse: '',
  })

  useEffect(() => {
    getSettings().then((data) => {
      setSettings(data)
      setLoadingSettings(false)
    })
  }, [])

  // Render PWA version
  if (!isLoading && isPWA) {
    return <PWAContactContent />
  }

  // Render desktop version
  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <div className="container px-6 py-12 max-w-4xl mx-auto">
        <ContactContent settings={settings} loading={loadingSettings} />
      </div>
    </div>
  )
}
