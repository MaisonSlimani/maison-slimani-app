'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, ArrowRight, DollarSign, Mail, Phone } from 'lucide-react'

interface PolitiquesProps {
  data: {
    settings: {
      email_entreprise: string
      telephone: string
    }
  }
}

export default function MobilePolitiquesView({ data }: PolitiquesProps) {
  const { settings } = data

  const sections = [
    { title: '1. Délai de retour', icon: FileText, content: 'Vous disposez de 7 jours calendaires à compter de la réception de votre commande pour demander un retour.' },
    { title: '2. Conditions', icon: CheckCircle, content: 'Le produit doit être neuf, non porté, dans son emballage d\'origine avec tous les accessoires.' },
    { title: '3. Procédure', icon: ArrowRight, content: 'Contactez notre service client avec votre numéro de commande pour recevoir les instructions.' },
    { title: '4. Frais', icon: DollarSign, content: 'Les frais de retour sont à la charge du client, sauf erreur de notre part ou produit défectueux.' }
  ]

  return (
    <div className="w-full min-h-screen pb-20 bg-ecru/30 text-charbon">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-charbon/5 px-4 py-3 flex items-center gap-3">
        <h1 className="text-2xl font-serif">Politique de Retour</h1>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {sections.map((section, index) => {
          const Icon = section.icon
          return (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-charbon/5 rounded-2xl p-5 shadow-sm"
            >
              <h2 className="text-lg font-serif mb-2 flex items-center gap-3">
                <Icon className="w-5 h-5 text-dore" />
                {section.title}
              </h2>
              <p className="text-sm text-charbon/70 leading-relaxed">
                {section.content}
              </p>
            </motion.section>
          )
        })}

        <div className="pt-8 space-y-4">
          <div className="p-6 bg-charbon text-white rounded-2xl">
            <h3 className="text-xl font-serif mb-4 text-center">Contact SAV</h3>
            <div className="space-y-3">
              <a href={`mailto:${settings.email_entreprise}`} className="flex items-center justify-center gap-2 py-3 bg-white/10 rounded-xl text-sm">
                <Mail className="w-4 h-4" /> {settings.email_entreprise}
              </a>
              {settings.telephone && (
                <a href={`tel:${settings.telephone}`} className="flex items-center justify-center gap-2 py-3 border border-white/20 rounded-xl text-sm text-dore">
                  <Phone className="w-4 h-4" /> {settings.telephone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
