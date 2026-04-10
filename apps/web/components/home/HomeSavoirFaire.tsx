'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@maison/ui'

const lookbookImage = '/assets/lookbook-1.jpg'

export function HomeSavoirFaire() {
  return (
    <section className="py-24 px-6 bg-ecru">
      <div className="container max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-5xl font-serif mb-8 text-charbon">Savoir-faire ancestral</h2>
          <p className="text-lg text-charbon/70 mb-8 leading-relaxed italic">
            Chaque paire est confectionnée à la main par nos maîtres artisans, dans le respect des traditions.
          </p>
          <Button asChild variant="outline" size="lg" className="border-charbon text-charbon">
            <Link href="/maison">En savoir plus</Link>
          </Button>
        </div>
        <div className="aspect-square relative rounded-lg overflow-hidden shadow-2xl">
          <Image src={lookbookImage} alt="Artisanat" fill className="object-cover" />
        </div>
      </div>
    </section>
  )
}
