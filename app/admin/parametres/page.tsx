'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function AdminParametresPage() {
  const [formData, setFormData] = useState({
    email_entreprise: 'contact@maisonslimani.com',
    telephone: '+212 5XX-XXXXXX',
    adresse: 'Casablanca, Maroc',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Sauvegarder dans Supabase (table parametres ou configuration)
    toast.success('Paramètres sauvegardés')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif mb-2">Paramètres</h1>
        <p className="text-muted-foreground">Gérez les paramètres de votre site</p>
      </div>

      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-serif mb-6">Coordonnées de l'entreprise</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email_entreprise">Email</Label>
            <Input
              id="email_entreprise"
              type="email"
              value={formData.email_entreprise}
              onChange={(e) => setFormData({ ...formData, email_entreprise: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <Button type="submit">Sauvegarder</Button>
        </form>
      </Card>
    </div>
  )
}

