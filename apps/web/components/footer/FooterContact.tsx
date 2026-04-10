import { SiteSettings } from '@/types/index'

export function FooterContact({ settings, loading }: { settings: SiteSettings; loading: boolean }) {
  if (loading) return (
    <div>
      <h4 className="font-medium mb-4 text-dore">Contact</h4>
      <div className="space-y-2"><div className="h-4 bg-ecru/20 rounded animate-pulse"></div><div className="h-4 bg-ecru/20 rounded animate-pulse w-3/4"></div></div>
    </div>
  )

  const hasInfo = settings.email_entreprise?.trim() || settings.telephone?.trim() || settings.adresse?.trim()

  return (
    <div>
      <h4 className="font-medium mb-4 text-dore">Contact</h4>
      {hasInfo ? (
        <>
          {settings.email_entreprise?.trim() && <a href={`mailto:${settings.email_entreprise}`} className="text-ecru/80 hover:text-dore transition-colors text-sm block mb-2">{settings.email_entreprise}</a>}
          {settings.telephone?.trim() && <a href={`tel:${settings.telephone.replace(/\s/g, '')}`} className="text-ecru/80 hover:text-dore transition-colors text-sm block mb-2">{settings.telephone}</a>}
          {settings.adresse?.trim() && <p className="text-ecru/70 text-sm mb-2">{settings.adresse}</p>}
        </>
      ) : <p className="text-ecru/60 text-sm italic">Informations de contact à venir</p>}
      <p className="text-ecru/70 text-sm mb-2 mt-4">Livraison gratuite dans tout le Maroc</p>
      <p className="text-ecru/70 text-sm">Politique de retour : 7 jours</p>
    </div>
  )
}
