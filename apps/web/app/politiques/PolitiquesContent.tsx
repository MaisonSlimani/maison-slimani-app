'use client'

import { FileText, CheckCircle, XCircle, ArrowRight, DollarSign, CreditCard, RefreshCw, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { PolicySection } from '@/components/politiques/PolicySection'
import { PolitiqueContact } from '@/components/politiques/PolitiqueContact'

interface PolitiquesContentProps { settings: { email_entreprise: string; telephone: string } }

export default function PolitiquesContent({ settings }: PolitiquesContentProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Politique de <span className="text-dore">Retour</span></h1>
        <p className="text-muted-foreground text-lg">Satisfaction client au cœur de nos valeurs</p>
      </div>

      <div className="space-y-8">
        <PolicySection icon={FileText} title="1. Délai de retour" delay={0.1}><p>Délai de <strong>7 jours calendaires</strong> après réception.</p></PolicySection>
        <PolicySection icon={CheckCircle} title="2. Conditions" delay={0.2}>
          <p>Produit intact, non porté, emballage d'origine et preuve d'achat requis.</p>
        </PolicySection>
        <PolicySection icon={XCircle} title="3. Non retournables" delay={0.3}><p>Sur mesure, porté/détérioré, promotions finales.</p></PolicySection>
        <PolicySection icon={ArrowRight} title="4. Procédure" delay={0.4}><p>Contactez support@maisonslimani.ma avec votre numéro de commande.</p></PolicySection>
        <PolicySection icon={DollarSign} title="5. Frais" delay={0.5}><p>Frais à la charge du client, sauf défaut ou erreur de nôtre part.</p></PolicySection>
        <PolicySection icon={CreditCard} title="6. Remboursements" delay={0.6}><p>Remboursement sur le mode de paiement initial (5-10 jours ouvrés).</p></PolicySection>
        <PolicySection icon={RefreshCw} title="7. Échanges" delay={0.7}><p>Échange possible selon disponibilité (taille, couleur).</p></PolicySection>
        <PolicySection icon={AlertCircle} title="8. Défectueux" delay={0.8}><p>Contactez-nous sous 48h avec photos en cas de défaut.</p></PolicySection>
        <PolitiqueContact settings={settings} />
      </div>
    </motion.div>
  )
}
