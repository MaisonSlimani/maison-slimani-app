'use client'

import { Facebook, Instagram } from 'lucide-react'

export function FooterBrand({ settings }: { settings: { facebook?: string | null; instagram?: string | null; description?: string | null } }) {
  return (
    <div>
      <h3 className="text-2xl font-serif mb-4">Maison <span className="text-dore">Slimani</span></h3>
      <p className="text-charbon/70 leading-relaxed mb-6">
        {settings.description || "L'excellence de la vannerie marocaine, entre tradition et modernité."}
      </p>
      {(settings.facebook || settings.instagram) && (
        <div className="flex gap-3 mt-6">
          {settings.facebook && <SocialLink href={settings.facebook} icon={Facebook} sr="Facebook" />}
          {settings.instagram && <SocialLink href={settings.instagram} icon={Instagram} sr="Instagram" />}
        </div>
      )}
    </div>
  )
}

interface SocialLinkProps {
  href: string
  icon: React.ElementType
  sr: string
}

function SocialLink({ href, icon: Icon, sr }: SocialLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-ecru/80 hover:text-dore transition-all p-2 hover:bg-ecru/20 rounded-lg border border-ecru/20 hover:border-dore/50" aria-label={sr} title={sr}>
      <Icon className="w-6 h-6" />
    </a>
  )
}
