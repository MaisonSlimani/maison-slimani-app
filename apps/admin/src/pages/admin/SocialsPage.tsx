import { useState, useEffect } from 'react'
import { Card, LuxuryLoading } from '@maison/ui'
import { toast } from 'sonner'
import { settingsRepo } from '@/lib/repositories'
import { SocialsForm, SocialsFormData } from '@/components/settings/SocialsForm'

const DEFAULT_FORM: SocialsFormData = { facebook: '', instagram: '', meta_pixel_code: '', google_tag_manager_header: '', google_tag_manager_body: '' }

export default function SocialsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<SocialsFormData>(DEFAULT_FORM)

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await settingsRepo.getSettings()
        if (settings) {
          setFormData({
            facebook: settings.facebook ?? '',
            instagram: settings.instagram ?? '',
            meta_pixel_code: settings.meta_pixel_code ?? '',
            google_tag_manager_header: settings.google_tag_manager_header ?? '',
            google_tag_manager_body: settings.google_tag_manager_body ?? '',
          })
        }
      } catch { toast.error('Erreur lors du chargement') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await settingsRepo.upsertSettings(formData)
      toast.success('Sauvegardé avec succès')
    } catch (error: unknown) { 
      toast.error(error instanceof Error ? error.message : 'Erreur') 
    } finally { setSaving(false) }
  }

  const update = (field: keyof SocialsFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  if (loading) return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-serif mb-2">Socials</h1><p className="text-muted-foreground">Chargement...</p></div>
      <Card className="p-6"><LuxuryLoading message="Chargement..." /></Card>
    </div>
  )

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-serif mb-2">Socials</h1><p className="text-muted-foreground">Gérez vos réseaux sociaux et tracking</p></div>
      <SocialsForm formData={formData} update={update} onSubmit={handleSubmit} saving={saving} />
    </div>
  )
}
