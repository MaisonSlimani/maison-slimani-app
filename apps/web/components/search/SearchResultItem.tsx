'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { cn } from '@maison/shared'

interface SearchResultItemProps {
  product: { nom: string; image_url?: string; prix: number }
  productHref: string
  isActive: boolean
  onClick: () => void
}

export const SearchResultItem = ({
  product,
  productHref,
  isActive,
  onClick
}: SearchResultItemProps) => {
  return (
    <Link
      href={productHref}
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors',
        isActive && 'bg-muted ring-2 ring-dore'
      )}
    >
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        <Image
          src={product.image_url || '/assets/placeholder.jpg'}
          alt={product.nom}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground line-clamp-2">
          {product.nom}
        </h4>
        <p className="text-dore font-semibold text-sm mt-1">
          {product.prix?.toLocaleString('fr-MA')} MAD
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </Link>
  )
}
