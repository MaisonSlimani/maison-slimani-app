'use client'

import Link from 'next/link'

export function FooterNav() {
  return (
    <>
      <div>
        <h4 className="font-medium mb-4 text-dore">Navigation</h4>
        <nav className="flex flex-col gap-2">
          {['Accueil', 'Boutique', 'La Maison', 'Contact'].map(l => (
            <Link key={l} href={l === 'Accueil' ? '/' : `/${l.toLowerCase().replace(' ', '-')}`} className="text-ecru/80 hover:text-dore transition-colors text-sm">{l}</Link>
          ))}
        </nav>
      </div>
      <div>
        <h4 className="font-medium mb-4 text-dore">Informations</h4>
        <nav className="flex flex-col gap-2">
          {['FAQ', 'Politiques'].map(l => (
            <Link key={l} href={`/${l.toLowerCase()}`} className="text-ecru/80 hover:text-dore transition-colors text-sm">{l === 'Politiques' ? 'Politique de Retour' : l}</Link>
          ))}
        </nav>
      </div>
    </>
  )
}
