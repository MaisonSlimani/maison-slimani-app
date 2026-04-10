'use client'

import React from 'react'
import { Button } from '@maison/ui'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'

export function HomeContact({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <section className="py-32 px-6 bg-charbon text-white text-center">
      <h2 className="text-6xl font-serif mb-8">Contactez-nous</h2>
      <p className="text-2xl text-white/70 mb-12 max-w-2xl mx-auto">Besoin d'un conseil ? Notre équipe est là.</p>
      <Button asChild size="lg" className="bg-dore text-charbon hover:bg-dore/90 h-20 px-12 text-2xl">
        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon className="w-8 h-8 mr-4" /> Nous contacter
        </a>
      </Button>
    </section>
  )
}
