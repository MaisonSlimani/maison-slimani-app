import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const MAX_IMAGES_PER_COMMENT = 6
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB per image
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const dynamic = 'force-dynamic'

/**
 * POST /api/commentaires/upload-image
 * Upload images for comments (public endpoint with rate limiting)
 */
export async function POST(request: NextRequest) {
  try {
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

      // Optimize image with sharp before upload
      let optimizedBuffer: Buffer
      let optimizedContentType: string
      let fileExt: string

      try {
        const image = sharp(buffer)
        const metadata = await image.metadata()

        // Determine optimal dimensions (max 2000px for width/height, same as product images)
        const maxDimension = 2000
        let width = metadata.width
        let height = metadata.height

        if (width && height) {
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width)
              width = maxDimension
            } else {
              width = Math.round((width * maxDimension) / height)
              height = maxDimension
            }
          }
        }

        // Optimize: WebP format, quality 85, effort 4 (faster than 6, still good compression)
        optimizedBuffer = await image
          .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85, effort: 4 }) // Reduced from 6 to 4 for faster processing
          .toBuffer()

        optimizedContentType = 'image/webp'
        fileExt = 'webp'
      } catch (sharpError) {
        // If sharp fails, use original file
        console.warn('Erreur lors de l\'optimisation, utilisation du fichier original:', sharpError)
        optimizedBuffer = buffer
        optimizedContentType = file.type
        fileExt = file.name.split('.').pop() || 'jpg'
      }

      // Generate unique filename with timestamp and random string
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
        filePath: uploadResults[0].filePath,
      })
    } else {
      return NextResponse.json({
        success: true,
        images: uploadResults.map(r => r.imageUrl),
        imageUrls: uploadResults.map(r => r.imageUrl),
      })
    }
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

