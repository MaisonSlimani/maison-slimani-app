import { SiteSettings } from '@maison/domain'
import { Button, Card, Input, Label, Textarea } from '@maison/ui'

export type SettingsFormData = Pick<
  SiteSettings,
  'companyEmail' | 'phone' | 'address' | 'description'
>

interface SettingsFormProps {
  formData: SettingsFormData
  update: (field: keyof SettingsFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
  saving: boolean
}

export function SettingsForm({ formData, update, onSubmit, saving }: SettingsFormProps) {
  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-serif mb-6">Coordonnées de l'entreprise</h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div><Label htmlFor="companyEmail">Email</Label>
            <Input id="companyEmail" type="email" value={formData.companyEmail ?? ''} onChange={update('companyEmail')} />
          </div>
          <div><Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" type="tel" value={formData.phone ?? ''} onChange={update('phone')} />
          </div>
        </div>
        <div><Label htmlFor="address">Adresse</Label>
          <Input id="address" value={formData.address ?? ''} onChange={update('address')} />
        </div>
        <div><Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={4} value={formData.description ?? ''} onChange={update('description')} />
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
      </form>
    </Card>
  )
}
