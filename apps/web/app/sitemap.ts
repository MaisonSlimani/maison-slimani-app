import { MetadataRoute } from 'next'
import { ProductSitemapRepository, createClient } from '@maison/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maison-slimani.com'
  const baseStaticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/boutique`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/maison`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  try {
    const supabase = await createClient()
    const productSitemapRepo = new ProductSitemapRepository(supabase)
    const { categories, produits } = await productSitemapRepo.getSitemapData()

    const categoryPages: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${baseUrl}/boutique/${cat.slug}`,
      lastModified: cat.created_at ? new Date(cat.created_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    categoryPages.push({ url: `${baseUrl}/boutique/tous`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 })
 
    const categoryMap = new Map((categories || []).map((c) => [c.name, c.slug]))
    const productPages: MetadataRoute.Sitemap = (produits || []).flatMap((p) => {
      const categorySlug = p.category ? categoryMap.get(p.category) : null
      if (!categorySlug) return []
      return [{
        url: `${baseUrl}/boutique/${categorySlug}/${p.slug || p.id}`,
        lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }]
    })

    return [...baseStaticPages, ...categoryPages, ...productPages]
  } catch (err) {
    console.error('Sitemap error:', err)
    return baseStaticPages
  }
}
