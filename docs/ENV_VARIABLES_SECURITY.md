# 🔒 Environment Variables Security Guide

## ✅ Yes, `NEXT_PUBLIC_` Variables ARE Exposed to Browser - This is CORRECT!

Vercel is warning you correctly. In Next.js, **any variable starting with `NEXT_PUBLIC_` is automatically exposed to the browser**. This is **intentional and safe** for the right variables.

---

## 📋 Which Variables Should Be Public vs Private?

### ✅ SAFE to Expose (Use `NEXT_PUBLIC_` prefix)

| Variable | Why It's Safe | Used In |
|----------|---------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Just a URL, no secrets | Client-side Supabase client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Designed to be public** - Supabase's anon key is meant for client-side use. It's protected by Row Level Security (RLS) policies. | Client-side Supabase client |
| `NEXT_PUBLIC_SITE_URL` | Just a URL, no secrets | SEO, metadata, sitemap |

**Why Supabase Anon Key is Safe:**
- It's **designed** to be public
- It's protected by **Row Level Security (RLS)** policies in your database
- Users can only access data your RLS policies allow
- It cannot bypass RLS or access admin functions

### 🔒 MUST Stay Private (NO `NEXT_PUBLIC_` prefix)

| Variable | Why It's Secret | Used In |
|----------|------------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | **Admin access** - bypasses all RLS policies! | Server-side API routes only |
| `RESEND_API_KEY` | Can send emails from your account | Server-side email functions |
| `ADMIN_SESSION_SECRET` | Used to sign/verify admin sessions | Server-side auth |

---

## 🔍 How to Verify Your Setup

### ✅ Correct Setup:

```env
# ✅ PUBLIC - Safe to expose
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)
NEXT_PUBLIC_SITE_URL=https://maisonslimani.com

# 🔒 PRIVATE - Never expose
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key)
RESEND_API_KEY=re_xxxxx...
ADMIN_SESSION_SECRET=your-secret-here
```

### ❌ Wrong Setup (DON'T DO THIS):

```env
# ❌ NEVER make these public!
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=...  # WRONG!
NEXT_PUBLIC_RESEND_API_KEY=...             # WRONG!
NEXT_PUBLIC_ADMIN_SESSION_SECRET=...       # WRONG!
```

---

## 🛡️ How Supabase Security Works

### Client-Side (Browser) - Uses Anon Key:
```typescript
// lib/supabase/client.ts - Runs in browser
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,      // ✅ Public
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // ✅ Public (safe!)
)
```

**What users can do:**
- ✅ Read data allowed by RLS policies
- ✅ Insert/update data allowed by RLS policies
- ❌ Cannot bypass RLS
- ❌ Cannot access admin functions

### Server-Side (API Routes) - Uses Service Role Key:
```typescript
// app/api/admin/commandes/route.ts - Runs on server
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,  // ✅ Public (just URL)
  process.env.SUPABASE_SERVICE_ROLE_KEY  // 🔒 Private (admin access)
)
```

**What server can do:**
- ✅ Bypass RLS (admin access)
- ✅ Access all tables
- ✅ Perform admin operations

---

## 🎯 Your Current Setup is CORRECT!

Looking at your code:

1. ✅ `NEXT_PUBLIC_SUPABASE_URL` - Used in client-side code → **Should be public**
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Used in client-side code → **Should be public** (safe!)
3. ✅ `SUPABASE_SERVICE_ROLE_KEY` - Used only in API routes → **Should be private** (no `NEXT_PUBLIC_`)

---

## 📝 Vercel's Warning Explained

When Vercel says:
> "This variable will be exposed to the browser"

It's just **informing** you, not warning of a problem. For `NEXT_PUBLIC_` variables, this is **expected and correct**.

### When to Worry:
- ❌ If you see `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` → **DANGER!** Remove `NEXT_PUBLIC_`
- ❌ If you see `NEXT_PUBLIC_RESEND_API_KEY` → **DANGER!** Remove `NEXT_PUBLIC_`
- ❌ If you see `NEXT_PUBLIC_ADMIN_SESSION_SECRET` → **DANGER!** Remove `NEXT_PUBLIC_`

### When It's Fine:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` → **OK!** Just a URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **OK!** Designed to be public
- ✅ `NEXT_PUBLIC_SITE_URL` → **OK!** Just a URL

---

## 🔐 Security Best Practices

1. **Always use `NEXT_PUBLIC_` prefix** for variables needed in browser code
2. **Never use `NEXT_PUBLIC_` prefix** for secrets (API keys, service role keys, etc.)
3. **Trust Supabase's RLS** - The anon key is safe because RLS protects your data
4. **Review your RLS policies** - Make sure they're correctly configured
5. **Use service role key only server-side** - Never in client components

---

## ✅ Summary

**Vercel's warning is just informational.** Your setup is correct:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` → Exposed to browser (safe, just a URL)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Exposed to browser (safe, protected by RLS)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` → **NOT** exposed (private, server-only)

**You're all good!** 👍

---

## 🆘 Still Concerned?

If you want to verify your RLS policies are protecting your data:

1. Go to Supabase Dashboard → Authentication → Policies
2. Check that all tables have appropriate RLS policies
3. Test with the anon key - you should only see allowed data

Your current setup follows Next.js and Supabase best practices! 🎉

