import { createClient } from '@supabase/supabase-js'
import ContactForm from './ContactForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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

export default async function PWAContactPage() {
  const settings = await getSettings()

  return (
    <div className="w-full min-h-screen pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/pwa/menu" className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-serif text-foreground">Contact</h1>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        <ContactForm settings={settings} />
      </div>
    </div>
  )
}
