'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function AdminPWASettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    email_entreprise: '',
    telephone: '',
    adresse: '',
    description: '',
  })

  useEffect(() => {
    const verifierSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        if (!data.authenticated) {
          router.push('/login')
          return
        }
      } catch (error) {
        router.push('/login')
        return
      }
    }

    verifierSession()
    chargerSettings()
  }, [router])

  const chargerSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Erreur')
      const result = await response.json()
      if (result.data) {
        setSettings({
          email_entreprise: result.data.email_entreprise || '',
          telephone: result.data.telephone || '',
          adresse: result.data.adresse || '',
          description: result.data.description || '',
        })
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la sauvegarde'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          }
        } catch {
          // If parsing fails, use default error message
        }
        throw new Error(errorMessage)
      }
      
      toast.success('Paramètres sauvegardés')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="px-4 py-8 text-center text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        <h1 className="text-2xl font-serif text-foreground">Paramètres</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email_entreprise">Email entreprise</Label>
              <Input
                id="email_entreprise"
                type="email"
                value={settings.email_entreprise}
                onChange={(e) => setSettings({ ...settings, email_entreprise: e.target.value })}
                placeholder="exemple@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                value={settings.telephone}
                onChange={(e) => setSettings({ ...settings, telephone: e.target.value })}
                placeholder="Numéro de téléphone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={settings.adresse}
                onChange={(e) => setSettings({ ...settings, adresse: e.target.value })}
                placeholder="Adresse complète"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Description..."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-dore text-charbon hover:bg-dore/90"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  )
}

