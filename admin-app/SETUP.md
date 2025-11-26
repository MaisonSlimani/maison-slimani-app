# Admin App Setup Guide

## Environment Variables

Create a `.env.local` file in the `admin-app` directory with the following variables:

```env
# Supabase Configuration (same as main app)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Session Secret (generate a random string, e.g., using: openssl rand -base64 32)
ADMIN_SESSION_SECRET=your_random_session_secret_here

# Resend API Key (for emails - optional)
RESEND_API_KEY=your_resend_api_key
```

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Generating Admin Session Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Quick Start

1. **Copy environment variables:**
   ```bash
   cd admin-app
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   - Open `http://localhost:3001`
   - Login with your admin credentials

## Features

- ✅ Bottom navigation bar (native Android app style)
- ✅ Sticky header with logo and logout
- ✅ Dashboard with stats
- ✅ Orders management
- ✅ Products management
- ✅ Settings
- ✅ Full PWA support

## Troubleshooting

### "No products/orders showing"

1. Check that `.env.local` exists and has correct values
2. Verify Supabase credentials are correct
3. Check browser console for errors
4. Ensure you're logged in as admin

### "Cannot read properties of null"

This is usually a browser extension issue. Try:
- Disable browser extensions
- Use incognito/private mode
- Clear browser cache

### API errors

- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check that your Supabase project is active
- Verify database tables exist (`commandes`, `produits`, `settings`)

