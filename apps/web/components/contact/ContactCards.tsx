'use client'

import { Mail, Phone, MapPin } from 'lucide-react'
import { Card } from '@maison/ui'

import { SiteSettings } from '@/types/index'

export function ContactCards({ settings }: { settings: SiteSettings }) {
  if (!settings) return null

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {settings.email_entreprise?.trim() && (
        <Card className="p-6 text-center">
          <Mail className="w-8 h-8 mx-auto mb-4 text-primary" />
          <h3 className="font-medium mb-2">Email</h3>
          <a href={`mailto:${settings.email_entreprise}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{settings.email_entreprise}</a>
        </Card>
      )}
      {settings.telephone?.trim() && (
        <Card className="p-6 text-center">
          <Phone className="w-8 h-8 mx-auto mb-4 text-primary" />
          <h3 className="font-medium mb-2">Téléphone</h3>
          <a href={`tel:${settings.telephone.replace(/\s/g, '')}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{settings.telephone}</a>
        </Card>
      )}
      {settings.adresse?.trim() && (
        <Card className="p-6 text-center">
          <MapPin className="w-8 h-8 mx-auto mb-4 text-primary" />
          <h3 className="font-medium mb-2">Adresse</h3>
          <p className="text-sm text-muted-foreground">{settings.adresse}</p>
        </Card>
      )}
    </div>
  )
}
