import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ProductRepository, CategoryRepository } from '@maison/db'
import { slugify } from '@/lib/utils/product-urls'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) return NextResponse.redirect(new URL('/boutique', request.url), 301)

    const supabase = await createClient()
    const productRepo = new ProductRepository(supabase)
    const categoryRepo = new CategoryRepository(supabase)

    // 1. Try finding product by native slug column first
    const product = await productRepo.findBySlug(slug)
    
    // 2. If not found, it might be a legacy URL based on name-slug
    let matchedProduct = product
    if (!matchedProduct) {
      const allProducts = await productRepo.findAll()
      matchedProduct = allProducts.find(p => slugify(p.nom || '') === slug) || null
    }

    if (!matchedProduct || !matchedProduct.categorie) {
      return NextResponse.redirect(new URL('/boutique', request.url), 301)
    }

    // 3. Find target category slug
    const allCategories = await categoryRepo.findAllActive()
    const category = allCategories.find(c => c.nom === matchedProduct!.categorie)
    
    if (!category) return NextResponse.redirect(new URL('/boutique', request.url), 301)

    const productPathSlug = matchedProduct.slug || slugify(matchedProduct.nom || '')
    return NextResponse.redirect(new URL(`/boutique/${category.slug}/${productPathSlug}`, request.url), 301)
  } catch (error) {
    console.error('Redirect route error:', error)
    return NextResponse.redirect(new URL('/boutique', request.url), 301)
  }
}
