import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
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
  console.error('Missing Supabase credentials')
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

async function createOptimizedVersions() {
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

  console.log('🔄 Script 2: Creating Optimized Versions\n')
  console.log('='.repeat(60))

  // List all non-WebP files in storage
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
    console.log('✅ No files found')
    return
  }

  // Filter out already optimized WebP files
  const filesToOptimize = files.filter((file) => !file.name.endsWith('.webp'))

  stats.total = filesToOptimize.length

  console.log(`📊 Found ${files.length} total images`)
  console.log(`📊 ${filesToOptimize.length} need optimization\n`)

  if (filesToOptimize.length === 0) {
    console.log('✅ All images are already optimized!')
    return
  }

  // Process files in batches
  const BATCH_SIZE = 5
  for (let i = 0; i < filesToOptimize.length; i += BATCH_SIZE) {
    const batch = filesToOptimize.slice(i, i + BATCH_SIZE)
    console.log(
      `\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(filesToOptimize.length / BATCH_SIZE)}`
    )

    await Promise.all(
      batch.map((file) => optimizeSingleImage(supabase, file, stats))
    )
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

  // Save processed files list for next script
  if (stats.processedFiles.length > 0) {
    console.log('\n📋 Processed files (for reference):')
    stats.processedFiles.forEach((file, index) => {
      console.log(
        `${index + 1}. ${file.original} → ${file.optimized} (${file.reduction.toFixed(1)}% reduction)`
      )
    })
  }
}

async function optimizeSingleImage(
  supabase: any,
  file: any,
  stats: OptimizationStats
) {
  const filePath = `produits/${file.name}`
  const originalSize = parseInt(file.metadata?.size || '0', 10)

  try {
    // Skip if already WebP
    if (file.name.endsWith('.webp')) {
      stats.skipped++
      return
    }

    console.log(`\n🔄 Processing: ${file.name} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`)

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

    const sizeReduction = ((originalSize - optimizedSize) / originalSize) * 100
    console.log(
      `✅ Optimized: ${file.name} → ${newFileName} (${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(optimizedSize / 1024 / 1024).toFixed(2)} MB, ${sizeReduction.toFixed(1)}% reduction)`
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
createOptimizedVersions()
  .then(() => {
    console.log('\n✅ Script 2 complete!')
    console.log('📝 Next step: Run script 3 to update database references')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

