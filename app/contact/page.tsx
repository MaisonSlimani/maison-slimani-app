import { createClient } from '@supabase/supabase-js'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import ContactContent from './ContactContent'

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

export default async function ContactPage() {
  const settings = await getSettings()

  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <NavigationDesktop />
      <EnteteMobile />

      <div className="container px-6 py-12 max-w-4xl mx-auto">
        <ContactContent settings={settings} />
      </div>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}
