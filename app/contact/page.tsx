'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const router = useRouter()
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [settings, setSettings] = useState({
    email_entreprise: '',
    telephone: '',
    adresse: '',
  })
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    message: '',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const chargerSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setSettings({
              email_entreprise: result.data.email_entreprise || '',
              telephone: result.data.telephone || '',
              adresse: result.data.adresse || '',
            })
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
      } finally {
        setLoadingSettings(false)
      }
    }

    chargerSettings()
  }, [])

  // SEO Meta Tags
  useEffect(() => {
    // Update title
    document.title = 'Contact - Maison Slimani'
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    const description = 'Contactez Maison Slimani pour toute question sur nos chaussures homme haut de gamme. Service client disponible pour vous accompagner.'
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = description
      document.head.appendChild(meta)
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Contact - Maison Slimani')
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:title')
      meta.content = 'Contact - Maison Slimani'
      document.head.appendChild(meta)
    }

    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', description)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:description')
      meta.content = description
      document.head.appendChild(meta)
    }

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
      ogUrl.setAttribute('content', window.location.href)
    } else {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:url')
      meta.content = window.location.href
      document.head.appendChild(meta)
    }

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      canonical.setAttribute('href', window.location.href)
    } else {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      canonical.setAttribute('href', window.location.href)
      document.head.appendChild(canonical)
    }

    // Add structured data (ContactPage)
    const existingScript = document.getElementById('contact-structured-data')
    if (existingScript) {
      existingScript.remove()
    }
    
    const script = document.createElement('script')
    script.id = 'contact-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact - Maison Slimani',
      description: description,
      url: window.location.href,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: window.location.origin
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Contact',
            item: window.location.href
          }
        ]
      }
    })
    document.head.appendChild(script)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnvoiEnCours(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }

      toast.success('Message envoyé avec succès !')
      setFormData({ nom: '', email: '', telephone: '', message: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi')
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <NavigationDesktop />
      <EnteteMobile />

      <div className="container px-6 py-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <header>
            <h1 className="text-4xl md:text-5xl font-serif mb-4">Contactez-nous</h1>
            <p className="text-xl text-muted-foreground">
              Notre équipe est à votre écoute
            </p>
          </header>

          {loadingSettings ? (
            <div className="text-center py-8 text-muted-foreground">Chargement des informations...</div>
          ) : (settings.email_entreprise || settings.telephone || settings.adresse) ? (
            <div className="grid md:grid-cols-3 gap-6">
              {settings.email_entreprise && (
                <Card className="p-6 text-center">
                  <Mail className="w-8 h-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-medium mb-2">Email</h3>
                  <a 
                    href={`mailto:${settings.email_entreprise}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {settings.email_entreprise}
                  </a>
                </Card>
              )}

              {settings.telephone && (
                <Card className="p-6 text-center">
                  <Phone className="w-8 h-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-medium mb-2">Téléphone</h3>
                  <a 
                    href={`tel:${settings.telephone.replace(/\s/g, '')}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {settings.telephone}
                  </a>
                </Card>
              )}

              {settings.adresse && (
                <Card className="p-6 text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-medium mb-2">Adresse</h3>
                  <p className="text-sm text-muted-foreground">{settings.adresse}</p>
                </Card>
              )}
            </div>
          ) : null}

          <Card className="p-8">
            <h2 className="text-2xl font-serif mb-6">Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nom">Nom complet</Label>
                <Input
                  id="nom"
                  required
                  className="mt-2"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="mt-2"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  className="mt-2"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  className="mt-2"
                  placeholder="Décrivez votre demande..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={envoiEnCours}>
                {envoiEnCours ? 'Envoi en cours...' : 'Envoyer le message'}
              </Button>
            </form>
        </Card>
      </motion.div>
    </div>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}

