# Push Notifications Implementation Guide

This document explains how we implemented push notifications for desktop and Android in our Next.js application using Vercel, Supabase, and Edge Functions.

## Overview

Our push notification system supports:
- **Desktop/Web**: Browser-based push notifications using Web Push API (VAPID)
- **Android Native**: Native push notifications via OneSignal (for mobile apps)

The core architecture relies on **Supabase Edge Functions** to handle subscription storage and notification delivery, making it scalable and serverless.

---

## Architecture

```
┌─────────────────┐
│   Next.js App   │
│   (Vercel)      │
└────────┬────────┘
         │
         ├──► Service Worker (sw.js)
         │    └──► Handles push events & displays notifications
         │
         ├──► Client Code
         │    └──► Subscribes/unsubscribes users
         │
         └──► Supabase Edge Functions
              ├──► store-subscription (POST/DELETE)
              └──► send-push (POST)
                   └──► Uses web-push library
```

---

## Prerequisites

### 1. VAPID Key Pair

Generate VAPID keys once per project:

```bash
npx web-push generate-vapid-keys
```

This outputs:
- **Public Key**: Used in the client application
- **Private Key**: Stored securely in Supabase Edge Functions

### 2. Environment Variables

**Client-side (Next.js):**
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
```

**Supabase Edge Functions:**
```bash
supabase functions secrets set VAPID_PUBLIC_KEY=your_public_key
supabase functions secrets set VAPID_PRIVATE_KEY=your_private_key
supabase functions secrets set SUPABASE_URL=your_supabase_url
supabase functions secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Schema

Create the subscription table in Supabase:

```sql
create table public.user_push_subscriptions (
  id uuid default extensions.uuid_generate_v4() primary key,
  user_id text not null,
  platform text not null,
  subscription jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists user_push_subscriptions_user_platform_idx
  on public.user_push_subscriptions (user_id, platform);
```

---

## Implementation Details

### 1. Service Worker (`/public/sw.js`)

The service worker is the heart of web push notifications. It runs in the background and handles incoming push messages even when the app is closed.

**Key responsibilities:**
- Listens for push events
- Displays notifications
- Handles notification clicks
- Manages client window focus/opening

```javascript
// Install immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Claim clients right away
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming push messages
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_err) {
    payload = { title: 'Notification', body: event.data?.text() };
  }

  const title = payload.title || 'Notification';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/program-icon.png',
    badge: payload.badge || '/chrome_icon.png',
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return null;
    }),
  );
});
```

**Important:** The service worker must be placed in `/public/sw.js` so it's accessible at the root scope (`/sw.js`).

---

### 2. Client-Side Integration

#### Helper Function: VAPID Key Conversion

The browser's Push API requires the VAPID key in `Uint8Array` format:

```javascript
const urlBase64ToUint8Array = (base64String) => {
  if (typeof window === 'undefined') return new Uint8Array();
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
```

#### Service Worker Registration

```javascript
const ensurePushServiceWorker = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported on this device.');
  }
  
  let registration = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!registration) {
    await navigator.serviceWorker.register('/sw.js');
    registration = await navigator.serviceWorker.ready;
  }
  return registration;
};
```

#### Subscribe to Push Notifications

```javascript
const subscribeToPush = async ({ userId, platform }) => {
  // Check support
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push not supported');
  }
  
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('Missing VAPID public key');
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission denied');
  }

  // Register service worker
  const registration = await ensurePushServiceWorker();
  
  // Get or create subscription
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  // Store subscription in Supabase via Edge Function
  await supabase.functions.invoke('store-subscription', {
    body: { userId, platform, subscription },
  });

  // Update user profile (optional, for UI state)
  await update(ref(database, `users/${userId}`), {
    notificationSubscribed: true,
  });
};
```

#### Unsubscribe from Push Notifications

```javascript
const unsubscribeFromPush = async ({ userId, platform }) => {
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  const existing = await registration?.pushManager.getSubscription();
  
  if (existing) {
    await existing.unsubscribe();
  }

  // Remove from Supabase
  await supabase.functions.invoke('store-subscription', {
    method: 'DELETE',
    body: { userId, platform },
  });

  // Update user profile
  await update(ref(database, `users/${userId}`), {
    notificationSubscribed: false,
  });
};
```

---

### 3. Supabase Edge Functions

#### Function: `store-subscription`

This function handles storing and removing push subscriptions.

**Location:** `supabase/functions/store-subscription/index.ts`

**Features:**
- **POST**: Stores or updates a subscription (upsert)
- **DELETE**: Removes a subscription
- Handles CORS for cross-origin requests

```typescript
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // DELETE: Remove subscription
  if (req.method === "DELETE") {
    const { userId, platform } = await req.json();
    if (!userId || !platform) {
      return new Response(
        JSON.stringify({ error: "userId and platform required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { error } = await supabase
      .from("user_push_subscriptions")
      .delete()
      .match({ user_id: userId, platform });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // POST: Store subscription
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const { userId, subscription, platform } = await req.json();

  if (!userId || !subscription || !platform) {
    return new Response(
      JSON.stringify({ error: "userId, platform, subscription required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Upsert: update if exists, insert if new
  const { error } = await supabase
    .from("user_push_subscriptions")
    .upsert(
      { user_id: userId, subscription, platform },
      { onConflict: "user_id, platform" },
    );

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

#### Function: `send-push`

This function sends push notifications to subscribed users.

**Location:** `supabase/functions/send-push/index.ts`

**Features:**
- Broadcast to all users (`target: 'all'`)
- Send to specific users (`userIds: ['user1', 'user2']`)
- Automatically cleans up stale subscriptions (404/410 errors)
- Returns failure list for debugging

```typescript
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.1";
import webpush from "npm:web-push@3.5.0";

const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails(
  "mailto:admin@example.com", // Contact email
  vapidPublicKey,
  vapidPrivateKey,
);

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
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
```

**Deploy Edge Functions:**

```bash
supabase functions deploy store-subscription
supabase functions deploy send-push
```

---

### 4. UI Integration Example

#### Toggle Component (Parameters Screen)

```javascript
const [notificationSubscribed, setNotificationSubscribed] = useState(false);

const handleNotificationToggle = async (checked) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  if (checked) {
    // Enable push notifications
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied.');
      }

      const registration = await ensurePushServiceWorker();
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      await supabase.functions.invoke('store-subscription', {
        body: {
          userId,
          platform: 'mobile-web',
          subscription,
        },
      });

      await update(ref(database, `users/${userId}`), {
        notificationSubscribed: true,
      });

      setNotificationSubscribed(true);
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
      setNotificationSubscribed(false);
    }
  } else {
    // Disable push notifications
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      const currentSubscription = await registration?.pushManager.getSubscription();
      
      if (currentSubscription) {
        await currentSubscription.unsubscribe();
      }

      await supabase.functions.invoke('store-subscription', {
        method: 'DELETE',
        body: { userId, platform: 'mobile-web' },
      });

      await update(ref(database, `users/${userId}`), {
        notificationSubscribed: false,
      });

      setNotificationSubscribed(false);
    } catch (error) {
      console.error('Error disabling push notifications:', error);
    }
  }
};
```

#### Admin Broadcast Component

```javascript
const handleSendPush = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  try {
    // Ensure admin is subscribed (for testing)
    const registration = await ensurePushServiceWorker();
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    await supabase.functions.invoke('store-subscription', {
      body: { userId, platform: 'mobile-web', subscription },
    });

    // Send push to all users
    await supabase.functions.invoke('send-push', {
      body: {
        target: 'all',
        userIds: [],
        title: 'Hello from DinWaDunya',
        body: 'Stay focused and keep grinding!',
        icon: '/program-icon.png',
        badge: '/chrome_icon.png',
        data: { url: '/dashboard' },
      },
    });
  } catch (error) {
    console.error('Failed to send push notification', error);
  }
};
```

---

## Android Native Push Notifications

For native Android apps, we use **OneSignal** via Capacitor/Cordova plugins. This is separate from the web push implementation.

**Key differences:**
- Uses OneSignal SDK instead of VAPID
- Requires native app build (not web)
- Handles APNs (iOS) and FCM (Android) automatically
- Managed through OneSignal dashboard

**Implementation location:** `src/services/pushNotificationService.js`

---

## Testing Checklist

1. **Environment Setup**
   - [ ] VAPID keys generated and configured
   - [ ] Supabase secrets set for Edge Functions
   - [ ] Database table created
   - [ ] Service worker accessible at `/sw.js`

2. **User Subscription**
   - [ ] User can toggle push notifications on/off
   - [ ] Browser permission prompt appears
   - [ ] Subscription stored in `user_push_subscriptions` table
   - [ ] User profile `notificationSubscribed` flag updated

3. **Notification Delivery**
   - [ ] Admin can send broadcast notifications
   - [ ] Notifications appear even when app is closed
   - [ ] Notification clicks navigate to correct URL
   - [ ] Stale subscriptions are automatically cleaned up

4. **Edge Cases**
   - [ ] Unsupported browsers show appropriate error
   - [ ] Permission denied handled gracefully
   - [ ] Network errors don't break the app
   - [ ] Multiple devices per user work correctly

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Missing VAPID Key` error | Ensure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set in `.env.local` |
| Service worker not registering | Check that `/sw.js` is accessible and returns 200 |
| Notifications not appearing | Check browser console for errors, verify permission is granted |
| Edge Function errors | Check Supabase logs, verify secrets are set correctly |
| CORS errors | Ensure Edge Functions return proper CORS headers |
| Stale subscriptions | The `send-push` function automatically deletes expired subscriptions |

---

## Production Considerations

1. **HTTPS Required**: Push notifications only work over HTTPS (localhost is exception)
2. **VAPID Keys**: Keep private key secure, never expose in client code
3. **Rate Limiting**: Consider adding rate limits to `send-push` function
4. **Monitoring**: Monitor Edge Function logs for failures
5. **User Privacy**: Always request permission before subscribing
6. **Subscription Cleanup**: The system automatically removes expired subscriptions

---

## Key Files Reference

- **Service Worker**: `/public/sw.js`
- **Edge Function (Store)**: `/supabase/functions/store-subscription/index.ts`
- **Edge Function (Send)**: `/supabase/functions/send-push/index.ts`
- **Client Integration**: `/src/components/mobile/ParametersMobile.js`
- **Admin Broadcast**: `/src/components/shared/admin/PushBroadcastControl.jsx`

---

## Summary

Our push notification system leverages:
- **Web Push API** for desktop/browser notifications
- **Supabase Edge Functions** for serverless backend
- **Service Workers** for background message handling
- **VAPID** for secure authentication

This architecture is scalable, cost-effective, and works seamlessly with Next.js on Vercel. The Edge Functions handle all server-side logic, keeping the client code simple and maintainable.

