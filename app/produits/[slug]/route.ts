import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Redirect from old product URL structure to new hierarchical structure
 * /produits/[slug] -> /boutique/[categorie]/[slug]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find product by slug
    const { data: produits } = await supabase
      .from('produits')
      .select('nom, categorie, slug')
    
    const matched = produits?.find(
      (produit) => {
        const productSlug = produit.slug || slugify(produit.nom || '')
        return productSlug === slug
      }
    )

    if (!matched) {
      // Product not found, redirect to boutique
      return NextResponse.redirect(new URL('/boutique', request.url), 301)
    }

    // Get category slug
    const { data: category } = await supabase
      .from('categories')
      .select('slug')
      .eq('nom', matched.categorie)
      .eq('active', true)
      .maybeSingle()

    if (!category) {
      // Category not found, redirect to boutique
      return NextResponse.redirect(new URL('/boutique', request.url), 301)
    }

    // Redirect to hierarchical URL
    const productSlug = matched.slug || slugify(matched.nom || '')
    const newUrl = new URL(`/boutique/${category.slug}/${productSlug}`, request.url)
    return NextResponse.redirect(newUrl, 301)
  } catch (error) {
    console.error('Error redirecting product:', error)
    // Fallback: redirect to boutique
    return NextResponse.redirect(new URL('/boutique', request.url), 301)
  }
}

