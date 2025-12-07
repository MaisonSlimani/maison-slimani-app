import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'
import { revalidatePath, revalidateTag } from 'next/cache'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('produits')
      .select('id, nom, description, prix, stock, categorie, image_url, taille, tailles, vedette, has_colors, images, couleurs, date_ajout')
      .order('date_ajout', { ascending: false })

    if (error) {
      console.error('Erreur:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      nom,
      description,
      prix,
      stock,
      categorie,
      vedette,
      image_url,
      taille,
      tailles,
      has_colors,
      images,
      couleurs,
    } = body

    // Validation
    if (!nom || !description || prix === undefined) {
      return NextResponse.json(
        { error: 'Nom, description et prix sont requis' },
        { status: 400 }
      )
    }

    const produitData: any = {
      nom,
      description,
      prix: parseFloat(prix),
      stock: has_colors ? 0 : parseInt(stock || '0'),
      categorie: categorie || null,
      vedette: vedette || false,
      image_url: image_url || null,
      taille: taille || null,
      has_colors: has_colors || false,
      images: images || [],
      couleurs: couleurs || [],
    }

    const { data, error } = await supabase
      .from('produits')
      .insert(produitData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création:', error)
      return NextResponse.json(
        { error: error.message || 'Erreur lors de la création du produit' },
        { status: 500 }
      )
    }

    // Revalidate cache for new product
    try {
      if (data?.id) {
        revalidateTag('products')
        revalidatePath(`/produit/${data.id}`, 'page')
        revalidatePath(`/produits`, 'page')
        revalidatePath(`/pwa/produit/${data.id}`, 'page')
        revalidatePath(`/pwa/boutique`, 'page')
      }
    } catch (revalidateError) {
      console.error('Erreur lors de la revalidation du cache:', revalidateError)
      // Continue even if revalidation fails
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      id,
      nom,
      description,
      prix,
      stock,
      categorie,
      vedette,
      image_url,
      taille,
      tailles,
      has_colors,
      images,
      couleurs,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      )
    }

    // Validation
    if (!nom || !description || prix === undefined) {
      return NextResponse.json(
        { error: 'Nom, description et prix sont requis' },
        { status: 400 }
      )
    }

    // Process couleurs to ensure tailles structure
    let processedCouleurs = couleurs || []
    if (Array.isArray(processedCouleurs)) {
      processedCouleurs = processedCouleurs.map((c: any) => {
        // Remove taille if tailles exists
        const { taille: _, ...couleurWithoutTaille } = c
        return couleurWithoutTaille
      })
    }

    const produitData: any = {
      nom,
      description,
      prix: parseFloat(prix),
      stock: has_colors ? 0 : parseInt(stock || '0'),
      categorie: categorie || null,
      vedette: vedette || false,
      image_url: image_url || null,
      tailles: !has_colors && tailles && Array.isArray(tailles) && tailles.length > 0 ? tailles : null,
      has_colors: has_colors || false,
      images: images || [],
      couleurs: processedCouleurs,
    }

    const { data, error } = await supabase
      .from('produits')
      .update(produitData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour:', error)
      return NextResponse.json(
        { error: error.message || 'Erreur lors de la mise à jour du produit' },
        { status: 500 }
      )
    }

    // Revalidate cache for the updated product
    try {
      // Revalidate cache tags (this works for API routes)
      revalidateTag(PRODUCTS_CACHE_TAG)
      // Also revalidate paths for page routes
      revalidatePath(`/produit/${id}`, 'page')
      revalidatePath(`/produits`, 'page')
      revalidatePath(`/pwa/produit/${id}`, 'page')
      revalidatePath(`/pwa/boutique`, 'page')
    } catch (revalidateError) {
      console.error('Erreur lors de la revalidation du cache:', revalidateError)
      // Continue even if revalidation fails
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
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

    // Vérifier si le produit existe
    const { data: produit, error: fetchError } = await supabase
      .from('produits')
      .select('id, images, couleurs')
      .eq('id', id)
      .single()

    if (fetchError || !produit) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le produit
    const { error: deleteError } = await supabase
      .from('produits')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erreur lors de la suppression:', deleteError)
      return NextResponse.json(
        { error: deleteError.message || 'Erreur lors de la suppression du produit' },
        { status: 500 }
      )
    }

    // Revalidate cache after deletion
    try {
      revalidateTag('products')
      revalidatePath(`/produit/${id}`, 'page')
      revalidatePath(`/produits`, 'page')
      revalidatePath(`/pwa/produit/${id}`, 'page')
      revalidatePath(`/pwa/boutique`, 'page')
    } catch (revalidateError) {
      console.error('Erreur lors de la revalidation du cache:', revalidateError)
      // Continue even if revalidation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès',
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

