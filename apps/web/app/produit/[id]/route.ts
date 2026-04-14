import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ProductRepository, CategoryRepository } from '@maison/db'
import { slugify } from '@/lib/utils/product-urls'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.redirect(new URL('/boutique', request.url), 302)

    const supabase = await createClient()
    const productRepo = new ProductRepository(supabase)
    const categoryRepo = new CategoryRepository(supabase)

    const product = await productRepo.findById(id)
    if (!product || !product.category) {
      return NextResponse.redirect(new URL('/boutique', request.url), 302)
    }

    const allCategories = await categoryRepo.findAllActive()
    const category = allCategories.find(c => c.name === product.category)
    
    if (!category) return NextResponse.redirect(new URL('/boutique', request.url), 302)

    const productSlug = product.slug || slugify(product.name || '')
    return NextResponse.redirect(new URL(`/boutique/${category.slug}/${productSlug}`, request.url), 301)
  } catch (error) {
    console.error('Redirect route error:', error)
    return NextResponse.redirect(new URL('/boutique', request.url), 302)
  }
}
