# Vercel Environment Variables Setup

## Problem

If you see errors like:
```
Error: RESEND_API_KEY is not set
```
or
```
@supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

This means environment variables are not configured in Vercel.

## Solution

### 1. Get Your API Keys

#### Supabase Keys:
1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

#### Resend API Key:
1. Go to Resend Dashboard: https://resend.com/api-keys
2. Create a new API key or copy an existing one
3. Copy the API key value

### 2. Configure Variables in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

#### Required Variables:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Project URL from Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon/public key from Supabase | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key from Supabase | Production, Preview, Development |
| `RESEND_API_KEY` | Your Resend API key | Production, Preview, Development |

#### Optional Variables (for emails):

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `RESEND_FROM_EMAIL` | Email address to send from (e.g., noreply@yourdomain.com) | Production, Preview, Development |
| `ADMIN_EMAIL` | Admin email to receive notifications | Production, Preview, Development |
| `ADMIN_SESSION_SECRET` | Random secret for admin sessions (min 32 chars) | Production, Preview, Development |

### 3. Redeploy

After adding the variables:
1. Go to **Deployments**
2. Click the three dots (⋮) on the latest deployment
3. Select **Redeploy**
4. Make sure all environment variables are selected for the environments you're deploying to

### 4. Verification

After redeployment, your site should work correctly. Environment variables are now available in your Next.js application.

## Important Notes

- Variables starting with `NEXT_PUBLIC_` are exposed to the client (browser)
- **Never** share your `SUPABASE_SERVICE_ROLE_KEY` publicly
- Make sure variables are set for **Production**, **Preview**, and **Development** if needed
- If you're using a custom domain, make sure `RESEND_FROM_EMAIL` uses a verified domain in Resend

## Local Development

To test locally, create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_SESSION_SECRET=your_random_secret_key_min_32_chars
```

Then restart your development server.

## Troubleshooting

### Build fails with "RESEND_API_KEY is not set"
- Make sure you added `RESEND_API_KEY` in Vercel Settings → Environment Variables
- Make sure it's enabled for the environment you're deploying (Production/Preview/Development)
- Redeploy after adding the variable

### Emails not sending
- Verify your `RESEND_API_KEY` is correct
- Check that `RESEND_FROM_EMAIL` uses a verified domain in Resend
- Check Vercel function logs for email errors

### Supabase connection errors
- Verify all Supabase environment variables are set correctly
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is the service_role key, not the anon key
