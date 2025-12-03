'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function AdminSocialsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    facebook: '',
    instagram: '',
    meta_pixel_code: '',
  })

  useEffect(() => {
    const chargerSocials = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (!response.ok) throw new Error('Erreur lors du chargement')
        
        const result = await response.json()
        if (result.data) {
          setFormData({
            facebook: result.data.facebook || '',
            instagram: result.data.instagram || '',
            meta_pixel_code: result.data.meta_pixel_code || '',
          })
        }
      } catch (error) {
        console.error('Erreur lors du chargement des réseaux sociaux:', error)
        toast.error('Erreur lors du chargement des réseaux sociaux')
      } finally {
        setLoading(false)
      }
    }

    chargerSocials()
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

      toast.success('Réseaux sociaux sauvegardés avec succès')
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
          <h1 className="text-3xl font-serif mb-2">Socials</h1>
          <p className="text-muted-foreground">Gérez vos réseaux sociaux et Meta Pixel</p>
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
        <h1 className="text-3xl font-serif mb-2">Socials</h1>
        <p className="text-muted-foreground">Gérez vos réseaux sociaux et Meta Pixel</p>
      </div>

      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-serif mb-6">Réseaux sociaux</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="facebook">Facebook URL</Label>
            <Input
              id="facebook"
              type="url"
              placeholder="https://www.facebook.com/votre-page"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
            />
            <p className="text-sm text-muted-foreground mt-1">
              L'URL complète de votre page Facebook
            </p>
          </div>
          
          <div>
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input
              id="instagram"
              type="url"
              placeholder="https://www.instagram.com/votre-compte"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            />
            <p className="text-sm text-muted-foreground mt-1">
              L'URL complète de votre profil Instagram
            </p>
          </div>

          <div className="pt-4 border-t">
            <div>
              <Label htmlFor="meta_pixel_code">Meta Pixel Code</Label>
              <Textarea
                id="meta_pixel_code"
                rows={8}
                placeholder="<!-- Meta Pixel Code -->&#10;&lt;script&gt;&#10;...&#10;&lt;/script&gt;&#10;&lt;noscript&gt;...&lt;/noscript&gt;"
                value={formData.meta_pixel_code}
                onChange={(e) => setFormData({ ...formData, meta_pixel_code: e.target.value })}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Collez ici le code complet de votre Meta Pixel (incluant les balises &lt;script&gt; et &lt;noscript&gt;)
              </p>
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

