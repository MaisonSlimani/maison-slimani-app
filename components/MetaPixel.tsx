'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { trackPageView, initMetaPixel } from '@/lib/meta-pixel'

export default function MetaPixel() {
  const [pixelCode, setPixelCode] = useState<string | null>(null)
  const [pixelId, setPixelId] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const fetchPixelCode = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.meta_pixel_code) {
            const code = result.data.meta_pixel_code
            
            // Try to extract Pixel ID from the snippet
            const idMatch = code.match(/fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/i)
            if (idMatch && idMatch[1]) {
              setPixelId(idMatch[1])
            } else {
              // Fallback: use full snippet if ID extraction fails
              setPixelCode(code)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching Meta Pixel code:', error)
      }
    }
    fetchPixelCode()
  }, [])

  // Track page views on route changes
  useEffect(() => {
    if ((pixelId || pixelCode) && pathname) {
      // Wait a bit for pixel to initialize
      const timer = setTimeout(() => {
        if (initMetaPixel()) {
          trackPageView()
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [pathname, pixelId, pixelCode])

  // If we have Pixel ID, use standard implementation
  if (pixelId) {
    return (
      <>
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </>
    )
  }

  // Fallback: use full snippet if ID extraction failed
  if (pixelCode) {
    return (
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: pixelCode }}
      />
    )
  }

  return null
}

