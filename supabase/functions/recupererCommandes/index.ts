import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const schemaQuery = z.object({
  statut: z.enum(['En attente', 'Expédiée', 'Livrée', 'Annulée']).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional(),
})

serve(async (req) => {
  try {
    // Vérifier l'authentification admin (via header)
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

    // TODO: Vérifier que le token est valide (via session admin)
    // Pour l'instant, on utilise le service role key

    // Initialiser le client Supabase avec service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parser et valider les paramètres de requête
    const url = new URL(req.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const validatedParams = schemaQuery.parse(queryParams)

    // Construire la requête
    let query = supabase
      .from('commandes')
      .select('*')
      .order('date_commande', { ascending: false })

    // Appliquer les filtres
    if (validatedParams.statut) {
      query = query.eq('statut', validatedParams.statut)
    }

    // Appliquer la pagination
    const limit = validatedParams.limit || 50
    const offset = validatedParams.offset || 0
    query = query.range(offset, offset + limit - 1)

    // Exécuter la requête
    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
        count: count || data?.length || 0,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
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

