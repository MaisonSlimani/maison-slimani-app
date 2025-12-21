import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maison-slimani.com'

  // Base static pages (always present)
  const baseStaticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/boutique`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/maison`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Fetch all dynamic data from Supabase
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase credentials missing, returning base static pages only')
      return baseStaticPages
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Fetch categories dynamically
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('nom, slug, date_creation')
      .eq('active', true)
      .order('ordre', { ascending: true })

    if (categoriesError) {
      console.error('Error fetching categories for sitemap:', categoriesError)
    }

    // Generate category pages dynamically
    const categoryPages: MetadataRoute.Sitemap = (categories || []).map((category) => ({
      url: `${baseUrl}/boutique/${category.slug}`,
      lastModified: category.date_creation ? new Date(category.date_creation) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Add "tous" category page (special case for "all products")
    categoryPages.push({
      url: `${baseUrl}/boutique/tous`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })

    // Fetch products with category info
    const { data: produits, error: produitsError } = await supabase
      .from('produits')
      .select('id, nom, date_ajout, categorie, slug')
      .order('date_ajout', { ascending: false })

    if (produitsError) {
      console.error('Error fetching products for sitemap:', produitsError)
    }

    // Create category map for quick lookup
    const categoryMap = new Map<string, string>()
    categories?.forEach(cat => {
      categoryMap.set(cat.nom, cat.slug)
    })

    // Helper function to generate slug from product name
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    }

    // Generate hierarchical product URLs: /boutique/[categorie]/[slug]
    const productPages: MetadataRoute.Sitemap = (produits || []).flatMap((produit) => {
      const productSlug = produit.slug || generateSlug(produit.nom || '')
      const categorySlug = produit.categorie ? categoryMap.get(produit.categorie) : null
      
      const pages: MetadataRoute.Sitemap = []
      
      // Add hierarchical URL (primary)
      if (categorySlug) {
        pages.push({
          url: `${baseUrl}/boutique/${categorySlug}/${productSlug}`,
          lastModified: new Date(produit.date_ajout),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        })
      }
      
      // Keep old URLs for backwards compatibility (lower priority)
      pages.push(
        {
          url: `${baseUrl}/produits/${productSlug}`,
          lastModified: new Date(produit.date_ajout),
          changeFrequency: 'weekly' as const,
          priority: 0.7, // Lower priority than hierarchical
        },
        {
          url: `${baseUrl}/produit/${produit.id}`,
          lastModified: new Date(produit.date_ajout),
          changeFrequency: 'weekly' as const,
          priority: 0.7, // Lower priority than hierarchical
        }
      )
      
      return pages
    })

    // Combine all pages
    return [...baseStaticPages, ...categoryPages, ...productPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return base static pages only if there's an error
    return baseStaticPages
  }
}

