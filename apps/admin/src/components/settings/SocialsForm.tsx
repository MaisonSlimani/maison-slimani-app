import { SiteSettings } from '@maison/domain'
import { Button, Input, Label, Textarea, Card } from '@maison/ui'

export type SocialsFormData = Pick<
  SiteSettings,
  'facebook' | 'instagram' | 'metaPixelCode' | 'gtmHeader' | 'gtmBody'
>

interface SocialsFormProps {
  formData: SocialsFormData
  update: (field: keyof SocialsFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
  saving: boolean
}

export function SocialsForm({ formData, update, onSubmit, saving }: SocialsFormProps) {
  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-serif mb-6">Réseaux sociaux & Tracking</h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div><Label htmlFor="facebook">Facebook URL</Label>
            <Input id="facebook" type="url" placeholder="https://www.facebook.com/votre-page" value={formData.facebook ?? ''} onChange={update('facebook')} />
          </div>
          <div><Label htmlFor="instagram">Instagram URL</Label>
            <Input id="instagram" type="url" placeholder="https://www.instagram.com/votre-compte" value={formData.instagram ?? ''} onChange={update('instagram')} />
          </div>
        </div>
        <div className="pt-4 border-t"><Label htmlFor="metaPixelCode">Meta Pixel Code</Label>
          <Textarea id="metaPixelCode" rows={6} value={formData.metaPixelCode ?? ''} onChange={update('metaPixelCode')} className="font-mono text-sm" />
          <p className="text-xs text-muted-foreground mt-1">Collez ici le code complet de votre Meta Pixel.</p>
        </div>
        <div className="pt-4 border-t space-y-4">
          <h3 className="font-medium">Google Tag Manager</h3>
          <div><Label htmlFor="gtmHeader">Code Header (Head)</Label>
            <Textarea id="gtmHeader" rows={6} value={formData.gtmHeader ?? ''} onChange={update('gtmHeader')} className="font-mono text-sm" />
          </div>
          <div><Label htmlFor="gtmBody">Code Body (Body)</Label>
            <Textarea id="gtmBody" rows={4} value={formData.gtmBody ?? ''} onChange={update('gtmBody')} className="font-mono text-sm" />
          </div>
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
      </form>
    </Card>
  )
}
