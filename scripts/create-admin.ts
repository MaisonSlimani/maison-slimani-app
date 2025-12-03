/**
 * Script pour créer un administrateur dans la base de données
 * Usage: npx tsx scripts/create-admin.ts email@example.com password123
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Charger les variables d'environnement depuis .env.local ou .env
function loadEnv() {
  const envFiles = ['.env.local', '.env']
  
  for (const file of envFiles) {
    try {
      const envPath = resolve(process.cwd(), file)
      const envContent = readFileSync(envPath, 'utf-8')
      const envLines = envContent.split('\n')
      
      for (const line of envLines) {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=')
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
            if (!process.env[key]) {
              process.env[key] = value
            }
          }
        }
      }
    } catch (error) {
      // Fichier n'existe pas, continuer
    }
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Variables d\'environnement manquantes :')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdmin() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve)
    })
  }

  try {
    console.log('=== Création d\'un administrateur ===\n')

    const email = await question('Email de l\'administrateur: ')
    if (!email || !email.includes('@')) {
      console.error('Email invalide')
      rl.close()
      process.exit(1)
    }

    const password = await question('Mot de passe: ')
    if (!password || password.length < 8) {
      console.error('Le mot de passe doit contenir au moins 8 caractères')
      rl.close()
      process.exit(1)
    }

    // Hash du mot de passe
    const saltRounds = 12
    const hashMdp = await bcrypt.hash(password, saltRounds)

    // Vérifier si l'admin existe déjà
    const { data: existing } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .single()

    if (existing) {
      console.log('\n⚠️  Un administrateur avec cet email existe déjà.')
      const update = await question('Voulez-vous mettre à jour le mot de passe ? (o/n): ')
      
      if (update.toLowerCase() === 'o') {
        const { error } = await supabase
          .from('admins')
          .update({ hash_mdp: hashMdp })
          .eq('email', email)

        if (error) {
          console.error('Erreur lors de la mise à jour:', error.message)
          rl.close()
          process.exit(1)
        }

        console.log('\n✅ Mot de passe mis à jour avec succès !')
      } else {
        console.log('Opération annulée.')
      }
    } else {
      // Créer le nouvel admin
      const { error } = await supabase
        .from('admins')
        .insert({
          email,
          hash_mdp: hashMdp,
          role: 'super-admin',
        })

      if (error) {
        console.error('Erreur lors de la création:', error.message)
        rl.close()
        process.exit(1)
      }

      console.log('\n✅ Administrateur créé avec succès !')
      console.log(`Email: ${email}`)
      console.log(`Rôle: super-admin`)
    }

    rl.close()
  } catch (error) {
    console.error('Erreur:', error)
    rl.close()
    process.exit(1)
  }
}

createAdmin()

