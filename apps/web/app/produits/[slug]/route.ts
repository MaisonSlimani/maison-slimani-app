import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Product, Category } from '@maison/domain'

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) return NextResponse.redirect(new URL('/boutique', request.url), 301)

    const supabase = await createClient()

    const { data: produits } = await supabase.from('produits').select('nom, categorie, slug')
    const productList = produits as unknown as Product[]
    const matched = productList?.find(p => (p.slug || slugify(p.nom || '')) === slug)

    if (!matched) return NextResponse.redirect(new URL('/boutique', request.url), 301)
    if (!matched.categorie) return NextResponse.redirect(new URL('/boutique', request.url), 301)

    const { data: category } = await supabase
      .from('categories')
      .select('slug')
      .eq('nom', matched.categorie)
      .eq('active', true)
      .maybeSingle()

    if (!category) return NextResponse.redirect(new URL('/boutique', request.url), 301)
    const cat = category as unknown as Category

    const productSlug = matched.slug || slugify(matched.nom || '')
    return NextResponse.redirect(new URL(`/boutique/${cat.slug}/${productSlug}`, request.url), 301)
  } catch {
    return NextResponse.redirect(new URL('/boutique', request.url), 301)
  }
}
