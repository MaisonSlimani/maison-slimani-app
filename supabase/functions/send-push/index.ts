// Supabase Edge Function: Send Push Notifications
// Sends Web Push notifications to subscribed users using VAPID

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.1";
import webpush from "npm:web-push@3.5.0";

const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails(
  "mailto:admin@maison-slimani.com",
  vapidPublicKey,
  vapidPrivateKey,
);

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const { userIds, title, body, data, icon, badge, target } = await req.json();
  const broadcastAll = target === "all";

  // Validation
  if ((!broadcastAll && !userIds?.length) || !title) {
    return new Response(
      JSON.stringify({ error: "userIds[] and title are required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Query subscriptions
  let query = supabase.from("user_push_subscriptions").select("*");
  
  if (!broadcastAll) {
    query = query.in("user_id", userIds);
  }

  const { data: subs, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!subs?.length) {
    return new Response(
      JSON.stringify({ error: "No subscribers matched request" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Prepare payload
  const payload = JSON.stringify({ title, body, data, icon, badge });

  // Send to all subscriptions in parallel
  const results = await Promise.allSettled(
    subs.map((sub) => webpush.sendNotification(sub.subscription, payload)),
  );

  // Clean up stale subscriptions (404/410 = subscription expired)
  const toDelete: string[] = [];
  const failures: { id: string; reason: unknown }[] = [];

  results.forEach((res, idx) => {
    if (res.status === "rejected") {
      failures.push({ id: subs[idx].id, reason: res.reason });
      const statusCode = res.reason?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        toDelete.push(subs[idx].id);
      }
    }
  });

  // Delete stale subscriptions
  if (toDelete.length) {
    await supabase.from("user_push_subscriptions").delete().in("id", toDelete);
  }

  return new Response(JSON.stringify({ success: true, failures }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

