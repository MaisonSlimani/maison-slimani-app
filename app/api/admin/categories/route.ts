import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { verifyAdminSession } from '@/lib/auth/session'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const schemaCategorie = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  description: z.string().optional(),
  image_url: z.string().optional().nullable(),
  couleur: z.string().optional(),
  ordre: z.number().int().optional(),
  active: z.boolean().optional(),
})

export async function GET() {
  try {
    // Vérifier la session admin
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('ordre', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Vérifier la session admin
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = schemaCategorie.parse(body)

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('categories')
      .insert(validatedData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Erreur lors de la création de la catégorie:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Vérifier la session admin
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const validatedData = schemaCategorie.partial().parse(updateData)

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('categories')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Vérifier la session admin
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    )

    // Vérifier si des produits utilisent cette catégorie
    const { data: produits } = await supabase
      .from('produits')
      .select('id')
      .eq('categorie', id)
      .limit(1)

    if (produits && produits.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une catégorie utilisée par des produits' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la catégorie:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

