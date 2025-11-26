'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function PWAContactPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    email_entreprise: 'contact@maisonslimani.com',
    telephone: '+212 5XX-XXXXXX',
    adresse: 'Casablanca, Maroc',
  })
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    message: '',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    
    const chargerSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.data) {
            setSettings({
              email_entreprise: result.data.email_entreprise || 'contact@maisonslimani.com',
              telephone: result.data.telephone || '+212 5XX-XXXXXX',
              adresse: result.data.adresse || 'Casablanca, Maroc',
            })
          }
        }
      } catch (error) {
        console.error('Erreur:', error)
      }
    }

    chargerSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi')
      }

      toast.success('Message envoyé avec succès')
      setFormData({ nom: '', email: '', telephone: '', message: '' })
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="text-2xl font-serif text-foreground">Contact</h1>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Contact Info */}
        <Card className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-dore mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <a href={`mailto:${settings.email_entreprise}`} className="text-foreground font-medium">
                {settings.email_entreprise}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-dore mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <a href={`tel:${settings.telephone}`} className="text-foreground font-medium">
                {settings.telephone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-dore mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Adresse</p>
              <p className="text-foreground font-medium">{settings.adresse}</p>
            </div>
          </div>
        </Card>

        {/* Contact Form */}
        <Card className="p-4">
          <h2 className="text-lg font-serif mb-4">Envoyer un message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Votre nom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="+212 6XX-XXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Votre message..."
                rows={5}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-dore text-charbon hover:bg-dore/90"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

