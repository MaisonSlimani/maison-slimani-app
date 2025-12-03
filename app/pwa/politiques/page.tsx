'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { FileText, Mail, Phone, ArrowLeft, CheckCircle, XCircle, ArrowRight, DollarSign, CreditCard, RefreshCw, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PWAPolitiquesPage() {
  const [settings, setSettings] = useState({
    email_entreprise: 'support@maisonslimani.ma',
    telephone: '',
  })

  useEffect(() => {
    async function getSettings() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (!supabaseUrl) return

        const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
        const { data } = await supabase
          .from('settings')
          .select('email_entreprise, telephone')
          .limit(1)
          .single()

        if (data) {
          setSettings({
            email_entreprise: data.email_entreprise || 'support@maisonslimani.ma',
            telephone: data.telephone || '',
          })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres:', error)
      }
    }

    getSettings()
  }, [])
  return (
    <div className="w-full min-h-screen pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/pwa/menu" className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-serif text-foreground">Politique de Retour</h1>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-2xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h2 className="text-lg font-serif mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-dore" />
            1. Délai de retour
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vous disposez de <strong className="text-foreground">7 jours calendaires</strong> à compter de la réception de votre commande pour demander un retour ou un échange.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h2 className="text-lg font-serif mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-dore" />
            2. Conditions d'éligibilité
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Pour que le retour soit accepté, le produit doit être :
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Dans son état d'origine</li>
            <li>Non porté, non utilisé et non endommagé</li>
            <li>Restitué avec tous les accessoires, étiquettes et emballages initiaux</li>
            <li>Accompagné du reçu ou numéro de commande</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h2 className="text-lg font-serif mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-dore" />
            3. Produits non retournables
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Produits sur mesure ou personnalisés</li>
            <li>Articles ayant été visiblement portés ou détériorés</li>
            <li>Articles en promotion finale ("vente flash", "fin de série")</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h2 className="text-lg font-serif mb-3 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-dore" />
            4. Procédure de retour
          </h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Contacter notre service client à support@maisonslimani.ma ou via notre formulaire de contact.</li>
            <li>Indiquer votre numéro de commande et la raison du retour.</li>
            <li>Vous recevrez les instructions détaillées ainsi que l'adresse de retour.</li>
          </ol>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h2 className="text-lg font-serif mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-dore" />
            5. Frais de retour
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            Les frais de retour sont à la charge du client, sauf si le produit reçu est défectueux ou n'est pas conforme à la commande.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            En cas d'erreur de notre part, Maison Slimani prend en charge l'intégralité des frais.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h2 className="text-lg font-serif mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-dore" />
            6. Remboursements
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Une fois votre article reçu et inspecté, nous vous notifierons par email de l'approbation ou du refus de votre remboursement.</li>
            <li>Si approuvé, le remboursement sera effectué via le même mode de paiement utilisé lors de l'achat.</li>
            <li>Le traitement peut prendre 5 à 10 jours ouvrés selon votre banque.</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h2 className="text-lg font-serif mb-3 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-dore" />
            7. Échanges
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Vous pouvez demander un échange pour une taille, une couleur, ou un modèle équivalent sous réserve de disponibilité.</li>
            <li>En cas d'indisponibilité, un remboursement ou un avoir vous sera proposé.</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h2 className="text-lg font-serif mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-dore" />
            8. Produits défectueux ou erreur de commande
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
            <li>Contactez-nous sous 48 heures avec des photos du produit concerné.</li>
            <li>Nous remplacerons le produit ou procéderons à un remboursement complet.</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="bg-gradient-to-br from-dore/10 to-dore/5 border border-dore/20 rounded-lg p-6 mt-6"
        >
          <h2 className="text-xl font-serif mb-3 text-center">Contact</h2>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Pour toute question relative aux retours
          </p>
          <div className="flex flex-col gap-3">
            {settings.email_entreprise && (
              <Link
                href={`mailto:${settings.email_entreprise}`}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-dore text-charbon rounded-lg text-sm"
              >
                <Mail className="w-4 h-4" />
                {settings.email_entreprise}
              </Link>
            )}
            {settings.telephone ? (
              <Link
                href={`tel:${settings.telephone.replace(/\D/g, '')}`}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-dore text-dore rounded-lg text-sm"
              >
                <Phone className="w-4 h-4" />
                {settings.telephone}
              </Link>
            ) : (
              <Link
                href="/pwa/contact"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-dore text-dore rounded-lg text-sm"
              >
                <Phone className="w-4 h-4" />
                Formulaire de contact
              </Link>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  )
}

