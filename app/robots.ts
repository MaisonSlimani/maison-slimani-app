import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maisonslimani.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/panier',
          '/favoris',
          '/checkout',
          '/api/',
          '/commande/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

