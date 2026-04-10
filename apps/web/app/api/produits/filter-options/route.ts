import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

import { ProductRepository } from '@maison/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const repo = new ProductRepository(supabase)
    const categorie = request.nextUrl.searchParams.get('categorie')

    const options = await repo.getFilterOptions(categorie || undefined)

    return NextResponse.json({
      success: true,
      data: options
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des options de filtre:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des options de filtre' },
      { status: 500 }
    )
  }
}

