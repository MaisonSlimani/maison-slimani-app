'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Instagram } from 'lucide-react'
import ContactForm from '@/app/contact/ContactForm'
import { ContactViewData } from '@/types/views'

export default function DesktopContactView({ data }: { data: ContactViewData }) {
  const { settings, loading } = data

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-serif text-charbon mb-6">Nous <span className="text-dore">Contacter</span></h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Une question ? Un projet sur-mesure ? Notre équipe est à votre disposition.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-charbon/5">
          <h2 className="text-3xl font-serif mb-8 text-charbon">Envoyez-nous un message</h2>
          <ContactForm settings={settings} loading={loading} />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 pt-4">
          <div className="space-y-8">
            <h2 className="text-3xl font-serif text-charbon">Informations</h2>
            <div className="space-y-6">
              <InfoCard icon={Phone} label="Téléphone" value={settings.telephone} isLarge />
              <InfoCard icon={Mail} label="Email" value={settings.email_entreprise} isLarge />
              <InfoCard icon={MapPin} label="Atelier" value={settings.adresse} />
              <InfoCard icon={Clock} label="Horaires" value="Lun - Sam : 09:00 - 19:00" />
            </div>
          </div>
          <SocialCard />
        </motion.div>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, isLarge }: { icon: React.ElementType; label: string; value?: string; isLarge?: boolean }) {
  if (!value) return null
  return (
    <div className="flex gap-6 items-start">
      <div className="w-14 h-14 rounded-2xl bg-dore/10 flex items-center justify-center text-dore flex-shrink-0"><Icon className="w-7 h-7" /></div>
      <div>
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</h4>
        <p className={isLarge ? "text-2xl font-serif text-charbon" : "text-lg text-charbon/80 leading-relaxed"}>{value}</p>
      </div>
    </div>
  )
}

function SocialCard() {
  return (
    <div className="p-8 bg-ecru/50 rounded-3xl border border-charbon/5">
      <h4 className="font-serif text-xl mb-4">Suivez notre artisanat</h4>
      <p className="text-muted-foreground mb-6">Découvrez les coulisses de notre atelier sur les réseaux sociaux.</p>
      <div className="flex gap-4"><div className="w-10 h-10 rounded-full bg-charbon flex items-center justify-center text-white hover:bg-dore transition-colors cursor-pointer"><Instagram className="w-5 h-5" /></div></div>
    </div>
  )
}
