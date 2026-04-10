'use client'

import { Button, GoldDivider } from '@maison/ui'
import StickyHeader from '@/components/pwa/StickyHeader'
import { hapticFeedback } from '@/lib/haptics'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import Image from 'next/image'
import Link from 'next/link'
import type { HomeViewData } from '@/types/views'
import { MobileHomeHero } from './MobileHomeHero'
import { MobileHomeCollections } from './MobileHomeCollections'
import { MobileHomeSelection } from './MobileHomeSelection'

export default function MobileHomeView({ data }: { data: HomeViewData }) {
  const { categories, produitsVedette, whatsappNumber } = data
  const maisonImage = '/assets/lookbook-atelier.jpg'

  return (
    <div className="w-full bg-ecru">
      <StickyHeader />
      <MobileHomeHero />
      <div className="bg-charbon text-ecru py-3 text-[10px] tracking-[0.2em] text-center uppercase font-light">Livraison Gratuite • Fait Main • Retours 7J</div>
      <MobileHomeCollections categories={categories} />
      <GoldDivider variant="centered" spacing="sm" />
      <MobileHomeSelection produits={produitsVedette} />
      <GoldDivider variant="centered" withIcon="sparkles" />
      
      <section className="px-4 py-8">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
          <Image src={maisonImage} alt="Atelier" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charbon/90 via-charbon/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 text-center">
            <p className="text-xl font-serif text-white italic mb-6">"Chaque paire raconte une histoire"</p>
            <Link href="/maison" className="text-dore font-serif text-lg">Découvrir la Maison {" >"}</Link>
          </div>
        </div>
      </section>

      {whatsappNumber && <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-serif mb-6 text-charbon">Contactez-nous</h2>
        <Button asChild size="lg" className="bg-charbon text-white rounded-xl h-16 w-full max-w-sm gap-3" onClick={() => hapticFeedback('medium')}>
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> Nous contacter</a>
        </Button>
      </section>}

      {whatsappNumber && <a href={`https://wa.me/${whatsappNumber}`} className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center"><WhatsAppIcon className="text-white w-7 h-7" /></a>}
    </div>
  )
}
