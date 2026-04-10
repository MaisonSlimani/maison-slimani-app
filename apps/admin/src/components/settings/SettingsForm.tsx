import { SiteSettings } from '@maison/db'
import { Button, Card, Input, Label, Textarea } from '@maison/ui'

export type SettingsFormData = Pick<
  SiteSettings,
  'email_entreprise' | 'telephone' | 'adresse' | 'description'
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
          <div><Label htmlFor="email_entreprise">Email</Label>
            <Input id="email_entreprise" type="email" value={formData.email_entreprise ?? ''} onChange={update('email_entreprise')} />
          </div>
          <div><Label htmlFor="telephone">Téléphone</Label>
            <Input id="telephone" type="tel" value={formData.telephone ?? ''} onChange={update('telephone')} />
          </div>
        </div>
        <div><Label htmlFor="adresse">Adresse</Label>
          <Input id="adresse" value={formData.adresse ?? ''} onChange={update('adresse')} />
        </div>
        <div><Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={4} value={formData.description ?? ''} onChange={update('description')} />
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
      </form>
    </Card>
  )
}
