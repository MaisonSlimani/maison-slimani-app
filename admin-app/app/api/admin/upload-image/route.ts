import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
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
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Vérifier le type de fichier et la taille pour tous les fichiers
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    for (const file of filesToUpload) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Type de fichier non autorisé: ${file.name}. Utilisez JPEG, PNG ou WebP.` },
          { status: 400 }
        )
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `Fichier trop volumineux: ${file.name}. Taille maximale: 5MB` },
          { status: 400 }
        )
      }
    }

    // Utiliser la SERVICE_ROLE_KEY pour uploader vers Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Upload tous les fichiers
    const uploadResults = []
    for (const file of filesToUpload) {
      // Convertir le fichier en buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Optimiser l'image avec sharp avant l'upload
      // Convertir en WebP pour meilleure compression, qualité 85
      let optimizedBuffer: Buffer
      let optimizedContentType: string
      let fileExt: string

      try {
        const image = sharp(buffer)
        const metadata = await image.metadata()

        // Déterminer les dimensions optimales (max 2000px pour la largeur/hauteur)
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

        // Optimiser l'image: WebP format, qualité 85, redimensionner si nécessaire
        optimizedBuffer = await image
          .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85, effort: 6 })
          .toBuffer()

        optimizedContentType = 'image/webp'
        fileExt = 'webp'
      } catch (optimizationError) {
        console.warn('Erreur lors de l\'optimisation, utilisation de l\'image originale:', optimizationError)
        // Si l'optimisation échoue, utiliser l'image originale
        optimizedBuffer = buffer
        optimizedContentType = file.type
        fileExt = file.name.split('.').pop() || 'jpg'
      }

      // Générer un nom de fichier unique
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `produits/${fileName}`

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('produits-images')
        .upload(filePath, optimizedBuffer, {
          contentType: optimizedContentType,
          upsert: false,
        })

      if (error) {
        console.error('Erreur lors de l\'upload:', error)
        return NextResponse.json(
          { error: `Erreur lors de l'upload de l'image: ${file.name}` },
          { status: 500 }
        )
      }

      // Obtenir l'URL publique de l'image
      const { data: urlData } = supabase.storage
        .from('produits-images')
        .getPublicUrl(filePath)

      uploadResults.push({
        imageUrl: urlData.publicUrl,
        filePath,
        fileName: file.name,
      })
    }

    // Retourner un seul résultat si un seul fichier, sinon un tableau
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
        imageUrls: uploadResults.map(r => r.imageUrl), // Alias for backward compatibility
      })
    }
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

