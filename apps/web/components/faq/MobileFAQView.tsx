'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Mail, MessageCircle } from 'lucide-react'

import { FAQViewData } from '@/types/views'
import { FAQItem } from '@/types/index'

export default function MobileFAQView({ data }: { data: FAQViewData }) {
  const { settings, faqs } = data

  return (
    <div className="w-full min-h-screen pb-20 bg-ecru/30">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <h1 className="text-2xl font-serif text-foreground">FAQ</h1>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {faqs.map((faq: FAQItem, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-charbon/5 rounded-2xl p-5 shadow-sm"
          >
            <h3 className="text-base font-serif mb-3 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-dore mt-0.5" />
              {faq.question}
            </h3>
            <p className="text-sm text-charbon/70 leading-relaxed pl-8">
              {faq.answer}
            </p>
          </motion.div>
        ))}

        <div className="pt-8 border-t border-charbon/5">
          <h2 className="text-xl font-serif mb-6 text-center">Besoin d'aide ?</h2>
          <div className="grid grid-cols-2 gap-3">
            {settings.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} className="flex items-center justify-center gap-2 p-4 bg-[#25D366] text-white rounded-2xl">
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </a>
            )}
            {settings.email_entreprise && (
              <a href={`mailto:${settings.email_entreprise}`} className="flex items-center justify-center gap-2 p-4 bg-charbon text-white rounded-2xl">
                <Mail className="w-5 h-5" /> Email
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
