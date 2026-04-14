'use client'

import React from 'react'
import { Mail, Phone, MapPin, Clock, Instagram } from 'lucide-react'
import ContactForm from '@/app/contact/ContactForm'
import { SiteSettings } from '@maison/domain'

interface ContactViewData {
  settings: SiteSettings;
  loading: boolean;
}

export default function MobileContactView({ data }: { data: ContactViewData }) {
  const { settings, loading } = data

  return (
    <div className="pt-24 pb-20 px-4 space-y-10">
      <div className="text-center px-4">
        <h1 className="text-4xl font-serif text-charbon mb-4">Nous <span className="text-dore">Contacter</span></h1>
        <p className="text-base text-muted-foreground">Une équipe à votre écoute pour un service d'excellence.</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-6">
          <InfoCard icon={Phone} label="Appelez-nous" value={settings.phone} href={settings.phone ? `tel:${settings.phone.replace(/\s/g, '')}` : undefined} />
          <InfoCard icon={Mail} label="Email" value={settings.companyEmail} href={settings.companyEmail ? `mailto:${settings.companyEmail}` : undefined} />
          <InfoCard icon={MapPin} label="Atelier" value={settings.address} />
          <InfoCard icon={Clock} label="Horaires" value="Lun - Sam : 09:00 - 19:00" />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-charbon/5">
          <h2 className="text-2xl font-serif mb-6 text-charbon">Écrivez-nous</h2>
          <ContactForm settings={settings} loading={loading} />
        </div>

        <div className="p-6 bg-ecru/30 rounded-3xl text-center space-y-4">
          <h4 className="font-serif text-lg">Maison Slimani</h4>
          <p className="text-sm text-muted-foreground">Suivez notre savoir-faire ancestral</p>
          <div className="flex justify-center gap-4"><div className="w-12 h-12 rounded-full bg-charbon flex items-center justify-center text-white"><Instagram className="w-6 h-6" /></div></div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value?: string | null; href?: string }) {
  if (!value) return null
  return (
    <div className="flex gap-4 items-center p-4 bg-white rounded-2xl shadow-sm border border-charbon/5">
      <div className="w-12 h-12 rounded-xl bg-dore/10 flex items-center justify-center text-dore flex-shrink-0"><Icon className="w-6 h-6" /></div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</h4>
        {href ? (
          <a href={href} className="text-sm font-serif text-charbon truncate block">{value}</a>
        ) : (
          <p className="text-sm font-serif text-charbon truncate">{value}</p>
        )}
      </div>
    </div>
  )
}
