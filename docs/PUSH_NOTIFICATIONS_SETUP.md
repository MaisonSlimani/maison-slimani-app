# Push Notifications Setup Guide

This guide explains how to set up push notifications for admin order alerts using Supabase Edge Functions.

## Overview

When a new order is created with status "En attente", a push notification is automatically sent to all registered admin devices. This replaces the previous email notification system.

## Architecture

1. **Database Trigger**: When a new order is inserted, a trigger calls the edge function
2. **Edge Function**: `send-push-notification` sends notifications to all registered devices
3. **Push Tokens**: Stored in `admin_push_tokens` table
4. **FCM**: Uses Firebase Cloud Messaging for Android/iOS devices

## Setup Steps

### 1. Deploy the Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the edge function
supabase functions deploy send-push-notification
```

### 2. Set Environment Variables

In Supabase Dashboard → Edge Functions → Settings:

- `FCM_SERVER_KEY`: Your Firebase Cloud Messaging server key
- `SUPABASE_URL`: Your Supabase project URL (auto-set)
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (auto-set)

### 3. Run the Migration

```bash
# Apply the migration
supabase db push

# Or via SQL editor in Supabase Dashboard
# Run the contents of: supabase/migrations/021_create_push_notifications.sql
```

### 4. Configure Database Settings

In Supabase Dashboard → Database → Settings, or via SQL:

```sql
ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';
ALTER DATABASE postgres SET app.supabase_service_role_key = 'your-service-role-key';
```

**Note**: For security, use Supabase Database Webhooks instead (recommended for production).

### 5. Alternative: Use Database Webhooks (Recommended)

Instead of triggers, use Supabase's built-in webhook system:

1. Go to Database → Webhooks in Supabase Dashboard
2. Create a new webhook:
   - **Name**: `new-order-push-notification`
   - **Table**: `commandes`
   - **Events**: `INSERT`
   - **Type**: `HTTP Request`
   - **URL**: `https://your-project.supabase.co/functions/v1/send-push-notification`
   - **HTTP Method**: `POST`
   - **HTTP Headers**: 
     ```json
     {
       "Content-Type": "application/json",
       "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"
     }
     ```
   - **HTTP Body**: 
     ```json
     {
       "type": "INSERT",
       "record": {{ $body.new }},
       "old_record": null
     }
     ```

### 6. Get Firebase Cloud Messaging (FCM) Server Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select your project
3. Go to Project Settings → Cloud Messaging
4. Copy the **Server Key** (legacy) or create a new **Cloud Messaging API (V1) key**
5. Add it to Edge Function environment variables as `FCM_SERVER_KEY`

### 7. Register Push Tokens in Admin App

The admin app needs to:
1. Request push notification permissions
2. Get the FCM token
3. Register the token in the `admin_push_tokens` table

See `admin-app` implementation for details.

## Testing

1. Create a test order via the main app
2. Check Edge Function logs in Supabase Dashboard
3. Verify push notification is received on admin device

## Troubleshooting

### Push notifications not working

1. **Check Edge Function logs**: Supabase Dashboard → Edge Functions → Logs
2. **Verify FCM key**: Ensure `FCM_SERVER_KEY` is set correctly
3. **Check tokens**: Query `admin_push_tokens` table to verify tokens are registered
4. **Test FCM directly**: Use Firebase Console to send a test notification

### Database trigger not firing

1. **Check trigger exists**: 
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_notify_new_order';
   ```
2. **Verify pg_net extension**: 
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_net';
   ```
3. **Check database settings**: Verify `app.supabase_url` and `app.supabase_service_role_key` are set

### Use Database Webhooks instead

If triggers are problematic, use Supabase Database Webhooks (recommended for production). This is more reliable and easier to configure.

## Security Notes

- The edge function verifies the Authorization header
- Push tokens are stored securely in the database
- RLS policies control access to push tokens
- Service role key should never be exposed to clients

## Next Steps

1. Implement push token registration in admin-app
2. Handle notification clicks to open order details
3. Add support for web push notifications (optional)

