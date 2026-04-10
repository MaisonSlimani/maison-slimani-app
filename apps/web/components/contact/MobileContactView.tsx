'use client'

import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import ContactForm from '@/app/contact/ContactForm'

import { ContactViewData } from '@/types/views'

export default function MobileContactView({ data }: { data: ContactViewData }) {
  const { settings, loading } = data

  return (
    <div className="w-full min-h-screen pb-20 bg-ecru/30">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <h1 className="text-2xl font-serif text-foreground">Contact</h1>
      </div>

      <div className="px-4 py-6 space-y-8 max-w-md mx-auto">
        <div className="space-y-4">
          <ContactForm settings={settings} loading={loading} />
        </div>

        <div className="pt-8 border-t border-charbon/5 space-y-6">
          <h2 className="text-xl font-serif">Nos coordonnées</h2>
          <div className="space-y-4">
             {settings.telephone && (
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-charbon/5">
                <div className="w-10 h-10 rounded-full bg-dore/10 flex items-center justify-center text-dore">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{settings.telephone}</p>
                </div>
              </div>
            )}
            {settings.email_entreprise && (
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-charbon/5">
                <div className="w-10 h-10 rounded-full bg-dore/10 flex items-center justify-center text-dore">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{settings.email_entreprise}</p>
                </div>
              </div>
            )}
            {settings.adresse && (
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-charbon/5">
                <div className="w-10 h-10 rounded-full bg-dore/10 flex items-center justify-center text-dore">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Atelier</p>
                  <p className="font-medium text-sm">{settings.adresse}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
