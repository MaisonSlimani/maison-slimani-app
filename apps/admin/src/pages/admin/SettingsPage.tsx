import { useState, useEffect } from 'react'
import { Card, LuxuryLoading } from '@maison/ui'
import { toast } from 'sonner'
import { settingsRepo } from '@/lib/repositories'
import { SettingsForm, SettingsFormData } from '@/components/settings/SettingsForm'

const DEFAULT_FORM: SettingsFormData = { email_entreprise: '', telephone: '', adresse: '', description: '' }

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<SettingsFormData>(DEFAULT_FORM)

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await settingsRepo.getSettings()
        if (settings) {
          setFormData({
            email_entreprise: settings.email_entreprise ?? '',
            telephone: settings.telephone ?? '',
            adresse: settings.adresse ?? '',
            description: settings.description ?? '',
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
      toast.success('Paramètres sauvegardés')
    } catch (error: unknown) { 
      toast.error(error instanceof Error ? error.message : 'Erreur') 
    } finally { setSaving(false) }
  }

  const update = (field: keyof SettingsFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  if (loading) return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-serif mb-2">Paramètres</h1><p className="text-muted-foreground">Chargement...</p></div>
      <Card className="p-6"><LuxuryLoading message="Chargement..." /></Card>
    </div>
  )

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-serif mb-2">Paramètres</h1><p className="text-muted-foreground">Gérez les paramètres du site</p></div>
      <SettingsForm formData={formData} update={update} onSubmit={handleSubmit} saving={saving} />
    </div>
  )
}
