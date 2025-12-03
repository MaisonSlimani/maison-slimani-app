// Supabase Edge Function: Send Push Notification
// This function is triggered when a new order is created
// It calls the send-push function to send Web Push notifications to all registered admin devices

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface CommandeData {
  id: string
  nom_client: string
  telephone: string
  total: number
  statut: string
  date_commande: string
}

serve(async (req) => {
  try {
    // Parse the request body (from database trigger or API call)
    let body
    try {
      body = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const { record, old_record, type } = body

    // Only process INSERT events for new orders
    if (type !== 'INSERT' || !record) {
      return new Response(
        JSON.stringify({ message: 'Not a new order, skipping' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const commande = record as CommandeData

    // Only send notification for orders with status "En attente"
    if (commande.statut !== 'En attente') {
      return new Response(
        JSON.stringify({ message: 'Order status is not "En attente", skipping' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Prepare notification payload
    const shortId = commande.id.substring(0, 8).toUpperCase()
    const notificationTitle = 'Nouvelle commande reçue !'
    const notificationBody = `Commande #${shortId} - ${commande.nom_client}`

    // Call the send-push edge function to send notifications to all admin users
    const sendPushResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        target: 'all', // Send to all admin users
        userIds: ['admin'], // Target admin user_id
        title: notificationTitle,
        body: notificationBody,
        icon: '/program-icon.png',
        badge: '/chrome_icon.png',
        data: {
          type: 'new_order',
          order_id: commande.id,
          order_number: shortId,
          customer_name: commande.nom_client,
          total: commande.total.toString(),
          url: `/admin/commandes/${commande.id}`,
        },
      }),
    })

    if (!sendPushResponse.ok) {
      const errorText = await sendPushResponse.text()
      console.error('Error calling send-push function:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send push notifications', details: errorText }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = await sendPushResponse.json()
    console.log('Push notifications sent:', result)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Push notifications sent',
        result,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
