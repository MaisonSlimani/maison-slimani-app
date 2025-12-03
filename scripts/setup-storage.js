/**
 * Script Node.js pour créer le bucket Supabase Storage via l'API
 * 
 * Usage: 
 * node scripts/setup-storage.js
 * 
 * Ou avec variables d'environnement:
 * SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/setup-storage.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('🚀 Configuration du bucket Supabase Storage...\n')

  try {
    // Créer le bucket via l'API REST (car l'insertion SQL directe peut ne pas fonctionner)
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw listError
    }

    // Vérifier si le bucket existe déjà
    const bucketExists = buckets.some(b => b.id === 'produits-images')

    if (bucketExists) {
      console.log('ℹ️  Le bucket "produits-images" existe déjà')
    } else {
      // Créer le bucket
      const { data: bucket, error: createError } = await supabase.storage.createBucket('produits-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      })

      if (createError) {
        // Si l'erreur est que le bucket existe déjà, c'est OK
        if (createError.message.includes('already exists') || createError.message.includes('duplicate')) {
          console.log('ℹ️  Le bucket "produits-images" existe déjà')
        } else {
          throw createError
        }
      } else {
        console.log('✅ Bucket "produits-images" créé avec succès')
      }
    }

    // Vérifier les politiques (doivent être créées via SQL)
    console.log('\n📝 Pour configurer les politiques RLS, exécutez dans l\'éditeur SQL:')
    console.log('   Fichier: supabase/migrations/SETUP_STORAGE.sql')
    console.log('\n   Ou copiez-collez le SQL suivant dans Supabase > SQL Editor:')
    console.log('\n' + '='.repeat(60))
    
    const fs = require('fs')
    const path = require('path')
    const sqlFile = path.join(__dirname, '../supabase/migrations/SETUP_STORAGE.sql')
    if (fs.existsSync(sqlFile)) {
      const sql = fs.readFileSync(sqlFile, 'utf8')
      console.log(sql)
    } else {
      console.log('-- Voir le fichier supabase/migrations/SETUP_STORAGE.sql')
    }
    
    console.log('='.repeat(60) + '\n')

    console.log('✅ Configuration du storage terminée!')
    console.log('\n💡 Pour uploader une image:')
    console.log('   const { data, error } = await supabase.storage')
    console.log('     .from(\'produits-images\')')
    console.log('     .upload(\'nom-fichier.jpg\', file)')
    
    console.log('\n💡 Pour obtenir l\'URL d\'une image:')
    console.log('   const { data } = supabase.storage')
    console.log('     .from(\'produits-images\')')
    console.log('     .getPublicUrl(\'nom-fichier.jpg\')')

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message)
    console.error('\n💡 Solution alternative:')
    console.error('   1. Allez dans Supabase Dashboard > Storage')
    console.error('   2. Cliquez sur "New bucket"')
    console.error('   3. Nom: produits-images')
    console.error('   4. Cochez "Public bucket"')
    console.error('   5. Créez le bucket')
    process.exit(1)
  }
}

setupStorage()

