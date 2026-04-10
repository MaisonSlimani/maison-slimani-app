import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

// Try to load from .env.local or .env
import { readFileSync } from 'fs'
import { join } from 'path'

function loadEnv() {
  const envFiles = ['.env.local', '.env']
  for (const file of envFiles) {
    try {
      const envPath = join(process.cwd(), file)
      const envContent = readFileSync(envPath, 'utf-8')
      envContent.split('\n').forEach((line) => {
        const match = line.match(/^([^=:#]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          const value = match[2].trim().replace(/^["']|["']$/g, '')
          if (!process.env[key]) {
            process.env[key] = value
          }
        }
      })
    } catch (e) {
      // File doesn't exist, continue
    }
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  console.error('Either in .env.local, .env, or as environment variables')
  process.exit(1)
}

interface OptimizationStats {
  total: number
  optimized: number
  skipped: number
  errors: number
  totalOriginalSize: number
  totalOptimizedSize: number
  processedFiles: Array<{
    original: string
    optimized: string
    originalSize: number
    optimizedSize: number
    reduction: number
  }>
}

async function optimizeTestImages() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const stats: OptimizationStats = {
    total: 0,
    optimized: 0,
    skipped: 0,
    errors: 0,
    totalOriginalSize: 0,
    totalOptimizedSize: 0,
    processedFiles: [],
  }

  console.log('🧪 TEST MODE: Optimizing 5 largest images...\n')

  // List all files in the produits-images bucket
  const { data: files, error } = await supabase.storage
    .from('produits-images')
    .list('produits', {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'asc' },
    })

  if (error) {
    console.error('❌ Error listing files:', error)
    return
  }

  if (!files || files.length === 0) {
    console.log('❌ No files found')
    return
  }

  // Filter out already optimized WebP files and sort by size (largest first)
  const filesToOptimize = files
    .filter((file) => !file.name.endsWith('.webp'))
    .map((file) => ({
      ...file,
      size: parseInt(file.metadata?.size || '0', 10),
    }))
    .sort((a, b) => b.size - a.size) // Sort by size descending
    .slice(0, 5) // Take top 5 largest

  stats.total = filesToOptimize.length

  console.log(`📊 Found ${files.length} total images`)
  console.log(`📊 Processing top ${filesToOptimize.length} largest images:\n`)

  filesToOptimize.forEach((file, index) => {
    console.log(
      `  ${index + 1}. ${file.name} - ${(file.size / 1024 / 1024).toFixed(2)} MB`
    )
  })

  console.log('\n' + '='.repeat(60) + '\n')

  // Process files sequentially for testing
  for (const file of filesToOptimize) {
    await optimizeSingleImage(supabase, file, stats)
  }

  // Print final statistics
  console.log('\n' + '='.repeat(60))
  console.log('📈 OPTIMIZATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total images processed: ${stats.total}`)
  console.log(`✅ Optimized: ${stats.optimized}`)
  console.log(`⏭️  Skipped: ${stats.skipped}`)
  console.log(`❌ Errors: ${stats.errors}`)
  console.log(
    `💾 Original total size: ${(stats.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`
  )
  console.log(
    `💾 Optimized total size: ${(stats.totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`
  )
  const savings =
    stats.totalOriginalSize > 0
      ? ((stats.totalOriginalSize - stats.totalOptimizedSize) /
          stats.totalOriginalSize) *
        100
      : 0
  console.log(
    `💰 Space saved: ${((stats.totalOriginalSize - stats.totalOptimizedSize) / 1024 / 1024).toFixed(2)} MB (${savings.toFixed(1)}%)`
  )
  console.log('='.repeat(60))

  // Print verification info
  if (stats.processedFiles.length > 0) {
    console.log('\n📋 VERIFICATION INFO')
    console.log('='.repeat(60))
    console.log('Processed files:')
    stats.processedFiles.forEach((file, index) => {
      console.log(`\n${index + 1}. ${file.original}`)
      console.log(`   → ${file.optimized}`)
      console.log(
        `   Size: ${(file.originalSize / 1024 / 1024).toFixed(2)} MB → ${(file.optimizedSize / 1024 / 1024).toFixed(2)} MB (${file.reduction.toFixed(1)}% reduction)`
      )
    })
    console.log('\n' + '='.repeat(60))
    console.log('\n✅ To verify, check:')
    console.log('1. Supabase Storage: produits-images bucket')
    console.log('2. Look for new .webp files')
    console.log('3. Check database products that reference these images')
    console.log('\nRun verification query in Supabase SQL Editor:')
    console.log('='.repeat(60))
    console.log(`
SELECT 
  name,
  metadata->>'size' as size_bytes,
  (metadata->>'size')::bigint / 1024 / 1024 as size_mb,
  created_at
FROM storage.objects
WHERE bucket_id = 'produits-images'
  AND name LIKE 'produits/%'
  AND (
    ${stats.processedFiles.map(f => `name LIKE '%${f.optimized.split('/').pop()}%'`).join(' OR ')}
  )
ORDER BY (metadata->>'size')::bigint DESC;
    `)
    console.log('='.repeat(60))
  }
}

async function optimizeSingleImage(
  supabase: any,
  file: any,
  stats: OptimizationStats
) {
  const filePath = `produits/${file.name}`
  const originalSize = file.size || parseInt(file.metadata?.size || '0', 10)

  try {
    console.log(
      `\n🔄 Processing: ${file.name} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`
    )

    // Download the original image
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('produits-images')
      .download(filePath)

    if (downloadError) {
      console.error(`❌ Error downloading ${file.name}:`, downloadError.message)
      stats.errors++
      return
    }

    // Convert to buffer
    const buffer = Buffer.from(await imageData.arrayBuffer())

    // Optimize with sharp
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Determine optimal dimensions (max 2000px)
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

    console.log(`   Original dimensions: ${metadata.width}x${metadata.height}`)
    console.log(`   Target dimensions: ${width}x${height}`)

    // Optimize: WebP format, quality 85
    const optimizedBuffer = await image
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85, effort: 6 })
      .toBuffer()

    const optimizedSize = optimizedBuffer.length

    // Generate new filename (replace extension with .webp)
    const newFileName = file.name.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp')
    const newPath = `produits/${newFileName}`

    console.log(`   Uploading optimized version: ${newFileName}`)

    // Upload optimized version
    const { error: uploadError } = await supabase.storage
      .from('produits-images')
      .upload(newPath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: true, // Overwrite if exists
      })

    if (uploadError) {
      console.error(`❌ Error uploading optimized ${newFileName}:`, uploadError.message)
      stats.errors++
      return
    }

    // Get the new public URL
    const { data: urlData } = supabase.storage
      .from('produits-images')
      .getPublicUrl(newPath)

    const newPublicUrl = urlData.publicUrl

    // Update database references in produits table
    console.log(`   Updating database references...`)

    // Find products that reference this image
    const { data: products, error: findError } = await supabase
      .from('produits')
      .select('id, nom, image_url, images')
      .or(`image_url.ilike.%${file.name}%,images.cs.{${file.name}}`)

    if (!findError && products && products.length > 0) {
      console.log(`   Found ${products.length} product(s) referencing this image`)
      
      for (const product of products) {
        const updates: any = {}

        // Update image_url if it contains the old filename
        if (product.image_url && product.image_url.includes(file.name)) {
          updates.image_url = product.image_url.replace(file.name, newFileName)
          console.log(`   → Updating image_url for product: ${product.nom}`)
        }

        // Update images array if it contains the old filename
        if (product.images && Array.isArray(product.images)) {
          let updated = false
          updates.images = product.images.map((img: any) => {
            if (typeof img === 'string' && img.includes(file.name)) {
              updated = true
              return img.replace(file.name, newFileName)
            }
            if (typeof img === 'object' && img.url && img.url.includes(file.name)) {
              updated = true
              return { ...img, url: img.url.replace(file.name, newFileName) }
            }
            return img
          })
          
          if (updated) {
            console.log(`   → Updating images array for product: ${product.nom}`)
          }
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('produits')
            .update(updates)
            .eq('id', product.id)

          if (updateError) {
            console.warn(`   ⚠️  Could not update product ${product.id}:`, updateError.message)
          } else {
            console.log(`   ✅ Updated product: ${product.nom}`)
          }
        }
      }
    } else {
      console.log(`   ℹ️  No products found referencing this image`)
    }

    const sizeReduction = ((originalSize - optimizedSize) / originalSize) * 100
    console.log(
      `✅ Optimized: ${file.name} → ${newFileName}`
    )
    console.log(
      `   ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(optimizedSize / 1024 / 1024).toFixed(2)} MB (${sizeReduction.toFixed(1)}% reduction)`
    )

    stats.totalOriginalSize += originalSize
    stats.totalOptimizedSize += optimizedSize
    stats.optimized++

    stats.processedFiles.push({
      original: file.name,
      optimized: newFileName,
      originalSize,
      optimizedSize,
      reduction: sizeReduction,
    })
  } catch (error) {
    console.error(`❌ Error processing ${file.name}:`, error)
    stats.errors++
  }
}

// Run the optimization
optimizeTestImages()
  .then(() => {
    console.log('\n✅ Test optimization complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

