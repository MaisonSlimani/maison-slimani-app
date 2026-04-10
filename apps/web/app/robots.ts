import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maison-slimani.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
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

