import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'
import { sendCommandeEmails } from '@/lib/emails/send'
import { CommandeEmailPayload } from '@/lib/emails/types'
import { commandeSchema, CommandePayload } from '@/lib/validations'
import { applyRateLimit, getClientIdentifier } from '@/lib/middleware/rate-limit'
import { createdResponse, errorResponse } from '@/lib/api/response'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Variables Supabase manquantes pour la route /api/commandes. ' +
      'Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies.'
  )
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request)
    const rateLimitResult = applyRateLimit({
      key: `commandes:${identifier}`,
      limit: 10,
      windowMs: 60 * 1000,
    })

    if (!rateLimitResult.success) {
      const response = errorResponse(
        'Trop de tentatives. Veuillez réessayer dans une minute.',
        429
      )
      response.headers.set('Retry-After', rateLimitResult.retryAfter.toString())
      return response
    }

    let payload: CommandePayload

    try {
      const body = await request.json()
      const validation = commandeSchema.safeParse(body)

      if (!validation.success) {
        return errorResponse(
          'Données de commande invalides',
          400,
          validation.error.flatten()
        )
      }

      payload = validation.data
    } catch (error) {
      return errorResponse('Format JSON invalide', 400)
    }

    const produitsAvecStock: Array<typeof payload.produits[number]> = []
    const produitsCache = new Map<
      string,
      { has_colors: boolean; couleurs: any[] | null; tailles: any[] | null; prix: number; stock: number; image_url: string | null; useSizeSpecificDecrement: boolean }
    >()
    let total = 0

    for (const produitCommande of payload.produits) {
      const { data: produit, error } = await supabase
        .from('produits')
        .select('id, nom, prix, stock, has_colors, couleurs, tailles, taille, image_url')
        .eq('id', produitCommande.id)
        .single()

      if (error || !produit) {
        return errorResponse(
          `Produit ${produitCommande.nom} introuvable`,
          400
        )
      }

      let stockDisponible = 0
      let useSizeSpecificDecrement = false

      // If taille is specified, check stock for that specific size
      if (produitCommande.taille) {
        useSizeSpecificDecrement = true
        if (produit.has_colors && produitCommande.couleur) {
          if (!produit.couleurs || !Array.isArray(produit.couleurs)) {
            return errorResponse(
              `Couleur "${produitCommande.couleur}" non disponible pour ${produit.nom}`,
              400
            )
          }

          const couleurSelectionnee = produit.couleurs.find(
            (c: any) => c.nom === produitCommande.couleur
          )

          if (!couleurSelectionnee) {
            return errorResponse(
              `Couleur "${produitCommande.couleur}" non disponible pour ${produit.nom}`,
              400
            )
          }

          // Check tailles array in color
          if (couleurSelectionnee.tailles && Array.isArray(couleurSelectionnee.tailles)) {
            const tailleData = couleurSelectionnee.tailles.find((t: any) => t.nom === produitCommande.taille)
            if (!tailleData) {
              return errorResponse(
                `Taille "${produitCommande.taille}" non disponible pour ${produit.nom} (${produitCommande.couleur})`,
                400
              )
            }
            stockDisponible = tailleData.stock || 0
          } else if (couleurSelectionnee.taille) {
            // Backward compatibility
            const tailleList = couleurSelectionnee.taille.split(',').map((t: string) => t.trim())
            if (!tailleList.includes(produitCommande.taille)) {
              return errorResponse(
                `Taille "${produitCommande.taille}" non disponible pour ${produit.nom} (${produitCommande.couleur})`,
                400
              )
            }
            stockDisponible = couleurSelectionnee.stock || 0
            useSizeSpecificDecrement = false // Can't use size-specific for old structure
          } else {
            return errorResponse(
              `Taille "${produitCommande.taille}" non disponible pour ${produit.nom} (${produitCommande.couleur})`,
              400
            )
          }
        } else if (!produit.has_colors) {
          // Check product-level tailles
          if (produit.tailles && Array.isArray(produit.tailles)) {
            const tailleData = produit.tailles.find((t: any) => t.nom === produitCommande.taille)
            if (!tailleData) {
              return errorResponse(
                `Taille "${produitCommande.taille}" non disponible pour ${produit.nom}`,
                400
              )
            }
            stockDisponible = tailleData.stock || 0
          } else if ((produit as any).taille) {
            // Backward compatibility
            const tailleList = (produit as any).taille.split(',').map((t: string) => t.trim())
            if (!tailleList.includes(produitCommande.taille)) {
              return errorResponse(
                `Taille "${produitCommande.taille}" non disponible pour ${produit.nom}`,
                400
              )
            }
            stockDisponible = produit.stock || 0
            useSizeSpecificDecrement = false
          } else {
            return errorResponse(
              `Taille "${produitCommande.taille}" non disponible pour ${produit.nom}`,
              400
            )
          }
        } else {
          return errorResponse(`Couleur requise pour ${produit.nom}`, 400)
        }
      } else {
        // No taille specified - use old logic
        if (produit.has_colors && produitCommande.couleur) {
          if (!produit.couleurs || !Array.isArray(produit.couleurs)) {
            return errorResponse(
              `Couleur "${produitCommande.couleur}" non disponible pour ${produit.nom}`,
              400
            )
          }

          const couleurSelectionnee = produit.couleurs.find(
            (c: any) => c.nom === produitCommande.couleur
          )

          if (!couleurSelectionnee) {
            return errorResponse(
              `Couleur "${produitCommande.couleur}" non disponible pour ${produit.nom}`,
              400
            )
          }

          stockDisponible = couleurSelectionnee.stock || 0
        } else if (!produit.has_colors) {
          stockDisponible = produit.stock || 0
        } else {
          return errorResponse(`Couleur requise pour ${produit.nom}`, 400)
        }
      }

      if (stockDisponible < produitCommande.quantite) {
        return errorResponse(
          `Stock insuffisant pour ${produit.nom}${
            produitCommande.couleur ? ` (${produitCommande.couleur})` : ''
          }${produitCommande.taille ? ` - Taille ${produitCommande.taille}` : ''}. Stock disponible: ${stockDisponible}`,
          400
        )
      }

      total += produit.prix * produitCommande.quantite
      produitsCache.set(produitCommande.id, {
        has_colors: produit.has_colors,
        couleurs: produit.couleurs,
        tailles: produit.tailles,
        prix: produit.prix,
        stock: produit.stock,
        image_url: produit.image_url || null,
        useSizeSpecificDecrement,
      })

      produitsAvecStock.push({
        ...produitCommande,
        prix: produit.prix,
        image_url: produitCommande.image_url || produit.image_url || null,
        taille: produitCommande.taille || null,
        couleur: produitCommande.couleur || null,
      })
    }

    const { data: commande, error: commandeError } = await supabase
      .from('commandes')
      .insert({
        nom_client: payload.nom_client,
        telephone: payload.telephone,
        email: (payload.email && payload.email.trim() !== '') ? payload.email.trim() : null,
        adresse: payload.adresse,
        ville: payload.ville,
        produits: produitsAvecStock,
        total,
        statut: 'En attente',
      })
      .select()
      .single()

    if (commandeError || !commande) {
      throw commandeError || new Error('Création de commande impossible')
    }

    // Trigger push notification for new order (non-blocking)
    // This is more reliable than database triggers which require configuration
    if (commande && commande.statut === 'En attente') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (supabaseUrl && supabaseServiceKey) {
        // Call the send-push-notification edge function asynchronously
        // Don't wait for it to complete - fire and forget
        // Use both apikey and Authorization headers for Supabase edge functions
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            ...(anonKey && { 'apikey': anonKey }),
          },
          body: JSON.stringify({
            type: 'INSERT',
            record: commande,
          }),
        }).catch((error) => {
          // Log error but don't fail the order creation
          console.error('Error triggering push notification:', error)
        })
      }
    }

    // Update stock atomically using database functions (prevents race conditions)
    // This must happen AFTER order creation to ensure we only decrement if order succeeds
    const stockUpdatePromises = payload.produits.map(async (produitCommande) => {
      const produitDetails = produitsCache.get(produitCommande.id)

      if (!produitDetails) {
        console.error(`Produit details not found in cache for ${produitCommande.id}`)
        return
      }

      try {
        // Use size-specific decrement if taille is provided and product supports it
        if (produitDetails.useSizeSpecificDecrement && produitCommande.taille) {
          if (produitDetails.has_colors && produitCommande.couleur) {
            // Use size-specific function for products with colors
            const { data, error } = await supabase.rpc('decrementer_stock_couleur_taille_atomic', {
              produit_id: produitCommande.id,
              couleur_nom: produitCommande.couleur,
              taille_nom: produitCommande.taille,
              quantite: produitCommande.quantite,
            })

            if (error) {
              console.error(
                `Erreur décrémentation stock couleur/taille pour ${produitCommande.id}:`,
                error
              )
              throw error
            }

            if (!data) {
              throw new Error(`Stock insuffisant pour ${produitCommande.nom} (${produitCommande.couleur}, Taille ${produitCommande.taille})`)
            }
          } else {
            // Use size-specific function for products without colors
            const { data, error } = await supabase.rpc('decrementer_stock_taille_atomic', {
              produit_id: produitCommande.id,
              taille_nom: produitCommande.taille,
              quantite: produitCommande.quantite,
            })

            if (error) {
              console.error(
                `Erreur décrémentation stock taille pour ${produitCommande.id}:`,
                error
              )
              throw error
            }

            if (!data) {
              throw new Error(`Stock insuffisant pour ${produitCommande.nom} (Taille ${produitCommande.taille})`)
            }
          }
        } else {
          // No taille - use old logic
          if (produitDetails.has_colors && produitCommande.couleur) {
            // Use atomic function for products with colors
            const { data, error } = await supabase.rpc('decrementer_stock_couleur_atomic', {
              produit_id: produitCommande.id,
              couleur_nom: produitCommande.couleur,
              quantite: produitCommande.quantite,
            })

            if (error) {
              console.error(
                `Erreur décrémentation stock couleur pour ${produitCommande.id}:`,
                error
              )
              throw error
            }

            if (!data) {
              throw new Error(`Stock insuffisant pour ${produitCommande.nom} (${produitCommande.couleur})`)
            }
          } else {
            // Use atomic function for products without colors
            const { data, error } = await supabase.rpc('decrementer_stock_atomic', {
              produit_id: produitCommande.id,
              quantite: produitCommande.quantite,
            })

            if (error) {
              console.error(
                `Erreur décrémentation stock produit ${produitCommande.id}:`,
                error
              )
              throw error
            }

            if (!data) {
              throw new Error(`Stock insuffisant pour ${produitCommande.nom}`)
            }
          }
        }
      } catch (error) {
        console.error(`Erreur lors de la décrémentation du stock pour ${produitCommande.id}:`, error)
        // Log error but don't fail the order - stock was already validated before order creation
        // This is a safety net in case of race conditions
      }
    })

    // Wait for all stock updates to complete (important for data consistency)
    // This ensures stock is updated before the response is sent, triggering realtime updates
    await Promise.all(stockUpdatePromises).catch((error) => {
      console.error('Erreur lors de la mise à jour du stock:', error)
      // Don't fail the order if stock update fails - order is already created
      // Admin can manually adjust stock if needed
    })

    // Small delay to ensure database changes are committed and realtime can propagate
    // This helps ensure realtime subscriptions receive the update
    await new Promise(resolve => setTimeout(resolve, 100))

    revalidateTag(PRODUCTS_CACHE_TAG)

    const commandeEmailPayload: CommandeEmailPayload = {
      id: commande.id,
      nom_client: commande.nom_client,
      telephone: commande.telephone,
      adresse: commande.adresse,
      ville: commande.ville,
      produits: (commande.produits || []) as CommandeEmailPayload['produits'],
      total: commande.total,
      statut: commande.statut,
      client_email: commande.email || null,
    }

    // Send emails in background (fire-and-forget)
    sendCommandeEmails(commandeEmailPayload).catch((error) => {
      console.error("Erreur lors de l'envoi des emails de commande:", error)
    })

    return createdResponse(commande)
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erreur lors de la création de la commande',
      500
    )
  }
}

