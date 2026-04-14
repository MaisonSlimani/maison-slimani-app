'use client'

import { Mail, Phone, MapPin } from 'lucide-react'
import { Card } from '@maison/ui'
import { SiteSettings } from '@maison/domain'

export function ContactCards({ settings }: { settings: SiteSettings }) {
  if (!settings) return null

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {settings.companyEmail?.trim() && (
        <Card className="p-6 text-center">
          <Mail className="w-8 h-8 mx-auto mb-4 text-primary" />
          <h3 className="font-medium mb-2">Email</h3>
          <a href={`mailto:${settings.companyEmail}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{settings.companyEmail}</a>
        </Card>
      )}
      {settings.phone?.trim() && (
        <Card className="p-6 text-center">
          <Phone className="w-8 h-8 mx-auto mb-4 text-primary" />
          <h3 className="font-medium mb-2">Téléphone</h3>
          <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{settings.phone}</a>
        </Card>
      )}
      {settings.address?.trim() && (
        <Card className="p-6 text-center">
          <MapPin className="w-8 h-8 mx-auto mb-4 text-primary" />
          <h3 className="font-medium mb-2">Adresse</h3>
          <p className="text-sm text-muted-foreground">{settings.address}</p>
        </Card>
      )}
    </div>
  )
}
