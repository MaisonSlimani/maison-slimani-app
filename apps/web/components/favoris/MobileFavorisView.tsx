'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2, ShoppingCart } from 'lucide-react'
import { Button } from '@maison/ui'
import { Card } from '@maison/ui'
import OptimizedImage from '@/components/OptimizedImage'

import { FavorisViewData } from '@/types/views'
import { CartItem } from '@maison/domain'

export default function MobileFavorisView({ data }: { data: FavorisViewData }) {
  const { items, removeItem, isInCart, handleAddToCart, loadingProduct } = data

  return (
    <div className="w-full min-h-screen pb-20 bg-ecru/30 text-charbon">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-charbon/5 px-4 py-3 flex items-center gap-3">
        <h1 className="text-2xl font-serif flex items-center gap-2">
          <Heart className="w-6 h-6 fill-dore text-dore" /> Mes Favoris
        </h1>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {items.length === 0 ? (
          <Card className="p-12 text-center bg-white rounded-3xl border-charbon/5">
            <Heart className="w-16 h-16 mx-auto text-charbon/10 mb-6" />
            <h2 className="text-xl font-serif mb-4">Votre liste est vide</h2>
            <Button asChild className="bg-dore text-charbon rounded-2xl">
              <Link href="/boutique">Découvrir nos créations</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item: CartItem) => (
              <Card key={item.id} className="p-4 bg-white rounded-3xl border-charbon/5 overflow-hidden">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-ecru">
                    <OptimizedImage src={item.image_url || item.image || '/placeholder.jpg'} alt={item.nom} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-lg leading-tight mb-1">{item.nom}</h3>
                      <p className="text-dore font-serif">{item.prix.toLocaleString('fr-MA')} DH</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-dore text-charbon rounded-xl h-10"
                        onClick={() => handleAddToCart(item)}
                        disabled={loadingProduct}
                      >
                        {isInCart(item.id) ? <ShoppingCart className="w-4 h-4 mr-2" /> : <ShoppingBag className="w-4 h-4 mr-2" />}
                        {isInCart(item.id) ? "Voir" : "Ajouter"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-xl border-charbon/5 h-10 w-10 text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
