'use client'

import React from 'react'

interface ProductInfoProps {
  nom: string
  prix: number
  categorie: string
  description: string
}

export function ProductInfo({ nom, prix, categorie, description }: ProductInfoProps) {
  return (
    <div className="space-y-4">
      <span className="text-sm uppercase tracking-widest text-muted-foreground">{categorie}</span>
      <h1 className="text-5xl font-serif text-charbon leading-tight">{nom}</h1>
      <p className="text-4xl font-serif text-dore">{prix.toLocaleString('fr-MA')} DH</p>
      <div 
        className="prose prose-lg max-w-none text-charbon/80 leading-relaxed pt-4"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  )
}
