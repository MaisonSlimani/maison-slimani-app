import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils/product-urls'

/**
 * Redirect from old PWA product URL structure to new hierarchical structure
 * /pwa/produit/[id] -> /boutique/[categorie]/[slug] (unified URL)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.redirect(new URL('/boutique', request.url), 302)
    }

    const supabase = await createClient()

    // Find product by ID
    const { data: produit, error: productError } = await supabase
      .from('produits')
      .select('nom, categorie, slug')
      .eq('id', id)
      .maybeSingle()

    if (productError || !produit) {
      return NextResponse.redirect(new URL('/boutique', request.url), 302)
    }

    if (!produit.categorie) {
      // No category, redirect to boutique
      return NextResponse.redirect(new URL('/boutique', request.url), 302)
    }

    // Get category slug
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('slug')
      .eq('nom', produit.categorie)
      .eq('active', true)
      .maybeSingle()

    if (categoryError || !category) {
      return NextResponse.redirect(new URL('/boutique', request.url), 302)
    }

    // Redirect to hierarchical URL (unified)
    const productSlug = produit.slug || slugify(produit.nom || '')
    const newUrl = new URL(`/boutique/${category.slug}/${productSlug}`, request.url)
    return NextResponse.redirect(newUrl, 301)
  } catch (error) {
    console.error('Error redirecting PWA product:', error)
    // Fallback: redirect to boutique
    return NextResponse.redirect(new URL('/boutique', request.url), 302)
  }
}

