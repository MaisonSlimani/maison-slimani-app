'use client'

import { HelpCircle, Mail, MessageCircle, Facebook, Instagram } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface FAQContentProps {
  settings: {
    email_entreprise: string
    telephone: string
    whatsapp: string
    facebook: string
    instagram: string
  }
}

export default function FAQContent({ settings }: FAQContentProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">
          Questions <span className="text-dore">Fréquentes</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Trouvez les réponses à vos questions
        </p>
      </div>

      <div className="space-y-4 mb-12">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-card border border-border rounded-lg p-6 hover:border-dore/50 transition-colors"
          >
            <h3 className="text-lg font-serif mb-3 text-foreground flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-dore mt-0.5 flex-shrink-0" />
              {faq.question}
            </h3>
            <p className="text-muted-foreground leading-relaxed pl-7">
              {faq.answer}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="bg-gradient-to-br from-dore/10 to-dore/5 border border-dore/20 rounded-lg p-8 text-center"
      >
        <h2 className="text-2xl font-serif mb-4">Besoin d'aide supplémentaire ?</h2>
        <p className="text-muted-foreground mb-6">
          Notre équipe est à votre disposition pour répondre à toutes vos questions
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {settings.email_entreprise && (
            <Link
              href={`mailto:${settings.email_entreprise}`}
              className="flex items-center gap-2 px-4 py-2 bg-dore text-charbon rounded-lg hover:bg-dore/90 transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#25D366]/90 transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#1877F2]/90 transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833AB4] to-[#E1306C] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-4 h-4" />
              Instagram
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

