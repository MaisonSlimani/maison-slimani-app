'use client'

import { Button, Input, Textarea, Label, Card } from '@maison/ui'
import { useContactForm } from '@/hooks/useContactForm'

export function ContactFormBody() {
  const { formData, isSending, handleSubmit, updateField } = useContactForm()

  return (
    <Card className="p-8 bg-secondary/40">
      <h2 className="text-2xl font-serif mb-6">Envoyez-nous un message</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" required className="mt-2" value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required className="mt-2" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" type="tel" className="mt-2" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" required rows={6} className="mt-2" placeholder="Décrivez votre demande..." value={formData.message} onChange={(e) => updateField('message', e.target.value)} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSending}>
          {isSending ? 'Envoi en cours...' : 'Envoyer le message'}
        </Button>
      </form>
    </Card>
  )
}
