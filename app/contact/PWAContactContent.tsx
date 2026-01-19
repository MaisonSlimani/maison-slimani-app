'use client'

import { useEffect, useState } from 'react'
import ContactForm from './ContactForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PWAContactContent() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    email_entreprise: '',
    telephone: '',
    adresse: '',
  })

  useEffect(() => {
    async function getSettings() {
      try {
        const response = await fetch('/api/settings')
        if (!response.ok) {
          console.error('Settings API error:', response.status, response.statusText)
          return
        }

        const result = await response.json()
        if (result.success && result.data) {
          const data = result.data
          setSettings({
            email_entreprise: (data.email_entreprise && data.email_entreprise.trim()) || '',
            telephone: (data.telephone && data.telephone.trim()) || '',
            adresse: (data.adresse && data.adresse.trim()) || '',
          })
        } else {
          console.warn('Settings API returned no data:', result)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres:', error)
      } finally {
        setLoading(false)
      }
    }

    getSettings()
  }, [])

  return (
    <div className="w-full min-h-screen pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/menu" className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-serif text-foreground">Contact</h1>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        <ContactForm settings={settings} loading={loading} />
      </div>
    </div>
  )
}

