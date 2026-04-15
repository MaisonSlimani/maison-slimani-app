import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@maison/ui'

const heroImage = '/assets/hero-chaussures.jpg'

/**
 * Optimized Server-Side Hero
 * Renders instantly to minimize LCP.
 */
export function HomeHero() {
  return (
    <section className="relative h-[80vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image - Optimized for LCP */}
      <Image 
        src={heroImage} 
        alt="Maison Slimani Hero" 
        fill 
        className="object-cover" 
        priority 
        sizes="100vw"
        fetchPriority="high"
      />
      
      {/* Dynamic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 md:from-black/30 md:via-black/20 md:to-black/40 z-[1]" />
      
      {/* Content Container - No JS blocking animations */}
      <div className="relative z-10 text-center container px-6 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-serif text-[#f8f5f0] mb-4 md:mb-6 leading-tight drop-shadow-lg">
          L'excellence du cuir <span className="text-dore drop-shadow-[0_0_15px_rgba(212,165,116,0.6)]">marocain</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-[#f8f5f0]/90 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed font-light md:font-normal">
          Artisanat d'exception fait main avec passion
        </p>
        
        <Button 
          asChild 
          size="lg" 
          className="bg-dore text-charbon hover:bg-dore/90 px-8 md:px-10 h-14 md:h-16 text-base md:text-lg rounded-xl md:rounded-md transition-all active:scale-95"
        >
          <Link href="/boutique">Découvrir la collection</Link>
        </Button>
      </div>
    </section>
  )
}
