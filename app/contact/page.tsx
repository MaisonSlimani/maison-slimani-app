'use client'

import { useIsPWA } from '@/lib/hooks/useIsPWA'
import { createClient } from '@supabase/supabase-js'
import ContactContent from './ContactContent'
import PWAContactContent from './PWAContactContent'
import { useEffect, useState } from 'react'

async function getSettings() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return { email_entreprise: '', telephone: '', adresse: '' }
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data } = await supabase
      .from('settings')
      .select('email_entreprise, telephone, adresse')
      .limit(1)
      .single()
    
    return {
      email_entreprise: data?.email_entreprise || '',
      telephone: data?.telephone || '',
      adresse: data?.adresse || '',
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return { email_entreprise: '', telephone: '', adresse: '' }
  }
}

export default function ContactPage() {
  const { isPWA, isLoading } = useIsPWA()
  const [settings, setSettings] = useState({
    email_entreprise: '',
    telephone: '',
    adresse: '',
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
    return <PWAContactContent />
  }

  // Render desktop version
  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <div className="container px-6 py-12 max-w-4xl mx-auto">
        <ContactContent settings={settings} />
      </div>
    </div>
  )
}
