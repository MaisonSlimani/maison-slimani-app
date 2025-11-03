import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const schemaCommande = z.object({
  nom_client: z.string().min(1, 'Le nom est requis'),
  telephone: z.string().min(1, 'Le téléphone est requis'),
  adresse: z.string().min(1, 'L\'adresse est requise'),
  ville: z.string().min(1, 'La ville est requise'),
  produits: z.array(z.object({
    id: z.string().uuid(),
    nom: z.string(),
    prix: z.number().positive(),
    quantite: z.number().int().positive(),
    image_url: z.string().optional().nullable(),
    taille: z.string().optional().nullable(),
  })).min(1, 'Au moins un produit est requis'),
})

const villesMaroc = [
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Kenitra', 'Tétouan', 'Safi', 'Mohammedia',
  'El Jadida', 'Nador', 'Settat', 'Beni Mellal', 'Taza', 'Khouribga',
  'Autre'
]

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parser et valider le body
    let body
    try {
      const bodyText = await req.text()
      if (!bodyText || bodyText.trim() === '') {
        throw new Error('Body vide')
      }
      body = JSON.parse(bodyText)
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Format JSON invalide',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const validatedData = schemaCommande.parse(body)

    // Vérifier que la ville est valide
    if (!villesMaroc.includes(validatedData.ville)) {
      throw new Error('Ville invalide')
    }

    // Vérifier le stock et calculer le total
    let total = 0
    const produitsAvecStock = []

    for (const produitCommande of validatedData.produits) {
      const { data: produit, error: produitError } = await supabase
        .from('produits')
        .select('id, nom, prix, stock')
        .eq('id', produitCommande.id)
        .single()

      if (produitError || !produit) {
        throw new Error(`Produit ${produitCommande.nom} introuvable`)
      }

      if (produit.stock < produitCommande.quantite) {
        throw new Error(`Stock insuffisant pour ${produit.nom}`)
      }

      total += produit.prix * produitCommande.quantite
      produitsAvecStock.push({
        ...produitCommande,
        prix: produit.prix,
        // Préserver l'image_url si fournie, sinon récupérer depuis le produit
        image_url: produitCommande.image_url || produit.image_url || null,
        // Préserver la taille si fournie
        taille: produitCommande.taille || null,
      })
    }

    // Créer la commande
    const { data: commande, error: commandeError } = await supabase
      .from('commandes')
      .insert({
        nom_client: validatedData.nom_client,
        telephone: validatedData.telephone,
        adresse: validatedData.adresse,
        ville: validatedData.ville,
        produits: produitsAvecStock,
        total: total,
        statut: 'En attente',
      })
      .select()
      .single()

    if (commandeError) {
      throw commandeError
    }

    // Décrémenter le stock
    for (const produitCommande of validatedData.produits) {
      const { error: rpcError } = await supabase.rpc('decrementer_stock', {
        produit_id: produitCommande.id,
        quantite: produitCommande.quantite,
      })
      if (rpcError) {
        console.error(`Erreur lors de la décrémentation du stock pour ${produitCommande.id}:`, rpcError)
        // Ne pas faire échouer la commande si la décrémentation échoue
      }
    }

    // Appeler la fonction d'envoi d'email (webhook interne)
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
        }),
      })
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError)
      // Ne pas faire échouer la commande si l'email échoue
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: commande,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la commande:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

