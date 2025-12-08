'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function AdminParametresPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    email_entreprise: '',
    telephone: '',
    adresse: '',
    description: '',
  })

  useEffect(() => {
    const chargerParametres = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (!response.ok) throw new Error('Erreur lors du chargement')
        
        const result = await response.json()
        if (result.data) {
          setFormData({
            email_entreprise: result.data.email_entreprise || '',
            telephone: result.data.telephone || '',
            adresse: result.data.adresse || '',
            description: result.data.description || '',
          })
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
        toast.error('Erreur lors du chargement des paramètres')
      } finally {
        setLoading(false)
      }
    }

    chargerParametres()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la sauvegarde'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json()
            errorMessage = error.error || errorMessage
          }
        } catch {
          // If parsing fails, use default error message
        }
        throw new Error(errorMessage)
      }

      toast.success('Paramètres sauvegardés avec succès')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif mb-2">Paramètres</h1>
          <p className="text-muted-foreground">Gérez les paramètres de votre site</p>
        </div>
        <Card className="p-6 bg-card border-border">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dore mx-auto"></div>
            <p className="text-muted-foreground mt-4">Chargement...</p>
          </div>
        </Card>
      </div>
    )
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

          <Button type="submit" disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

