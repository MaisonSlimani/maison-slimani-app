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
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    message: '',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
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

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-4 text-primary" />
              <h3 className="font-medium mb-2">Email</h3>
              <p className="text-sm text-muted-foreground">contact@maisonslimani.com</p>
            </Card>

            <Card className="p-6 text-center">
              <Phone className="w-8 h-8 mx-auto mb-4 text-primary" />
              <h3 className="font-medium mb-2">Téléphone</h3>
              <p className="text-sm text-muted-foreground">+212 5XX-XXXXXX</p>
            </Card>

            <Card className="p-6 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-4 text-primary" />
              <h3 className="font-medium mb-2">Adresse</h3>
              <p className="text-sm text-muted-foreground">Casablanca, Maroc</p>
            </Card>
          </div>

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

