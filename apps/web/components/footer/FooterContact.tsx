import { SiteSettings } from '@maison/domain'

export function FooterContact({ settings, loading }: { settings: SiteSettings; loading: boolean }) {
  if (loading) return (
    <div>
      <h4 className="font-medium mb-4 text-dore">Contact</h4>
      <div className="space-y-2"><div className="h-4 bg-ecru/20 rounded animate-pulse"></div><div className="h-4 bg-ecru/20 rounded animate-pulse w-3/4"></div></div>
    </div>
  )

  const hasInfo = settings.companyEmail?.trim() || settings.phone?.trim() || settings.address?.trim()

  return (
    <div>
      <h4 className="font-medium mb-4 text-dore">Contact</h4>
      {hasInfo ? (
        <>
          {settings.companyEmail?.trim() && <a href={`mailto:${settings.companyEmail}`} className="text-ecru/80 hover:text-dore transition-colors text-sm block mb-2">{settings.companyEmail}</a>}
          {settings.phone?.trim() && <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="text-ecru/80 hover:text-dore transition-colors text-sm block mb-2">{settings.phone}</a>}
          {settings.address?.trim() && <p className="text-ecru/70 text-sm mb-2">{settings.address}</p>}
        </>
      ) : <p className="text-ecru/60 text-sm italic">Informations de contact à venir</p>}
      <p className="text-ecru/70 text-sm mb-2 mt-4">Livraison gratuite dans tout le Maroc</p>
      <p className="text-ecru/70 text-sm">Politique de retour : 7 jours</p>
    </div>
  )
}
