#!/usr/bin/env node
/**
 * Script pour uploader tous les fichiers vers le nouveau Storage Supabase
 * Usage: node upload-storage.js
 * 
 * Variables d'environnement requises:
 * - NEW_SUPABASE_URL: URL du nouveau projet Supabase
 * - NEW_SUPABASE_SERVICE_KEY: Service role key du nouveau projet
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL
const NEW_SUPABASE_SERVICE_KEY = process.env.NEW_SUPABASE_SERVICE_KEY
const STORAGE_DIR = path.join(__dirname, '../../storage-backup/produits-images')

if (!NEW_SUPABASE_URL || !NEW_SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables d\'environnement manquantes:')
  console.error('   NEW_SUPABASE_URL')
  console.error('   NEW_SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY)

function getAllFiles(dir, baseDir = dir) {
  const fileList = []
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      const subFiles = getAllFiles(filePath, baseDir)
      fileList.push(...subFiles)
    } else {
      const relativePath = path.relative(baseDir, filePath)
      fileList.push({
        fullPath: filePath,
        relativePath: relativePath.replace(/\\/g, '/') // Normaliser les slashes
      })
    }
  }

  return fileList
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  }
  return types[ext] || 'application/octet-stream'
}

async function ensureBucketExists() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    throw new Error(`Erreur lors de la liste des buckets: ${listError.message}`)
  }

  const bucketExists = buckets.some(b => b.id === 'produits-images')

  if (!bucketExists) {
    console.log('📦 Création du bucket produits-images...')
    const { data, error } = await supabase.storage.createBucket('produits-images', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    })

    if (error) {
      throw new Error(`Erreur lors de la création du bucket: ${error.message}`)
    }

    console.log('✅ Bucket créé avec succès\n')
  } else {
    console.log('✅ Bucket produits-images existe déjà\n')
  }
}

async function uploadStorage() {
  if (!fs.existsSync(STORAGE_DIR)) {
    console.error(`❌ Dossier source introuvable: ${STORAGE_DIR}`)
    console.error('   Exécutez d\'abord download-storage.js')
    process.exit(1)
  }

  console.log('📦 Début de l\'upload du Storage...')
  console.log(`   Source: ${STORAGE_DIR}`)
  console.log(`   Bucket: produits-images\n`)

  try {
    // Vérifier/créer le bucket
    await ensureBucketExists()

    // Lister tous les fichiers
    console.log('🔍 Liste des fichiers...')
    const files = getAllFiles(STORAGE_DIR)
    console.log(`✅ Trouvé ${files.length} fichiers\n`)

    if (files.length === 0) {
      console.log('⚠️  Aucun fichier trouvé dans le dossier source')
      return
    }

    // Uploader chaque fichier
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < files.length; i++) {
      const { fullPath, relativePath } = files[i]
      const fileBuffer = fs.readFileSync(fullPath)
      const contentType = getContentType(fullPath)

      try {
        const { data, error } = await supabase.storage
          .from('produits-images')
          .upload(relativePath, fileBuffer, {
            contentType,
            upsert: true, // Remplacer si existe déjà
            cacheControl: '3600' // Cache 1 heure
          })

        if (error) {
          throw error
        }

        successCount++
        process.stdout.write(`\r✅ [${i + 1}/${files.length}] ${relativePath}`)
      } catch (error) {
        errorCount++
        console.error(`\n❌ Erreur pour ${relativePath}:`, error.message)
      }
    }

    console.log(`\n\n✅ Upload terminé!`)
    console.log(`   Succès: ${successCount}`)
    console.log(`   Erreurs: ${errorCount}`)
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  }
}

uploadStorage().catch((error) => {
  console.error('❌ Erreur:', error)
  process.exit(1)
})

