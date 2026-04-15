'use client'

import React from 'react'
import { FileText, CheckCircle, DollarSign, Mail } from 'lucide-react'

interface PolitiquesProps {
  data: {
    settings: {
      email_entreprise: string
      telephone: string
    }
  }
}

export default function DesktopPolitiquesView({ data }: PolitiquesProps) {
  const { settings } = data

  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-serif text-charbon mb-6">Politique <span className="text-dore">de Retour</span></h1>
        <p className="text-xl text-muted-foreground">Conditions d'échange et de remboursement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-serif flex items-center gap-3">
              <FileText className="w-6 h-6 text-dore" />
              1. Délai de retour
            </h2>
            <p className="text-lg text-charbon/70 leading-relaxed">
              Vous disposez de <strong>7 jours calendaires</strong> à compter de la réception de votre commande pour demander un retour ou un échange.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-dore" />
              2. Conditions d'éligibilité
            </h2>
            <ul className="space-y-2 text-charbon/70 list-disc pl-6">
              <li>Dans son état d'origine</li>
              <li>Non porté, non utilisé et non endommagé</li>
              <li>Restitué avec tous les accessoires et emballages</li>
            </ul>
          </section>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-serif flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-dore" />
              3. Frais de retour
            </h2>
            <p className="text-lg text-charbon/70 leading-relaxed">
              Les frais de retour sont à la charge du client, sauf si le produit reçu est défectueux ou n'est pas conforme à la commande.
            </p>
          </section>

          <div className="p-8 bg-ecru/50 rounded-3xl border border-charbon/5">
            <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
              <Mail className="w-5 h-5 text-dore" />
              Service Client
            </h3>
            <p className="text-muted-foreground mb-6">Pour toute demande de retour, contactez-nous par email ou téléphone :</p>
            <div className="space-y-4">
              <div className="text-2xl font-serif text-charbon">{settings.email_entreprise}</div>
              <div className="text-2xl font-serif text-charbon">{settings.telephone}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
