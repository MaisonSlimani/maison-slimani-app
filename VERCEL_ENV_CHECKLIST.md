# ✅ Vercel Environment Variables Checklist

## ⚠️ Important: `.env` Files Are LOCAL ONLY

Your `.env` and `.env.local` files are **NOT deployed to Vercel**. They only work for local development.

**You MUST add all environment variables in Vercel Dashboard manually.**

---

## 📋 Complete Checklist of Required Variables

Copy these from your `.env.local` file and add them to Vercel:

### 🔴 Required for Build (Will Fail Without These)

| Variable Name | Where to Get It | Example |
|--------------|----------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### 🟡 Required for Features (App Works But Features Break)

| Variable Name | Where to Get It | Example |
|--------------|----------------|---------|
| `RESEND_API_KEY` | Resend Dashboard → API Keys | `re_xxxxx...` |
| `ADMIN_SESSION_SECRET` | Generate random string (min 32 chars) | `your-random-secret-here` |

### 🟢 Optional (Has Defaults)

| Variable Name | Default Value | Description |
|--------------|---------------|-------------|
| `RESEND_FROM_EMAIL` | `noreply@maisonslimani.com` | Email to send from |
| `ADMIN_EMAIL` | `admin@maisonslimani.com` | Admin notification email |
| `NEXT_PUBLIC_SITE_URL` | `https://maisonslimani.com` | Your site URL |

---

## 🚀 Step-by-Step: Add Variables to Vercel

### Step 1: Open Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project

### Step 2: Go to Environment Variables
1. Click **Settings** (gear icon in top navigation)
2. Click **Environment Variables** in left sidebar

### Step 3: Add Each Variable

For **EACH** variable in the checklist above:

1. Click **Add New**
2. Enter the **Variable Name** (exactly as shown)
3. Paste the **Value** from your `.env.local` file
4. Select environments:
   - ✅ **Production**
   - ✅ **Preview** 
   - ✅ **Development**
5. Click **Save**

### Step 4: Verify All Variables

Make sure you see all these variables in the list:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `RESEND_API_KEY`
- ✅ `ADMIN_SESSION_SECRET`
- ✅ `RESEND_FROM_EMAIL` (optional)
- ✅ `ADMIN_EMAIL` (optional)
- ✅ `NEXT_PUBLIC_SITE_URL` (optional)

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click the **three dots (⋮)** on the latest deployment
3. Click **Redeploy**
4. Make sure all environment variables are selected
5. Click **Redeploy**

---

## 🔍 Quick Copy Script

If you want to quickly see what variables you need to copy, run this in your project root:

```bash
# View your local .env.local file (if it exists)
cat .env.local | grep -E "^(NEXT_PUBLIC_|SUPABASE_|RESEND_|ADMIN_)" | grep -v "^#"
```

This will show you all the variables you need to add to Vercel.

---

## ✅ Verification

After redeploying, check:

1. **Build succeeds** - No more "variable is not set" errors
2. **Site loads** - Homepage works
3. **API routes work** - Try accessing `/api/produits`
4. **Admin works** - Can login to admin panel

---

## 🆘 Common Issues

### "Variable is not set" error after adding
- Make sure you selected **all three environments** (Production, Preview, Development)
- **Redeploy** after adding variables
- Check for typos in variable names (case-sensitive!)

### Build still fails
- Double-check variable names match exactly (no extra spaces)
- Make sure values are correct (copy from `.env.local`)
- Check Vercel build logs for specific error

### Variables not updating
- You MUST redeploy after adding/changing variables
- Variables are only available in NEW deployments

---

## 📝 Quick Reference: Copy from .env.local

Open your `.env.local` file and copy these values to Vercel:

```env
# Copy these to Vercel:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
ADMIN_SESSION_SECRET=...
RESEND_FROM_EMAIL=... (optional)
ADMIN_EMAIL=... (optional)
NEXT_PUBLIC_SITE_URL=... (optional)
```

---

## 🎯 TL;DR

1. **Open Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Copy each variable** from your `.env.local` file
3. **Add to Vercel** with all environments selected
4. **Redeploy** your project
5. **Done!** ✅

