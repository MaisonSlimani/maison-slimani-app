# ⚡ Quick Start - Manual Migration

Simple guide to migrate your Supabase project manually using SQL Editor.

## 🚀 Fastest Way

1. **Open your NEW Supabase project** → **SQL Editor**
2. **Open `05_complete_migration.sql`** from this directory
3. **Copy the entire file** and paste into SQL Editor
4. **Click Run** (or Ctrl+Enter)

Done! Your complete schema is now migrated. ✅

---

## 📋 What You Need

- Access to your **NEW** Supabase project
- SQL Editor access (available in all Supabase projects)

---

## 📝 Step-by-Step

### 1. Run Complete Migration Script

1. Go to https://supabase.com/dashboard
2. Select your **NEW** project
3. Click **SQL Editor** in left sidebar
4. Click **New query**
5. Open `scripts/migration/05_complete_migration.sql`
6. Copy all contents (Ctrl+A, Ctrl+C)
7. Paste into SQL Editor (Ctrl+V)
8. Click **Run** button

This creates:
- ✅ All tables (produits, commandes, admins, categories, settings)
- ✅ All indexes
- ✅ All RLS policies
- ✅ All functions (decrementer_stock, search_products, etc.)
- ✅ All triggers
- ✅ Storage buckets and policies
- ✅ Realtime configuration

### 2. Import Data (If Needed)

If you have data to migrate:

**Option A: Via SQL Editor**
- Export data from old project as INSERT statements
- Paste and run in SQL Editor

**Option B: Via Dashboard**
- Go to **Table Editor**
- Click **Import** button
- Upload CSV or use manual entry

### 3. Upload Storage Files (If Needed)

1. Go to **Storage** in new project
2. Open `produits-images` bucket
3. Click **Upload files**
4. Select and upload your images

---

## ✅ Verification

After migration, check:

- [ ] Tables exist: Go to **Table Editor** → See all tables
- [ ] Storage bucket exists: Go to **Storage** → See `produits-images`
- [ ] RLS is enabled: Go to **Authentication** → **Policies**
- [ ] Functions work: Try running a query that uses a function

---

## 🆘 Having Issues?

See **`MANUAL_MIGRATION_GUIDE.md`** for detailed instructions and troubleshooting.

---

## 📚 Files Reference

- **`05_complete_migration.sql`** - Complete schema (use this!)
- **`04_migrate_realtime.sql`** - Realtime only (already in complete script)
- **`supabase/migrations/`** - Individual migration files (if you prefer step-by-step)
