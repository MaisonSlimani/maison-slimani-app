import { createClient } from '@supabase/supabase-js'
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

interface CleanupStats {
  total: number
  deleted: number
  errors: number
  totalSize: number
  skipped: number
}

async function removeUnoptimizedFiles() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const stats: CleanupStats = {
    total: 0,
    deleted: 0,
    errors: 0,
    totalSize: 0,
    skipped: 0,
  }

  console.log('🗑️  Script 4: Removing Unoptimized Files from Storage\n')
  console.log('='.repeat(60))
  console.log('⚠️  WARNING: This will permanently delete original PNG/JPEG files!')
  console.log('⚠️  Make sure you have:')
  console.log('   1. Run Script 2 to create optimized versions')
  console.log('   2. Run Script 3 to update database references')
  console.log('   3. Verified that website is working with WebP images')
  console.log('='.repeat(60))
  console.log('')

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

  // Filter out WebP files (keep only PNG/JPEG)
  const filesToDelete = files.filter(
    (file) =>
      file.name.endsWith('.png') ||
      file.name.endsWith('.jpg') ||
      file.name.endsWith('.jpeg') ||
      file.name.endsWith('.PNG') ||
      file.name.endsWith('.JPG') ||
      file.name.endsWith('.JPEG')
  )

  stats.total = filesToDelete.length

  console.log(`📊 Found ${files.length} total images`)
  console.log(`📊 ${filesToDelete.length} unoptimized files to delete\n`)

  if (filesToDelete.length === 0) {
    console.log('✅ No unoptimized files found!')
    return
  }

  // Show files that will be deleted
  console.log('📋 Files to be deleted:')
  let totalSize = 0
  filesToDelete.forEach((file, index) => {
    const size = parseInt(file.metadata?.size || '0', 10)
    totalSize += size
    console.log(
      `  ${index + 1}. ${file.name} (${(size / 1024 / 1024).toFixed(2)} MB)`
    )
  })

  stats.totalSize = totalSize

  console.log(`\n💾 Total size to free: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log('\n' + '='.repeat(60))

  // Verify WebP versions exist before deleting
  console.log('\n🔍 Verifying WebP versions exist...\n')

  const filesToDeleteVerified: Array<{ path: string; size: number; hasWebP: boolean }> = []

  for (const file of filesToDelete) {
    const filePath = `produits/${file.name}`
    const size = parseInt(file.metadata?.size || '0', 10)

    // Check if WebP version exists
    const webpFileName = file.name.replace(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/i, '.webp')
    const webpPath = `produits/${webpFileName}`

    const { data: webpFile, error: checkError } = await supabase.storage
      .from('produits-images')
      .list('produits', {
        search: webpFileName,
      })

    const hasWebP = !checkError && webpFile && webpFile.length > 0

    filesToDeleteVerified.push({
      path: filePath,
      size,
      hasWebP,
    })

    if (hasWebP) {
      console.log(`✅ ${file.name} → ${webpFileName} exists, safe to delete`)
    } else {
      console.log(`⚠️  ${file.name} → ${webpFileName} NOT FOUND, will skip deletion`)
      stats.skipped++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🗑️  Starting deletion...\n')

  // Delete files (only those with WebP versions)
  for (const fileInfo of filesToDeleteVerified) {
    if (!fileInfo.hasWebP) {
      console.log(`⏭️  Skipping ${fileInfo.path.split('/')[1]} (no WebP version)`)
      continue
    }

    try {
      const { error: deleteError } = await supabase.storage
        .from('produits-images')
        .remove([fileInfo.path])

      if (deleteError) {
        console.error(`❌ Error deleting ${fileInfo.path.split('/')[1]}:`, deleteError.message)
        stats.errors++
      } else {
        console.log(`✅ Deleted: ${fileInfo.path.split('/')[1]}`)
        stats.deleted++
      }
    } catch (error) {
      console.error(`❌ Error deleting ${fileInfo.path}:`, error)
      stats.errors++
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60))
  console.log('📈 CLEANUP SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total files found: ${stats.total}`)
  console.log(`✅ Files deleted: ${stats.deleted}`)
  console.log(`⏭️  Files skipped: ${stats.skipped}`)
  console.log(`❌ Errors: ${stats.errors}`)
  console.log(`💾 Space freed: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log('='.repeat(60))
}

// Run the cleanup
removeUnoptimizedFiles()
  .then(() => {
    console.log('\n✅ Script 4 complete!')
    console.log('🎉 All unoptimized files have been removed from storage')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

