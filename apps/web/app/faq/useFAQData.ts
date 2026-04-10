'use client'

import { useState, useEffect } from 'react'

export function useFAQData() {
  const [settings, setSettings] = useState({
    email_entreprise: 'Maisondeslimani@gmail.com',
    telephone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setSettings({
              email_entreprise: result.data.email_entreprise || 'Maisondeslimani@gmail.com',
              telephone: result.data.telephone || '',
              whatsapp: result.data.whatsapp || '',
              facebook: result.data.facebook || '',
              instagram: result.data.instagram || '',
            })
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
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

  return { settings, loading, faqs }
}
