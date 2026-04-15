'use client'

import { Button, Input, Textarea, Label, Card } from '@maison/ui'
import { useContactForm } from '@/hooks/useContactForm'

export function ContactFormBody() {
  const { formData, envoiEnCours, handleSubmit, updateField } = useContactForm()

  return (
    <Card className="p-8 bg-secondary/40">
      <h2 className="text-2xl font-serif mb-6">Envoyez-nous un message</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div><Label htmlFor="nom">Nom complet</Label><Input id="nom" required className="mt-2" value={formData.nom} onChange={(e) => updateField('nom', e.target.value)} /></div>
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required className="mt-2" value={formData.email} onChange={(e) => updateField('email', e.target.value)} /></div>
        <div><Label htmlFor="telephone">Téléphone</Label><Input id="telephone" type="tel" className="mt-2" value={formData.telephone} onChange={(e) => updateField('telephone', e.target.value)} /></div>
        <div><Label htmlFor="message">Message</Label><Textarea id="message" required rows={6} className="mt-2" placeholder="Décrivez votre demande..." value={formData.message} onChange={(e) => updateField('message', e.target.value)} /></div>
        <Button type="submit" size="lg" className="w-full" disabled={envoiEnCours}>{envoiEnCours ? 'Envoi en cours...' : 'Envoyer le message'}</Button>
      </form>
    </Card>
  )
}
