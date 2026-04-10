import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils/product-urls'
import { Product, Category } from '@maison/domain'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) return NextResponse.redirect(new URL('/boutique', request.url), 302)

    const supabase = await createClient()

    const { data: produit } = await supabase
      .from('produits')
      .select('nom, categorie, slug')
      .eq('id', id)
      .maybeSingle()

    if (!produit) return NextResponse.redirect(new URL('/boutique', request.url), 302)
    const p = produit as unknown as Product

    if (!p.categorie) return NextResponse.redirect(new URL('/boutique', request.url), 302)

    const { data: category } = await supabase
      .from('categories')
      .select('slug')
      .eq('nom', p.categorie)
      .eq('active', true)
      .maybeSingle()

    if (!category) return NextResponse.redirect(new URL('/boutique', request.url), 302)
    const cat = category as unknown as Category

    const productSlug = p.slug || slugify(p.nom || '')
    return NextResponse.redirect(new URL(`/boutique/${cat.slug}/${productSlug}`, request.url), 301)
  } catch {
    return NextResponse.redirect(new URL('/boutique', request.url), 302)
  }
}
