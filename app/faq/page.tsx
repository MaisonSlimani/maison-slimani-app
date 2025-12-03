'use client'

import { useIsPWA } from '@/lib/hooks/useIsPWA'
import { createClient } from '@supabase/supabase-js'
import FAQContent from './FAQContent'
import PWAFAQContent from './PWAFAQContent'
import { useEffect, useState } from 'react'

async function getSettings() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return { email_entreprise: '', telephone: '', whatsapp: '', facebook: '', instagram: '' }
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data } = await supabase
      .from('settings')
      .select('email_entreprise, telephone, whatsapp, facebook, instagram')
      .limit(1)
      .single()
    
    return {
      email_entreprise: data?.email_entreprise || 'Maisondeslimani@gmail.com',
      telephone: data?.telephone || '',
      whatsapp: data?.whatsapp || '',
      facebook: data?.facebook || '',
      instagram: data?.instagram || '',
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return { email_entreprise: 'Maisondeslimani@gmail.com', telephone: '', whatsapp: '', facebook: '', instagram: '' }
  }
}

export default function FAQPage() {
  const { isPWA, isLoading } = useIsPWA()
  const [settings, setSettings] = useState({
    email_entreprise: 'Maisondeslimani@gmail.com',
    telephone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
  })

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  // Show loading state while detecting device
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dore mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Render PWA version
  if (isPWA) {
    return <PWAFAQContent />
  }

  // Render desktop version
  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <div className="container px-6 py-12 max-w-4xl mx-auto">
        <FAQContent settings={settings} />
      </div>
    </div>
  )
}

