'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'

export function PolitiqueContact({ settings }: { settings: { email_entreprise: string; telephone: string } }) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="bg-gradient-to-br from-dore/10 to-dore/5 border border-dore/20 rounded-lg p-8">
      <h2 className="text-2xl font-serif mb-4 text-center">Contact</h2>
      <p className="text-muted-foreground mb-6 text-center">Pour toute question relative aux retours, notre équipe est à votre disposition :</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {settings.email_entreprise && <Link href={`mailto:${settings.email_entreprise}`} className="flex items-center justify-center gap-2 px-6 py-3 bg-dore text-charbon rounded-lg hover:bg-dore/90 transition-colors"><Mail className="w-5 h-5" />{settings.email_entreprise}</Link>}
        <Link href={settings.telephone ? `tel:${settings.telephone.replace(/\D/g, '')}` : "/contact"} className="flex items-center justify-center gap-2 px-6 py-3 border border-dore text-dore rounded-lg hover:bg-dore/10 transition-colors"><Phone className="w-5 h-5" />{settings.telephone || "Formulaire de contact"}</Link>
      </div>
    </motion.section>
  )
}
