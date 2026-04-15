# 🔑 Supabase Credentials Guide for Migration

This guide shows you exactly where to find all the credentials needed for the migration scripts.

## 📋 Credentials Needed from NEW Supabase Account

You need **4 pieces of information** from your new Supabase project:

1. **Database HOST**
2. **Database PASSWORD**
3. **PROJECT REF**
4. **SERVICE ROLE KEY**

---

## 🔍 How to Find Each Credential

### Step 1: Go to Your Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your **NEW** project (the one you're migrating TO)

### Step 2: Get Database HOST and PASSWORD

1. In your project dashboard, go to **Settings** (gear icon in left sidebar)
2. Click on **Database**
3. Scroll down to **Connection string** section
4. You'll see something like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

**Extract:**
- **Database HOST**: `db.xxxxx.supabase.co` (the part after `@` and before `:5432`)
- **Database PASSWORD**: The password part (you may need to click "Reveal" or reset it)

> 💡 **Note:** If you don't see the password, you can reset it:
> - Go to **Settings** → **Database** → **Database password**
> - Click **Reset database password**
> - Copy the new password (you won't see it again!)

### Step 3: Get PROJECT REF

The PROJECT REF is the unique identifier in your project URL.

**Method 1: From URL**
- Look at your Supabase project URL: `https://supabase.com/dashboard/project/xxxxx`
- The `xxxxx` part is your PROJECT REF

**Method 2: From Settings**
1. Go to **Settings** → **General**
2. Look for **Reference ID** - that's your PROJECT REF

### Step 4: Get SERVICE ROLE KEY

1. Go to **Settings** → **API**
2. Scroll down to **Project API keys** section
3. Find **service_role** key (⚠️ **Keep this secret!**)
4. Click the **eye icon** to reveal it, or click **Copy** button

> ⚠️ **Security Warning:** The service_role key has admin access. Never commit it to Git or share it publicly!

---

## 📝 Quick Reference Table

| Credential | Where to Find | Example |
|------------|---------------|---------|
| **Database HOST** | Settings → Database → Connection string | `db.abcdefgh.supabase.co` |
| **Database PASSWORD** | Settings → Database → Database password (may need to reset) | `your-secure-password` |
| **PROJECT REF** | Settings → General → Reference ID | `abcdefgh` |
| **SERVICE ROLE KEY** | Settings → API → service_role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

---

## 🎯 What the Scripts Will Ask For

When you run the migration scripts, here's what they'll prompt for:

### For Database Migration:
- **HOST**: `db.xxxxx.supabase.co` (from connection string)
- **PASSWORD**: Your database password
- **PORT**: Usually `5432` (default)

### For Storage Migration:
- **PROJECT REF**: `xxxxx` (your project reference ID)
- **SERVICE ROLE KEY**: The service_role key from API settings

---

## ✅ Pre-Migration Checklist

Before running the migration, make sure you have:

- [ ] Database HOST from new project
- [ ] Database PASSWORD from new project (or reset it)
- [ ] PROJECT REF from new project
- [ ] SERVICE ROLE KEY from new project
- [ ] Same credentials from OLD project (for export)

---

## 🚀 Quick Start

Once you have all credentials:

```bash
cd scripts/migration
chmod +x *.sh
./00_full_migration.sh
```

The script will prompt you for each credential when needed.

---

## 🔒 Security Best Practices

1. **Never commit credentials to Git** - They're already in `.gitignore`
2. **Delete export files after migration** - `rm -rf exports/`
3. **Reset passwords after migration** - For extra security
4. **Use environment variables** - For production deployments

---

## 🆘 Troubleshooting

### "Connection refused" error
- Check that your HOST is correct (should start with `db.`)
- Verify the password is correct
- Make sure your IP is allowed (check Supabase Dashboard → Settings → Database → Connection pooling)

### "Invalid API key" error
- Make sure you copied the **service_role** key, not the **anon** key
- Check for extra spaces when pasting
- Verify the key starts with `eyJ`

### "Project not found" error
- Double-check your PROJECT REF is correct
- Make sure you're using the new project's credentials, not the old one

---

## 📚 Additional Resources

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Documentation](https://supabase.com/docs)
- [Migration README](./README.md) - Full migration guide

