'use client'

import React from 'react'
import Image from 'next/image'
import { Button, Input, Label, Card } from '@maison/ui'
import { CheckoutLoading } from '@/components/CheckoutLoading'
import { useCheckout } from '@/app/checkout/useCheckout'
import { CartItem } from '@maison/domain'

export default function MobileCheckoutView() {
  const { items, total, isLoaded, loading, formData, setFormData, handleSubmit } = useCheckout()
  if (!isLoaded || items.length === 0) return null

  return (
    <div className="w-full min-h-screen pb-20 bg-background">
      <CheckoutLoading isLoading={loading} />
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border safe-area-top"><div className="h-14 px-4 flex items-center"><h1 className="text-xl font-serif">Finaliser la commande</h1></div></header>
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        <SummaryCard items={items} total={total} />
        <CheckoutForm loading={loading} formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}

function SummaryCard({ items, total }: { items: CartItem[]; total: number }) {
  return (
    <Card className="p-4 overflow-hidden border-border/50">
      <h2 className="text-lg font-serif mb-4">Votre Panier</h2>
      <div className="space-y-4 mb-4">
        {items.map((item) => (
          <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4 items-start">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted"><Image src={item.image_url || item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover" sizes="56px" /></div>
            <div className="flex-1 min-w-0"><p className="font-medium text-xs line-clamp-1">{item.name}</p><p className="text-[10px] text-muted-foreground uppercase">{item.quantity} × {item.price.toLocaleString('fr-MA')} MAD</p></div>
            <p className="font-bold text-xs">{(item.price * item.quantity).toLocaleString('fr-MA')} MAD</p>
          </div>
        ))}
      </div>
      <div className="border-t border-dashed pt-4 flex justify-between items-center px-1"><span className="text-lg font-serif">Total</span><span className="text-lg font-serif text-dore font-bold">{total.toLocaleString('fr-MA')} MAD</span></div>
      <p className="text-[10px] text-muted-foreground mt-2 text-center uppercase tracking-tighter">Livraison gratuite • Paiement à la livraison</p>
    </Card>
  )
}

import { Dispatch, SetStateAction } from 'react'

interface CheckoutFormData {
  customerName: string; phone: string; email: string; address: string; city: string
}

function CheckoutForm({ loading, formData, setFormData, onSubmit }: { loading: boolean; formData: CheckoutFormData; setFormData: Dispatch<SetStateAction<CheckoutFormData>>; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="p-5 border-0 bg-ecru/10 shadow-sm ring-1 ring-charbon/5">
        <h2 className="text-lg font-serif mb-5">Livraison</h2>
        <div className="space-y-4">
          <Field id="customerName" label="Nom complet *" value={formData.customerName} onChange={(v: string) => setFormData({ ...formData, customerName: v })} placeholder="Ex: Ahmed El Mansouri" />
          <Field id="phone" label="Téléphone *" type="tel" value={formData.phone} onChange={(v: string) => setFormData({ ...formData, phone: v })} placeholder="06XXXXXXXX" />
          <Field id="email" label="Email (optionnel)" type="email" value={formData.email || ''} onChange={(v: string) => setFormData({ ...formData, email: v })} placeholder="votre@email.com" />
          <Field id="address" label="Adresse *" value={formData.address} onChange={(v: string) => setFormData({ ...formData, address: v })} placeholder="Ex: 45 Rue de la Liberté" />
          <Field id="city" label="Ville *" value={formData.city} onChange={(v: string) => setFormData({ ...formData, city: v })} placeholder="Ex: Casablanca" />
        </div>
      </Card>
      <Button type="submit" size="lg" disabled={loading} className="w-full bg-charbon text-white h-12 text-sm font-serif font-bold tracking-[0.2em] uppercase shadow-md hover:bg-charbon/90 transition-all rounded-xl">{loading ? 'Traitement...' : 'Confirmer la Commande'}</Button>
    </form>
  )
}

function Field({ id, label, value, onChange, placeholder, type = 'text' }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs uppercase tracking-wider text-muted-foreground ml-1">{label}</Label>
      <Input id={id} required={label.includes('*')} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-background border-border/50 h-11" />
    </div>
  )
}
