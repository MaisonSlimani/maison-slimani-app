'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Facebook, Instagram } from 'lucide-react'

const Footer = () => {
  const [settings, setSettings] = useState<{
    email_entreprise?: string
    telephone?: string
    adresse?: string
    facebook?: string
    instagram?: string
  }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            const data = result.data
            setSettings({
              email_entreprise: (data.email_entreprise && data.email_entreprise.trim()) || '',
              telephone: (data.telephone && data.telephone.trim()) || '',
              adresse: (data.adresse && data.adresse.trim()) || '',
              facebook: (data.facebook && data.facebook.trim()) || '',
              instagram: (data.instagram && data.instagram.trim()) || '',
            })
          } else {
            console.warn('Settings API returned unsuccessful response:', result)
            // Set empty settings if API fails
            setSettings({
              email_entreprise: '',
              telephone: '',
              adresse: '',
              facebook: '',
              instagram: '',
            })
          }
        } else {
          console.error('Settings API error:', response.status, response.statusText)
          // Set empty settings on error
          setSettings({
            email_entreprise: '',
            telephone: '',
            adresse: '',
            facebook: '',
            instagram: '',
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        // Set empty settings on error
        setSettings({
          email_entreprise: '',
          telephone: '',
          adresse: '',
          facebook: '',
          instagram: '',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  return (
    <footer className="bg-charbon text-ecru py-12 md:pb-12 pb-16 w-full">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-serif mb-4">
              Maison <span className="text-dore">Slimani</span>
            </h3>
            <p className="text-ecru/70 text-sm leading-relaxed mb-4">
              L'excellence du cuir marocain depuis trois générations
            </p>
            {(settings.facebook || settings.instagram) && (
              <div className="flex gap-3 mt-6">
                {settings.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ecru/80 hover:text-dore transition-all p-2 hover:bg-ecru/20 rounded-lg border border-ecru/20 hover:border-dore/50"
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                )}
                {settings.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ecru/80 hover:text-dore transition-all p-2 hover:bg-ecru/20 rounded-lg border border-ecru/20 hover:border-dore/50"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-dore">Navigation</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-ecru/80 hover:text-dore transition-colors text-sm">
                Accueil
              </Link>
              <Link href="/boutique" className="text-ecru/80 hover:text-dore transition-colors text-sm">
                Boutique
              </Link>
              <Link href="/maison" className="text-ecru/80 hover:text-dore transition-colors text-sm">
                La Maison
              </Link>
              <Link href="/contact" className="text-ecru/80 hover:text-dore transition-colors text-sm">
                Contact
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-dore">Informations</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/faq" className="text-ecru/80 hover:text-dore transition-colors text-sm">
                FAQ
              </Link>
              <Link href="/politiques" className="text-ecru/80 hover:text-dore transition-colors text-sm">
                Politique de Retour
              </Link>
            </nav>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-dore">Contact</h4>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-ecru/20 rounded animate-pulse"></div>
                <div className="h-4 bg-ecru/20 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <>
                {settings.email_entreprise && settings.email_entreprise.trim() && (
                  <a 
                    href={`mailto:${settings.email_entreprise}`}
                    className="text-ecru/80 hover:text-dore transition-colors text-sm block mb-2"
                  >
                    {settings.email_entreprise}
                  </a>
                )}
                {settings.telephone && settings.telephone.trim() && (
                  <a 
                    href={`tel:${settings.telephone.replace(/\s/g, '')}`}
                    className="text-ecru/80 hover:text-dore transition-colors text-sm block mb-2"
                  >
                    {settings.telephone}
                  </a>
                )}
                {settings.adresse && settings.adresse.trim() && (
                  <p className="text-ecru/70 text-sm mb-2">
                    {settings.adresse}
                  </p>
                )}
                {(!settings.email_entreprise || !settings.email_entreprise.trim()) && 
                 (!settings.telephone || !settings.telephone.trim()) && 
                 (!settings.adresse || !settings.adresse.trim()) && (
                  <p className="text-ecru/60 text-sm italic">
                    Informations de contact à venir
                  </p>
                )}
              </>
            )}
            <p className="text-ecru/70 text-sm mb-2 mt-4">
              Livraison gratuite dans tout le Maroc
            </p>
            <p className="text-ecru/70 text-sm">
              Politique de retour : 7 jours
            </p>
          </div>
        </div>
        
        <div className="border-t border-ecru/20 pt-6 text-center text-ecru/60 text-xs">
          © {new Date().getFullYear()} Maison Slimani. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}

export default Footer

