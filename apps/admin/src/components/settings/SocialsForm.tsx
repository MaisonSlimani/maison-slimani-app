import { SiteSettings } from '@maison/db'
import { Button, Input, Label, Textarea, Card } from '@maison/ui'

export type SocialsFormData = Pick<
  SiteSettings,
  'facebook' | 'instagram' | 'meta_pixel_code' | 'google_tag_manager_header' | 'google_tag_manager_body'
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
        <div className="pt-4 border-t"><Label htmlFor="meta_pixel_code">Meta Pixel Code</Label>
          <Textarea id="meta_pixel_code" rows={6} value={formData.meta_pixel_code ?? ''} onChange={update('meta_pixel_code')} className="font-mono text-sm" />
          <p className="text-xs text-muted-foreground mt-1">Collez ici le code complet de votre Meta Pixel.</p>
        </div>
        <div className="pt-4 border-t space-y-4">
          <h3 className="font-medium">Google Tag Manager</h3>
          <div><Label htmlFor="gtm_header">Code Header (Head)</Label>
            <Textarea id="gtm_header" rows={6} value={formData.google_tag_manager_header ?? ''} onChange={update('google_tag_manager_header')} className="font-mono text-sm" />
          </div>
          <div><Label htmlFor="gtm_body">Code Body (Body)</Label>
            <Textarea id="gtm_body" rows={4} value={formData.google_tag_manager_body ?? ''} onChange={update('google_tag_manager_body')} className="font-mono text-sm" />
          </div>
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
      </form>
    </Card>
  )
}
