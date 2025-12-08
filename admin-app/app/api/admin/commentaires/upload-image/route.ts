import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'
import sharp from 'sharp'

const MAX_IMAGES_PER_COMMENT = 6
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB per image
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/commentaires/upload-image
 * Upload images for comments (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const singleFile = formData.get('file') as File

    // Support both single file and multiple files
    const filesToUpload: File[] = []
    if (files.length > 0) {
      filesToUpload.push(...files)
    } else if (singleFile) {
      filesToUpload.push(singleFile)
    }

    if (filesToUpload.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Limit number of images
    if (filesToUpload.length > MAX_IMAGES_PER_COMMENT) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_IMAGES_PER_COMMENT} images autorisées` },
        { status: 400 }
      )
    }

    // Validate files
    for (const file of filesToUpload) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Type de fichier non autorisé: ${file.name}. Utilisez JPEG, PNG ou WebP.` },
          { status: 400 }
        )
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `Fichier trop volumineux: ${file.name}. Taille maximale: 2MB` },
          { status: 400 }
        )
      }
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Process and upload all files in parallel for faster uploads
    const uploadPromises = filesToUpload.map(async (file) => {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Optimize image with sharp
      const optimizedBuffer = await sharp(buffer)
        .resize(2000, 2000, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85, effort: 4 })
        .toBuffer()

      const optimizedContentType = 'image/webp'
      const fileExt = 'webp'

      // Generate unique filename
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(7)
      const fileName = `commentaires/${timestamp}-${randomStr}.${fileExt}`
      const filePath = fileName

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('produits-images')
        .upload(filePath, optimizedBuffer, {
          contentType: optimizedContentType,
          upsert: false,
        })

      if (error) {
        console.error('Erreur lors de l\'upload:', error)
        throw new Error(`Erreur lors de l'upload de l'image: ${file.name}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('produits-images')
        .getPublicUrl(filePath)

      return {
        imageUrl: urlData.publicUrl,
        filePath,
        fileName: file.name,
      }
    })

    // Wait for all uploads to complete in parallel
    // Use Promise.allSettled to handle partial failures gracefully
    const results = await Promise.allSettled(uploadPromises)
    
    const uploadResults: Array<{ imageUrl: string; filePath: string; fileName: string }> = []
    const errors: string[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        uploadResults.push(result.value)
      } else {
        errors.push(`Erreur pour ${filesToUpload[index].name}: ${result.reason?.message || 'Erreur inconnue'}`)
      }
    })

    // If all uploads failed, return error
    if (uploadResults.length === 0) {
      return NextResponse.json(
        { success: false, error: errors.join('; ') || 'Erreur lors de l\'upload des images' },
        { status: 500 }
      )
    }

    // If some uploads failed, log warnings but return successful ones
    if (errors.length > 0) {
      console.warn('Certaines images n\'ont pas pu être uploadées:', errors)
    }

    // Return results
    if (uploadResults.length === 1) {
      return NextResponse.json({
        success: true,
        imageUrl: uploadResults[0].imageUrl,
        images: [uploadResults[0].imageUrl], // Also include as array for consistency
      })
    } else {
      return NextResponse.json({
        success: true,
        images: uploadResults.map(r => r.imageUrl),
        imageUrls: uploadResults.map(r => r.imageUrl), // Alias for backward compatibility
      })
    }
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

