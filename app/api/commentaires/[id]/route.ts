import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCommentaireSchema } from '@/lib/validations'
import { getSessionToken, validateSessionToken } from '@/lib/utils/comment-session'
import { shouldFlagAsSpam } from '@/lib/utils/spam-detection'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/commentaires/[id]
 * Update a comment (user must own it via session token)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = updateCommentaireSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get comment to check ownership
    const { data: comment, error: fetchError } = await supabase
      .from('commentaires')
      .select('session_token, commentaire')
      .eq('id', id)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json(
        { success: false, error: 'Commentaire introuvable' },
        { status: 404 }
      )
    }

    // Validate session token
    const userToken = await getSessionToken()
    if (!userToken || userToken !== comment.session_token) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = {}
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
      // Re-check for spam on update
      updateData.flagged = shouldFlagAsSpam(updateData.commentaire)
    }
    if (validation.data.images !== undefined) {
      const imagesArray = Array.isArray(validation.data.images) ? validation.data.images.filter(Boolean) : []
      if (imagesArray.length > 6) {
        return NextResponse.json(
          { success: false, error: 'Maximum 6 images autorisées' },
          { status: 400 }
        )
      }
      updateData.images = imagesArray
    }

    // Use service role client to bypass RLS since we've already validated ownership
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey)
    
    // Update comment using service role (bypasses RLS, but we've already validated ownership)
    const { data: updatedComment, error: updateError } = await serviceSupabase
      .from('commentaires')
      .update(updateData)
      .eq('id', id)
      .eq('session_token', userToken) // Double-check ownership
      .select('id, nom, email, rating, commentaire, images, created_at, updated_at')
      .single()

    if (updateError) {
      console.error('Erreur lors de la mise à jour du commentaire:', updateError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du commentaire', details: updateError.message },
        { status: 500 }
      )
    }

    if (!updatedComment) {
      return NextResponse.json(
        { success: false, error: 'Commentaire introuvable ou non autorisé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedComment,
    })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/commentaires/[id]
 * Delete a comment (user must own it via session token)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get comment to check ownership and get images
    const { data: comment, error: fetchError } = await supabase
      .from('commentaires')
      .select('session_token, images')
      .eq('id', id)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json(
        { success: false, error: 'Commentaire introuvable' },
        { status: 404 }
      )
    }

    // Validate session token
    const userToken = await getSessionToken()
    if (!userToken || userToken !== comment.session_token) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Delete images from Supabase Storage if they exist
    if (comment.images && Array.isArray(comment.images) && comment.images.length > 0) {
      try {
        // Create service role client for storage deletion
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        
        if (supabaseUrl && supabaseServiceKey) {
          const { createClient: createServiceClient } = await import('@supabase/supabase-js')
          const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey)
          
          // Extract file paths from image URLs
          const filePaths: string[] = []
          for (const imageUrl of comment.images) {
            if (typeof imageUrl === 'string' && imageUrl.includes('supabase.co/storage')) {
              // Extract path from URL: https://...supabase.co/storage/v1/object/public/produits-images/commentaires/...
              const urlMatch = imageUrl.match(/produits-images\/(.+)$/)
              if (urlMatch && urlMatch[1]) {
                filePaths.push(urlMatch[1])
              }
            }
          }
          
          // Delete files from storage
          if (filePaths.length > 0) {
            const { error: storageError } = await serviceSupabase.storage
              .from('produits-images')
              .remove(filePaths)
            
            if (storageError) {
              console.error('Erreur lors de la suppression des images:', storageError)
              // Continue with comment deletion even if image deletion fails
            }
          }
        }
      } catch (storageDeleteError) {
        console.error('Erreur lors de la suppression des images:', storageDeleteError)
        // Continue with comment deletion even if image deletion fails
      }
    }

    // Use service role client to bypass RLS since we've already validated ownership
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey)
    
    // Delete comment using service role (bypasses RLS, but we've already validated ownership)
    const { error: deleteError } = await serviceSupabase
      .from('commentaires')
      .delete()
      .eq('id', id)
      .eq('session_token', userToken) // Double-check ownership

    if (deleteError) {
      console.error('Erreur lors de la suppression du commentaire:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du commentaire', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

