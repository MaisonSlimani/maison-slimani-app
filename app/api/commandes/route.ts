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
      { has_colors: boolean; couleurs: any[] | null; prix: number; stock: number; image_url: string | null }
    >()
    let total = 0

    for (const produitCommande of payload.produits) {
      const { data: produit, error } = await supabase
        .from('produits')
        .select('id, nom, prix, stock, has_colors, couleurs, image_url')
        .eq('id', produitCommande.id)
        .single()

      if (error || !produit) {
        return errorResponse(
          `Produit ${produitCommande.nom} introuvable`,
          400
        )
      }

      let stockDisponible = 0

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

      if (stockDisponible < produitCommande.quantite) {
        return errorResponse(
          `Stock insuffisant pour ${produit.nom}${
            produitCommande.couleur ? ` (${produitCommande.couleur})` : ''
          }. Stock disponible: ${stockDisponible}`,
          400
        )
      }

      total += produit.prix * produitCommande.quantite
      produitsCache.set(produitCommande.id, {
        has_colors: produit.has_colors,
        couleurs: produit.couleurs,
        prix: produit.prix,
        stock: produit.stock,
        image_url: produit.image_url || null,
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

    for (const produitCommande of payload.produits) {
      const produitDetails = produitsCache.get(produitCommande.id)

      if (!produitDetails) continue

      if (produitDetails.has_colors && produitCommande.couleur) {
        if (produitDetails.couleurs && Array.isArray(produitDetails.couleurs)) {
          const colors = [...produitDetails.couleurs]
          const couleurIndex = colors.findIndex((c) => c.nom === produitCommande.couleur)

          if (couleurIndex !== -1) {
            const updatedCouleurs = [...colors]
            const currentStock = updatedCouleurs[couleurIndex].stock || 0
            updatedCouleurs[couleurIndex] = {
              ...updatedCouleurs[couleurIndex],
              stock: Math.max(0, currentStock - produitCommande.quantite),
            }

            const { error: updateError } = await supabase
              .from('produits')
              .update({ couleurs: updatedCouleurs })
              .eq('id', produitCommande.id)

            if (updateError) {
              console.error(
                `Erreur décrémentation stock couleur pour ${produitCommande.id}:`,
                updateError
              )
            }
          }
        }
      } else {
        const { error: rpcError } = await supabase.rpc('decrementer_stock', {
          produit_id: produitCommande.id,
          quantite: produitCommande.quantite,
        })

        if (rpcError) {
          console.error(
            `Erreur décrémentation stock produit ${produitCommande.id}:`,
            rpcError
          )
        }
      }
    }

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
      client_email: null,
    }

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

