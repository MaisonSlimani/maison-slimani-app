'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { HelpCircle, Mail, MessageCircle, Facebook, Instagram, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PWAFAQPage() {
  const [settings, setSettings] = useState({
    email_entreprise: 'Maisondeslimani@gmail.com',
    telephone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
  })

  useEffect(() => {
    async function getSettings() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (!supabaseUrl) return

        const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
        const { data } = await supabase
          .from('settings')
          .select('email_entreprise, telephone, whatsapp, facebook, instagram')
          .limit(1)
          .single()

        if (data) {
          setSettings({
            email_entreprise: data.email_entreprise || 'Maisondeslimani@gmail.com',
            telephone: data.telephone || '',
            whatsapp: data.whatsapp || '',
            facebook: data.facebook || '',
            instagram: data.instagram || '',
          })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres:', error)
      }
    }

    getSettings()
  }, [])

  const faqs = [
    {
      question: 'Quels types de produits propose Maison Slimani ?',
      answer: 'Maison Slimani propose des chaussures en cuir haut de gamme pour hommes : derbies, richelieu, bottes, mocassins, sneakers, mules & sabots. Chaque pièce est fabriquée artisanalement à Casablanca.'
    },
    {
      question: 'Les chaussures sont-elles fabriquées à la main ?',
      answer: 'Oui. Toutes nos chaussures sont confectionnées à la main par des artisans marocains, en utilisant des techniques traditionnelles et un cuir de haute qualité.'
    },
    {
      question: 'Quels matériaux utilisez-vous ?',
      answer: 'Nous utilisons exclusivement du cuir naturel premium, sélectionné auprès de tanneries marocaines reconnues pour leur savoir-faire.'
    },
    {
      question: 'Comment choisir ma pointure ?',
      answer: 'Nos modèles respectent les tailles standard marocaines et européennes. Si vous êtes entre deux tailles, nous recommandons de prendre la pointure supérieure.'
    },
    {
      question: 'Proposez-vous des livraisons partout au Maroc ?',
      answer: 'Oui, nous livrons dans toutes les villes du Maroc via des services de livraison professionnels.'
    },
    {
      question: 'Quels sont les délais de livraison ?',
      answer: 'Casablanca : 24h | Autres villes : 48h à 72h en moyenne'
    },
    {
      question: 'Quels sont les moyens de paiement disponibles ?',
      answer: 'Paiement à la livraison (Cash on Delivery) | Paiement en ligne (si activé sur le site)'
    },
    {
      question: 'Puis-je échanger ou retourner un produit ?',
      answer: 'Oui. Vous disposez de 7 jours pour demander un échange ou un retour si : la taille ne vous convient pas, le produit présente un défaut de fabrication. Le produit doit être neuf et non porté.'
    },
    {
      question: 'Comment entretenir mes chaussures en cuir ?',
      answer: 'Nettoyez avec un chiffon doux. Utilisez une crème ou cire pour cuir. Évitez l\'exposition prolongée au soleil ou à l\'eau. Un entretien régulier prolonge la durée de vie du cuir.'
    },
    {
      question: 'Comment contacter le service client ?',
      answer: 'Vous pouvez nous contacter via email, WhatsApp, Facebook ou Instagram.'
    }
  ]

  return (
    <div className="w-full min-h-screen pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/pwa/menu" className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-serif text-foreground">FAQ</h1>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-2xl mx-auto">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <h3 className="text-base font-serif mb-2 text-foreground flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-dore mt-0.5 flex-shrink-0" />
              {faq.question}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              {faq.answer}
            </p>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-gradient-to-br from-dore/10 to-dore/5 border border-dore/20 rounded-lg p-6 mt-6"
        >
          <h2 className="text-xl font-serif mb-3 text-center">Besoin d'aide supplémentaire ?</h2>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Contactez-nous directement
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {settings.email_entreprise && (
              <Link
                href={`mailto:${settings.email_entreprise}`}
                className="flex items-center gap-2 px-4 py-2 bg-dore text-charbon rounded-lg text-sm"
              >
                <Mail className="w-4 h-4" />
                Email
              </Link>
            )}
            {settings.whatsapp && (
              <Link
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Link>
            )}
            {settings.facebook && (
              <Link
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg text-sm"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Link>
            )}
            {settings.instagram && (
              <Link
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833AB4] to-[#E1306C] text-white rounded-lg text-sm"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
