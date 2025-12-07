import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'
import { z } from 'zod'

const adminCommentActionSchema = z.object({
  approved: z.boolean().optional(),
  flagged: z.boolean().optional(),
  nom: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional(),
  commentaire: z.string().min(1).optional(),
  images: z.array(z.string().url()).max(6).optional(),
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * PATCH /api/admin/commentaires/[id]
 * Admin actions: approve, reject, flag/unflag
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = adminCommentActionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (validation.data.approved !== undefined) {
      updateData.approved = validation.data.approved
    }
    if (validation.data.flagged !== undefined) {
      updateData.flagged = validation.data.flagged
    }
    if (validation.data.nom !== undefined) {
      updateData.nom = validation.data.nom.trim()
    }
    if (validation.data.email !== undefined) {
      updateData.email = validation.data.email?.trim() || null
    }
    if (validation.data.rating !== undefined) {
      updateData.rating = validation.data.rating
    }
    if (validation.data.commentaire !== undefined) {
      updateData.commentaire = validation.data.commentaire.trim()
    }
    if (validation.data.images !== undefined) {
      updateData.images = validation.data.images
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Aucune action spécifiée' },
        { status: 400 }
      )
    }

    const { data: updatedComment, error: updateError } = await supabase
      .from('commentaires')
      .update(updateData)
      .eq('id', id)
      .select('id, nom, email, rating, commentaire, images, flagged, approved, created_at, updated_at')
      .single()

    if (updateError) {
      console.error('Erreur lors de la mise à jour du commentaire:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du commentaire', details: updateError.message },
        { status: 500 }
      )
    }

    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Commentaire introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedComment,
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error?.message || 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/commentaires/[id]
 * Delete a single comment (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('commentaires')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erreur lors de la suppression du commentaire:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du commentaire', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error?.message || 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

