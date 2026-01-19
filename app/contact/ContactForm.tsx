'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'

import { Skeleton } from '@/components/ui/skeleton'

interface ContactFormProps {
  settings: {
    email_entreprise: string
    telephone: string
    adresse: string
  }
  loading?: boolean
}

export default function ContactForm({ settings, loading = false }: ContactFormProps) {
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    message: '',
  })

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

  if (loading) {
    return (
      <>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 text-center space-y-4">
              <Skeleton className="w-8 h-8 mx-auto rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 mx-auto" />
                <Skeleton className="h-3 w-32 mx-auto" />
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-8 bg-secondary/40 mt-12 relative overflow-hidden">
          {/* Form Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-64 mb-6" /> {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      {((settings.email_entreprise && settings.email_entreprise.trim()) ||
        (settings.telephone && settings.telephone.trim()) ||
        (settings.adresse && settings.adresse.trim())) && (
          <div className="grid md:grid-cols-3 gap-6">
            {settings.email_entreprise && settings.email_entreprise.trim() && (
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

            {settings.telephone && settings.telephone.trim() && (
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

            {settings.adresse && settings.adresse.trim() && (
              <Card className="p-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-medium mb-2">Adresse</h3>
                <p className="text-sm text-muted-foreground">{settings.adresse}</p>
              </Card>
            )}
          </div>
        )}

      <Card className="p-8 bg-secondary/40">
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
    </>
  )
}

