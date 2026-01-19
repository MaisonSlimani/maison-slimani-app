'use client'

import { motion } from 'framer-motion'
import ContactForm from './ContactForm'

interface ContactContentProps {
  settings: {
    email_entreprise: string
    telephone: string
    adresse: string
  }
  loading?: boolean
}

export default function ContactContent({ settings, loading = false }: ContactContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <header>
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Contactez-nous</h1>
        <p className="text-xl text-muted-foreground">
          Notre équipe est à votre écoute
        </p>
      </header>

      <ContactForm settings={settings} loading={loading} />
    </motion.div>
  )
}

