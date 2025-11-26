import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'
import { revalidateTag } from 'next/cache'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'
import { sendCommandeEmails } from '@/lib/emails/send'
import { CommandeEmailPayload } from '@/lib/emails/types'
import { statutCommandeSchema } from '@/lib/validations'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Variables Supabase manquantes pour la route /api/admin/commandes/[id]. ' +
      'Définissez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.'
  )
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    const { id: commandeId } = await params

    if (!commandeId) {
      return NextResponse.json(
        { error: 'ID de commande requis' },
        { status: 400 }
      )
    }

    let nouveauStatut: string
    try {
      const body = await request.json()
      const validation = statutCommandeSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Statut invalide', details: validation.error.flatten() },
          { status: 400 }
        )
      }
      nouveauStatut = validation.data.nouveau_statut
    } catch {
      return NextResponse.json(
        { error: 'Format JSON invalide' },
        { status: 400 }
      )
    }

    const { data: ancienneCommande, error: ancienneErreur } = await supabase
      .from('commandes')
      .select('id, statut')
      .eq('id', commandeId)
      .single()

    if (ancienneErreur || !ancienneCommande) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('commandes')
      .update({ statut: nouveauStatut })
      .eq('id', commandeId)
      .select()
      .single()

    if (error || !data) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du statut' },
        { status: 500 }
      )
    }

    if (
      ancienneCommande.statut !== nouveauStatut &&
      nouveauStatut !== 'En attente'
    ) {
      const payload: CommandeEmailPayload = {
        id: data.id,
        nom_client: data.nom_client,
        telephone: data.telephone,
        adresse: data.adresse,
        ville: data.ville,
        produits: (data.produits || []) as CommandeEmailPayload['produits'],
        total: data.total,
        statut: data.statut,
        notification_statut: true,
        ancien_statut: ancienneCommande.statut,
        nouveau_statut: nouveauStatut,
        client_email: null,
      }

      sendCommandeEmails(payload).catch((error) => {
        console.error(
          "Erreur lors de l'envoi de l'email de notification:",
          error
        )
      })
    }

    revalidateTag(PRODUCTS_CACHE_TAG)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

