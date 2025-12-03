'use client'

import { FileText, Mail, Phone, CheckCircle, XCircle, ArrowRight, DollarSign, CreditCard, RefreshCw, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface PolitiquesContentProps {
  settings: {
    email_entreprise: string
    telephone: string
  }
}

export default function PolitiquesContent({ settings }: PolitiquesContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">
          Politique de <span className="text-dore">Retour</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Chez Maison Slimani, la satisfaction de nos clients est au cœur de nos valeurs
        </p>
      </div>

      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-dore" />
            1. Délai de retour
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Vous disposez de <strong className="text-foreground">7 jours calendaires</strong> à compter de la réception de votre commande pour demander un retour ou un échange.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-dore" />
            2. Conditions d'éligibilité
          </h2>
          <p className="text-muted-foreground mb-4">
            Pour que le retour soit accepté, le produit doit être :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Dans son état d'origine</li>
            <li>Non porté, non utilisé et non endommagé</li>
            <li>Restitué avec tous les accessoires, étiquettes et emballages initiaux</li>
            <li>Accompagné du reçu ou numéro de commande</li>
          </ul>
          <p className="text-muted-foreground mt-4 text-sm italic">
            Maison Slimani se réserve le droit de refuser tout article qui ne respecte pas ces conditions.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-dore" />
            3. Produits non retournables
          </h2>
          <p className="text-muted-foreground mb-4">
            Pour des raisons d'hygiène et de personnalisation, ne sont pas éligibles au retour :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Produits sur mesure ou personnalisés</li>
            <li>Articles ayant été visiblement portés ou détériorés</li>
            <li>Articles en promotion finale ("vente flash", "fin de série")</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <ArrowRight className="w-6 h-6 text-dore" />
            4. Procédure de retour
          </h2>
          <p className="text-muted-foreground mb-4">
            Pour initier un retour, merci de :
          </p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
            <li>Contacter notre service client à support@maisonslimani.ma ou via notre formulaire de contact.</li>
            <li>Indiquer votre numéro de commande et la raison du retour.</li>
            <li>Vous recevrez les instructions détaillées ainsi que l'adresse de retour.</li>
          </ol>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-dore" />
            5. Frais de retour
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Les frais de retour sont à la charge du client, sauf si le produit reçu est défectueux ou n'est pas conforme à la commande.
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            En cas d'erreur de notre part, Maison Slimani prend en charge l'intégralité des frais.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-dore" />
            6. Remboursements
          </h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Une fois votre article reçu et inspecté, nous vous notifierons par email de l'approbation ou du refus de votre remboursement.</li>
            <li>Si approuvé, le remboursement sera effectué via le même mode de paiement utilisé lors de l'achat.</li>
            <li>Le traitement peut prendre 5 à 10 jours ouvrés selon votre banque.</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-dore" />
            7. Échanges
          </h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Vous pouvez demander un échange pour une taille, une couleur, ou un modèle équivalent sous réserve de disponibilité.</li>
            <li>En cas d'indisponibilité, un remboursement ou un avoir vous sera proposé.</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-dore" />
            8. Produits défectueux ou erreur de commande
          </h2>
          <p className="text-muted-foreground mb-4">
            Si vous recevez un article endommagé, incorrect ou présentant un défaut de fabrication :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Contactez-nous sous 48 heures avec des photos du produit concerné.</li>
            <li>Nous remplacerons le produit ou procéderons à un remboursement complet.</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-gradient-to-br from-dore/10 to-dore/5 border border-dore/20 rounded-lg p-8"
        >
          <h2 className="text-2xl font-serif mb-4 text-center">Contact</h2>
          <p className="text-muted-foreground mb-6 text-center">
            Pour toute question relative aux retours, notre équipe est à votre disposition :
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {settings.email_entreprise && (
              <Link
                href={`mailto:${settings.email_entreprise}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-dore text-charbon rounded-lg hover:bg-dore/90 transition-colors"
              >
                <Mail className="w-5 h-5" />
                {settings.email_entreprise}
              </Link>
            )}
            {settings.telephone ? (
              <Link
                href={`tel:${settings.telephone.replace(/\D/g, '')}`}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-dore text-dore rounded-lg hover:bg-dore/10 transition-colors"
              >
                <Phone className="w-5 h-5" />
                {settings.telephone}
              </Link>
            ) : (
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-dore text-dore rounded-lg hover:bg-dore/10 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Formulaire de contact
              </Link>
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}

