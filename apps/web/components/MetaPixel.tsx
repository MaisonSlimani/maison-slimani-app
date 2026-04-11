'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { trackPageView, initMetaPixel } from '@/lib/analytics'
import { apiFetch, ENDPOINTS } from '@/lib/api/client'
import { SiteSettings } from '@maison/domain'

export default function MetaPixel() {
  const { pixelId, pixelCode } = usePixelSettings()
  const pathname = usePathname()

  useEffect(() => {
    if ((pixelId || pixelCode) && pathname) {
      const timer = setTimeout(() => { if (initMetaPixel()) trackPageView() }, 500)
      return () => clearTimeout(timer)
    }
  }, [pathname, pixelId, pixelCode])

  if (pixelId) return <MetaPixelStandard id={pixelId} />
  if (pixelCode) return <Script id="meta-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: pixelCode }} />
  return null
}

function usePixelSettings() {
  const [settings, setSettings] = useState<{ pixelId: string | null; pixelCode: string | null }>({ pixelId: null, pixelCode: null })
  useEffect(() => {
    apiFetch<SiteSettings>(ENDPOINTS.SETTINGS).then(result => {
      if (result.success && result.data?.meta_pixel_code) {
        const code = result.data.meta_pixel_code as string
        const idMatch = code.match(/fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/i)
        setSettings(idMatch ? { pixelId: idMatch[1], pixelCode: null } : { pixelId: null, pixelCode: code })
      }
    }).catch(console.error)
  }, [])
  return settings
}

function MetaPixelStandard({ id }: { id: string }) {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${id}');fbq('track', 'PageView');` }} />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: 'none' }} src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`} alt="" />
      </noscript>
    </>
  )
}
