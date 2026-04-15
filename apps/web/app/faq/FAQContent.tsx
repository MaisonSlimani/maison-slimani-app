'use client'

import { HelpCircle, Mail, MessageCircle, Facebook, Instagram } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface FAQContentProps {
  settings: {
    email_entreprise: string; telephone: string; whatsapp: string; facebook: string; instagram: string
  }
}

const FAQS = [
  { question: 'Quels types de produits propose Maison Slimani ?', answer: 'Maison Slimani propose des chaussures en cuir haut de gamme pour hommes : derbies, richelieu, bottes, mocassins, sneakers, mules & sabots.' },
  { question: 'Les chaussures sont-elles fabriquées à la main ?', answer: 'Oui. Toutes nos chaussures sont confectionnées à la main par des artisans marocains.' },
  { question: 'Quels matériaux utilisez-vous ?', answer: 'Nous utilisons exclusivement du cuir naturel premium Marocain.' },
  { question: 'Comment choisir ma pointure ?', answer: 'Nos modèles respectent les tailles standard. Si vous êtes entre deux tailles, prenez la supérieure.' },
  { question: 'Proposez-vous des livraisons partout au Maroc ?', answer: 'Oui, nous livrons dans toutes les villes du Maroc.' },
  { question: 'Puis-je échanger ou retourner un produit ?', answer: 'Oui. Vous disposez de 7 jours pour demander un échange ou un retour.' }
]

export default function FAQContent({ settings }: FAQContentProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Questions <span className="text-dore">Fréquentes</span></h1>
        <p className="text-muted-foreground text-lg">Trouvez les réponses à vos questions</p>
      </div>

      <div className="space-y-4 mb-12">
        {FAQS.map((faq, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-serif mb-3 text-foreground flex items-start gap-2"><HelpCircle className="w-5 h-5 text-dore mt-0.5 flex-shrink-0" />{faq.question}</h3>
            <p className="text-muted-foreground leading-relaxed pl-7">{faq.answer}</p>
          </motion.div>
        ))}
      </div>

      <ContactSection settings={settings} />
    </motion.div>
  )
}

function ContactSection({ settings }: { settings: { email_entreprise?: string; whatsapp?: string; facebook?: string; instagram?: string } }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-gradient-to-br from-dore/10 to-dore/5 border border-dore/20 rounded-lg p-8 text-center">
      <h2 className="text-2xl font-serif mb-4">Besoin d'aide supplémentaire ?</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {settings.email_entreprise && <Link href={`mailto:${settings.email_entreprise}`} className="flex items-center gap-2 px-4 py-2 bg-dore text-charbon rounded-lg"><Mail className="w-4 h-4" />Email</Link>}
        {settings.whatsapp && <Link href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg"><MessageCircle className="w-4 h-4" />WhatsApp</Link>}
        {settings.facebook && <Link href={settings.facebook} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg"><Facebook className="w-4 h-4" />Facebook</Link>}
        {settings.instagram && <Link href={settings.instagram} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833AB4] to-[#E1306C] text-white rounded-lg"><Instagram className="w-4 h-4" />Instagram</Link>}
      </div>
    </motion.div>
  )
}
