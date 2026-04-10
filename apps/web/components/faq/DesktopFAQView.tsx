'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Mail, MessageCircle } from 'lucide-react'

import { FAQViewData } from '@/types/views'
import { FAQItem } from '@/types/index'

export default function DesktopFAQView({ data }: { data: FAQViewData }) {
  const { settings, faqs } = data

  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-serif text-charbon mb-6">Questions <span className="text-dore">Fréquentes</span></h1>
        <p className="text-xl text-muted-foreground">Tout ce que vous devez savoir sur la Maison Slimani</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {faqs.map((faq: FAQItem, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-8 bg-white border border-charbon/5 rounded-3xl shadow-sm hover:shadow-xl hover:border-dore/20 transition-all group"
          >
            <h3 className="text-xl font-serif mb-4 flex items-start gap-4 text-charbon group-hover:text-dore transition-colors">
              <HelpCircle className="w-6 h-6 text-dore flex-shrink-0" />
              {faq.question}
            </h3>
            <p className="text-lg text-charbon/70 leading-relaxed pl-10">
              {faq.answer}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 p-12 bg-charbon rounded-[3rem] text-white text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-dore/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <h2 className="text-4xl font-serif mb-6 relative z-10">Besoin d'un conseil personnalisé ?</h2>
        <p className="text-xl text-white/70 mb-10 relative z-10">Notre service client est à votre écoute pour vous guider.</p>
        
        <div className="flex flex-wrap justify-center gap-6 relative z-10">
          <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} className="flex items-center gap-3 px-8 py-4 bg-[#25D366] rounded-2xl hover:scale-105 transition-transform">
            <MessageCircle className="w-6 h-6" /> WhatsApp
          </a>
          <a href={`mailto:${settings.email_entreprise}`} className="flex items-center gap-3 px-8 py-4 bg-dore text-charbon rounded-2xl font-bold hover:scale-105 transition-transform">
            <Mail className="w-6 h-6" /> Nous écrire
          </a>
        </div>
      </div>
    </div>
  )
}
