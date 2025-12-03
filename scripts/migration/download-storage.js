#!/usr/bin/env node
/**
 * Script pour télécharger tous les fichiers du Storage Supabase
 * Usage: node download-storage.js
 * 
 * Variables d'environnement requises:
 * - OLD_SUPABASE_URL: URL de l'ancien projet Supabase
 * - OLD_SUPABASE_SERVICE_KEY: Service role key de l'ancien projet
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const OLD_SUPABASE_URL = process.env.OLD_SUPABASE_URL
const OLD_SUPABASE_SERVICE_KEY = process.env.OLD_SUPABASE_SERVICE_KEY
const DOWNLOAD_DIR = path.join(__dirname, '../../storage-backup')

if (!OLD_SUPABASE_URL || !OLD_SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables d\'environnement manquantes:')
  console.error('   OLD_SUPABASE_URL')
  console.error('   OLD_SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_KEY)

async function listAllFiles(bucketName, prefix = '') {
  const allFiles = []
  let offset = 0
  const limit = 1000

  while (true) {
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list(prefix, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error) {
      console.error(`❌ Erreur lors de la liste (${prefix}):`, error)
      break
    }

    if (!files || files.length === 0) {
      break
    }

    for (const file of files) {
      if (file.id === null) {
        // C'est un dossier, récursion
        const subFiles = await listAllFiles(bucketName, `${prefix}${file.name}/`)
        allFiles.push(...subFiles)
      } else {
        // C'est un fichier
        allFiles.push(`${prefix}${file.name}`)
      }
    }

    if (files.length < limit) {
      break
    }

    offset += limit
  }

  return allFiles
}

async function downloadFile(bucketName, filePath, destPath) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath)

  if (error) {
    throw new Error(`Erreur téléchargement ${filePath}: ${error.message}`)
  }

  // Créer les dossiers nécessaires
  const dir = path.dirname(destPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Convertir Blob en Buffer et sauvegarder
  const arrayBuffer = await data.arrayBuffer()
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer))
}

async function downloadStorage() {
  const bucketName = 'produits-images'
  const bucketDir = path.join(DOWNLOAD_DIR, bucketName)

  // Créer le dossier de backup
  if (!fs.existsSync(bucketDir)) {
    fs.mkdirSync(bucketDir, { recursive: true })
  }

  console.log('📦 Début du téléchargement du Storage...')
  console.log(`   Bucket: ${bucketName}`)
  console.log(`   Destination: ${bucketDir}\n`)

  try {
    // Lister tous les fichiers
    console.log('🔍 Liste des fichiers...')
    const files = await listAllFiles(bucketName)
    console.log(`✅ Trouvé ${files.length} fichiers\n`)

    if (files.length === 0) {
      console.log('⚠️  Aucun fichier trouvé dans le bucket')
      return
    }

    // Télécharger chaque fichier
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < files.length; i++) {
      const filePath = files[i]
      const destPath = path.join(bucketDir, filePath)

      try {
        await downloadFile(bucketName, filePath, destPath)
        successCount++
        process.stdout.write(`\r✅ [${i + 1}/${files.length}] ${filePath}`)
      } catch (error) {
        errorCount++
        console.error(`\n❌ Erreur pour ${filePath}:`, error.message)
      }
    }

    console.log(`\n\n✅ Téléchargement terminé!`)
    console.log(`   Succès: ${successCount}`)
    console.log(`   Erreurs: ${errorCount}`)
    console.log(`   Fichiers sauvegardés dans: ${bucketDir}`)
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  }
}

downloadStorage().catch((error) => {
  console.error('❌ Erreur:', error)
  process.exit(1)
})

