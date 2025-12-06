'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface ContactFormProps {
  settings: {
    email_entreprise: string
    telephone: string
    adresse: string
  }
}

export default function ContactForm({ settings }: ContactFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    message: '',
  })

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
    <>
      {((settings.email_entreprise && settings.email_entreprise.trim()) || 
        (settings.telephone && settings.telephone.trim()) || 
        (settings.adresse && settings.adresse.trim())) && (
        <Card className="p-4 space-y-4">
          {settings.email_entreprise && settings.email_entreprise.trim() && (
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-dore mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${settings.email_entreprise}`} className="text-foreground font-medium">
                  {settings.email_entreprise}
                </a>
              </div>
            </div>
          )}
          {settings.telephone && settings.telephone.trim() && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-dore mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <a href={`tel:${settings.telephone}`} className="text-foreground font-medium">
                  {settings.telephone}
                </a>
              </div>
            </div>
          )}
          {settings.adresse && settings.adresse.trim() && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-dore mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="text-foreground font-medium">{settings.adresse}</p>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="p-4 bg-secondary/40">
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
    </>
  )
}

