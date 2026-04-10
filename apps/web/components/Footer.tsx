'use client'

import { useFooterSettings } from '@/hooks/useFooterSettings'
import { FooterBrand } from './footer/FooterBrand'
import { FooterNav } from './footer/FooterNav'
import { FooterContact } from './footer/FooterContact'

const Footer = () => {
  const { settings, loading } = useFooterSettings()

  return (
    <footer className="bg-charbon text-ecru py-12 md:pb-12 pb-16 w-full">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <FooterBrand settings={settings} />
          <FooterNav />
          <FooterContact settings={settings} loading={loading} />
        </div>
        <div className="border-t border-ecru/20 pt-6 text-center text-ecru/60 text-xs">
          © {new Date().getFullYear()} Maison Slimani. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}

export default Footer
