import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const ORDER_FIELDS =
  'id, nom_client, telephone, email, adresse, ville, produits, total, statut, date_commande'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID de commande requis' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('commandes')
      .select(ORDER_FIELDS)
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Erreur lors de la récupération de la commande:', error)
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error?.message || 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { nouveau_statut } = body

    if (!nouveau_statut) {
      return NextResponse.json(
        { error: 'Nouveau statut requis' },
        { status: 400 }
      )
    }

    // Get old status and full commande data before update
    const { data: oldCommande, error: fetchError } = await supabase
      .from('commandes')
      .select(ORDER_FIELDS)
      .eq('id', id)
      .single()

    if (fetchError || !oldCommande) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    const ancienStatut = oldCommande.statut

    // Restore stock if order is being canceled (from any status to "Annulée")
    if (nouveau_statut === 'Annulée' && ancienStatut !== 'Annulée') {
      const produits = (oldCommande.produits || []) as Array<{
        id: string
        nom: string
        quantite: number
        couleur?: string
      }>

      for (const produitCommande of produits) {
        try {
          // Get product to check if it has colors
          const { data: produit, error: produitError } = await supabase
            .from('produits')
            .select('id, has_colors, couleurs')
            .eq('id', produitCommande.id)
            .single()

          if (produitError || !produit) {
            console.error(`Produit ${produitCommande.id} introuvable lors de la restauration du stock`)
            continue
          }

          if (produit.has_colors && produitCommande.couleur) {
            // Restore stock for color variant
            const { error: incrementError } = await supabase.rpc('incrementer_stock_couleur_atomic', {
              produit_id: produitCommande.id,
              couleur_nom: produitCommande.couleur,
              quantite: produitCommande.quantite,
            })

            if (incrementError) {
              console.error(`Erreur restauration stock couleur pour ${produitCommande.id}:`, incrementError)
            }
          } else {
            // Restore stock for product without colors
            const { error: incrementError } = await supabase.rpc('incrementer_stock_atomic', {
              produit_id: produitCommande.id,
              quantite: produitCommande.quantite,
            })

            if (incrementError) {
              console.error(`Erreur restauration stock pour ${produitCommande.id}:`, incrementError)
            }
          }
        } catch (error) {
          console.error(`Erreur lors de la restauration du stock pour ${produitCommande.id}:`, error)
        }
      }
    }

    // Decrement stock if order is being un-canceled (from "Annulée" to any other status)
    if (ancienStatut === 'Annulée' && nouveau_statut !== 'Annulée') {
      const produits = (oldCommande.produits || []) as Array<{
        id: string
        nom: string
        quantite: number
        couleur?: string
      }>

      for (const produitCommande of produits) {
        try {
          // Get product to check if it has colors
          const { data: produit, error: produitError } = await supabase
            .from('produits')
            .select('id, has_colors, couleurs')
            .eq('id', produitCommande.id)
            .single()

          if (produitError || !produit) {
            console.error(`Produit ${produitCommande.id} introuvable lors de la décrémentation du stock`)
            continue
          }

          if (produit.has_colors && produitCommande.couleur) {
            // Decrement stock for color variant
            const { data: success, error: decrementError } = await supabase.rpc('decrementer_stock_couleur_atomic', {
              produit_id: produitCommande.id,
              couleur_nom: produitCommande.couleur,
              quantite: produitCommande.quantite,
            })

            if (decrementError || !success) {
              console.error(`Erreur décrémentation stock couleur pour ${produitCommande.id}:`, decrementError)
            }
          } else {
            // Decrement stock for product without colors
            const { data: success, error: decrementError } = await supabase.rpc('decrementer_stock_atomic', {
              produit_id: produitCommande.id,
              quantite: produitCommande.quantite,
            })

            if (decrementError || !success) {
              console.error(`Erreur décrémentation stock pour ${produitCommande.id}:`, decrementError)
            }
          }
        } catch (error) {
          console.error(`Erreur lors de la décrémentation du stock pour ${produitCommande.id}:`, error)
        }
      }
    }

    // Update status (don't wait for email)
    const { data, error } = await supabase
      .from('commandes')
      .update({ statut: nouveau_statut })
      .eq('id', id)
      .select(ORDER_FIELDS)
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    // Send email in background when status changes to "Expédiée" (if email exists)
    if (nouveau_statut === 'Expédiée' && ancienStatut !== 'Expédiée' && data.email) {
      // Import and send email in background (fire-and-forget)
      import('@/lib/emails/send-status-change').then(({ sendStatusChangeEmail }) => {
        sendStatusChangeEmail(
          {
            id: data.id,
            nom_client: data.nom_client,
            telephone: data.telephone,
            email: data.email,
            adresse: data.adresse,
            ville: data.ville,
            produits: (data.produits || []) as any,
            total: data.total,
            statut: data.statut,
          },
          ancienStatut,
          nouveau_statut
        ).catch((err) => {
          console.error('Erreur lors de l\'envoi de l\'email de changement de statut:', err)
        })
      }).catch((err) => {
        console.error('Erreur lors du chargement du module email:', err)
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error?.message || 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

