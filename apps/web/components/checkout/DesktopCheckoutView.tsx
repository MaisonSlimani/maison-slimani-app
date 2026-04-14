'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button, Input, Label, Card } from '@maison/ui'
import { CheckoutLoading } from '@/components/CheckoutLoading'
import { useCheckout } from '@/app/checkout/useCheckout'
import { CartItem } from '@maison/domain'

export default function DesktopCheckoutView() {
  const { items, total, isLoaded, loading, formData, setFormData, handleSubmit } = useCheckout()
  if (!isLoaded || items.length === 0) return <div className="min-h-screen pb-24 pt-20 flex items-center justify-center font-serif text-2xl">Chargement...</div>

  return (
    <div className="pb-24 pt-20">
      <CheckoutLoading isLoading={loading} />
      <div className="container px-6 py-8 mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          <h1 className="text-5xl font-serif mb-12">Finaliser votre commande</h1>
          <div className="grid lg:grid-cols-5 gap-12">
            <CheckoutFormSection loading={loading} formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
            <CheckoutSummarySection items={items} total={total} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

import { Dispatch, SetStateAction } from 'react'

interface CheckoutFormData {
  customerName: string; phone: string; email: string; address: string; city: string
}

function CheckoutFormSection({ loading, formData, setFormData, onSubmit }: { loading: boolean; formData: CheckoutFormData; setFormData: Dispatch<SetStateAction<CheckoutFormData>>; onSubmit: (e: React.FormEvent) => void }) {
  const fields = [
    { id: 'customerName' as const, label: 'Nom complet *', placeholder: 'Ahmed El Mansouri', type: 'text' },
    { id: 'phone' as const, label: 'Téléphone *', placeholder: '+212 6XX-XXXXXX', type: 'tel' }
  ]
  return (
    <div className="lg:col-span-3 space-y-8">
      <Card className="p-10 border-0 bg-secondary/20 shadow-sm">
        <h2 className="text-3xl font-serif mb-8">Informations de livraison</h2>
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            {fields.map(f => (
              <div key={f.id} className="space-y-2">
                <Label htmlFor={f.id} className="text-sm font-semibold">{f.label}</Label>
                <Input id={f.id} required type={f.type} className="h-12" value={formData[f.id] || ''} onChange={(e) => setFormData({ ...formData, [f.id]: e.target.value })} placeholder={f.placeholder} />
              </div>
            ))}
          </div>
          <div className="space-y-2"><Label htmlFor="email" className="text-sm font-semibold">Email (optionnel)</Label><Input id="email" type="email" className="h-12" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="votre@email.com" /></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><Label htmlFor="address" className="text-sm font-semibold">Adresse complète *</Label><Input id="address" required className="h-12" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="city" className="text-sm font-semibold">Ville *</Label><Input id="city" required className="h-12" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Casablanca, Rabat..." /></div>
          </div>
          <Button type="submit" size="lg" className="w-full bg-charbon text-white h-12 text-sm font-bold tracking-[0.2em] uppercase hover:bg-charbon/90 transition-all shadow-md mt-4" disabled={loading || !formData.customerName || !formData.phone || !formData.address || !formData.city}>{loading ? 'Traitement...' : 'Confirmer la commande'}</Button>
        </form>
      </Card>
      <div className="grid grid-cols-2 gap-6 px-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-10 h-10 rounded-full bg-dore/10 flex items-center justify-center text-dore">✓</div><p>Livraison Gratuite</p></div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-10 h-10 rounded-full bg-dore/10 flex items-center justify-center text-dore">✓</div><p>Paiement à la Livraison</p></div>
      </div>
    </div>
  )
}

function CheckoutSummarySection({ items, total }: { items: CartItem[]; total: number }) {
  return (
    <div className="lg:col-span-2">
      <Card className="p-8 sticky top-28 bg-white border-0 shadow-2xl ring-1 ring-border">
        <h2 className="text-2xl font-serif mb-8 border-b pb-4">Résumé</h2>
        <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
          {items.map((item) => (
            <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4 items-center">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted border"><Image src={item.image_url || item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover" sizes="80px" /></div>
              <div className="flex-1 min-w-0"><p className="font-bold text-sm truncate">{item.name}</p><p className="text-xs text-muted-foreground uppercase">{item.quantity} × {item.price.toLocaleString('fr-MA')} MAD</p></div>
              <p className="font-serif font-bold text-sm">{(item.price * item.quantity).toLocaleString('fr-MA')} MAD</p>
            </div>
          ))}
        </div>
        <div className="space-y-4 pt-6 border-t border-dashed">
          <div className="flex justify-between text-muted-foreground"><span>Sous-total</span><span>{total.toLocaleString('fr-MA')} MAD</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Livraison</span><span className="text-dore font-bold">Gratuite</span></div>
          <div className="flex justify-between items-center pt-4 border-t-2 border-charbon"><span className="text-2xl font-serif font-bold">Total</span><span className="text-3xl font-serif text-dore font-bold">{total.toLocaleString('fr-MA')} MAD</span></div>
        </div>
      </Card>
    </div>
  )
}
