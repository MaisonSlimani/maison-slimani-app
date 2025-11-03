import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const schemaBody = z.object({
  commande_id: z.string().uuid(),
  nouveau_statut: z.enum(['En attente', 'Expédiée', 'Livrée', 'Annulée']),
})

serve(async (req) => {
  try {
    // Vérifier l'authentification admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Non autorisé' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parser et valider le body
    const body = await req.json()
    const validatedData = schemaBody.parse(body)

    // Récupérer l'ancien statut
    const { data: ancienneCommande, error: fetchError } = await supabase
      .from('commandes')
      .select('*')
      .eq('id', validatedData.commande_id)
      .single()

    if (fetchError || !ancienneCommande) {
      throw new Error('Commande introuvable')
    }

    // Mettre à jour le statut
    const { data: commande, error: updateError } = await supabase
      .from('commandes')
      .update({ statut: validatedData.nouveau_statut })
      .eq('id', validatedData.commande_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Envoyer un email si le statut a changé (et n'est pas "En attente")
    if (ancienneCommande.statut !== validatedData.nouveau_statut && validatedData.nouveau_statut !== 'En attente') {
      try {
        const emailUrl = new URL('/functions/v1/envoyerEmailCommande', supabaseUrl)
        await fetch(emailUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            commande_id: commande.id,
            ...commande,
            notification_statut: true,
            ancien_statut: ancienneCommande.statut,
            nouveau_statut: validatedData.nouveau_statut,
          }),
        })
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de notification:', emailError)
        // Ne pas faire échouer la mise à jour si l'email échoue
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: commande,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

