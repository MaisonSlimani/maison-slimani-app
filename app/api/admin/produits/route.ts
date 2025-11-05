import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET - Récupérer tous les produits
export async function GET(request: NextRequest) {
  try {
    // Vérifier la session admin
    const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    })
    
    const sessionData = await sessionResponse.json()
    
    if (!sessionData.authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Utiliser la SERVICE_ROLE_KEY pour contourner RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('produits')
      .select('*')
      .order('date_ajout', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des produits:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un produit
export async function POST(request: NextRequest) {
  try {
    // Vérifier la session admin
    const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    })
    
    const sessionData = await sessionResponse.json()
    
    if (!sessionData.authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nom, description, prix, stock, categorie, vedette, image_url, taille, has_colors, images, couleurs } = body

    if (!nom || !description || prix === undefined || stock === undefined || !categorie) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Utiliser la SERVICE_ROLE_KEY pour contourner RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const insertData: any = {
      nom,
      description,
      prix: parseFloat(prix),
      stock: parseInt(stock),
      categorie,
      vedette: vedette || false,
      image_url: image_url || null,
      taille: taille || null,
      has_colors: has_colors || false,
    }

    // Ajouter images et couleurs si fournis (même si vides)
    if (images !== undefined) {
      insertData.images = Array.isArray(images) ? images : null
    }
    if (couleurs !== undefined) {
      insertData.couleurs = Array.isArray(couleurs) ? couleurs : null
    }

    // Debug: log what we're inserting
    console.log('📦 Insertion produit:', {
      nom: insertData.nom,
      hasImages: !!insertData.images,
      imagesCount: insertData.images?.length || 0,
      hasCouleurs: !!insertData.couleurs,
      couleursCount: insertData.couleurs?.length || 0,
    })

    const { data, error } = await supabase
      .from('produits')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création du produit:', error)
      console.error('Données envoyées:', insertData)
      return NextResponse.json(
        { error: `Erreur lors de la création du produit: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Modifier un produit
export async function PUT(request: NextRequest) {
  try {
    // Vérifier la session admin
    const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    })
    
    const sessionData = await sessionResponse.json()
    
    if (!sessionData.authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, nom, description, prix, stock, categorie, vedette, image_url, taille, has_colors, images, couleurs } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      )
    }

    // Utiliser la SERVICE_ROLE_KEY pour contourner RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const updateData: any = {}
    if (nom) updateData.nom = nom
    if (description) updateData.description = description
    if (prix !== undefined) updateData.prix = parseFloat(prix)
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (categorie) updateData.categorie = categorie
    if (vedette !== undefined) updateData.vedette = vedette
    if (image_url !== undefined) updateData.image_url = image_url || null
    if (taille !== undefined) updateData.taille = taille || null
    if (has_colors !== undefined) updateData.has_colors = has_colors
    // Ajouter images et couleurs (même si vides)
    if (images !== undefined) updateData.images = Array.isArray(images) ? images : null
    if (couleurs !== undefined) updateData.couleurs = Array.isArray(couleurs) ? couleurs : null

    // Debug: log what we're updating
    console.log('📦 Mise à jour produit:', {
      id,
      hasImages: !!updateData.images,
      imagesCount: updateData.images?.length || 0,
      hasCouleurs: !!updateData.couleurs,
      couleursCount: updateData.couleurs?.length || 0,
    })

    const { data, error } = await supabase
      .from('produits')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour du produit:', error)
      console.error('Données envoyées:', updateData)
      return NextResponse.json(
        { error: `Erreur lors de la mise à jour du produit: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un produit
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier la session admin
    const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    })
    
    const sessionData = await sessionResponse.json()
    
    if (!sessionData.authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      )
    }

    // Utiliser la SERVICE_ROLE_KEY pour contourner RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('produits')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression du produit:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du produit' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

