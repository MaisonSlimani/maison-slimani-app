'use client'

import React from 'react'

interface ProductInfoProps {
  name: string
  price: number
  category: string
  description: string
}

export function ProductInfo({ name, price, category, description }: ProductInfoProps) {
  return (
    <div className="space-y-4">
      <span className="text-sm uppercase tracking-widest text-muted-foreground">{category}</span>
      <h1 className="text-5xl font-serif text-charbon leading-tight">{name}</h1>
      <p className="text-4xl font-serif text-dore">{price.toLocaleString('fr-MA')} DH</p>
      <div 
        className="prose prose-lg max-w-none text-charbon/80 leading-relaxed pt-4"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  )
}
