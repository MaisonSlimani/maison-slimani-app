# 📝 Manual Migration Guide - Using Supabase SQL Editor

This guide shows you how to migrate your database manually using Supabase SQL Editor instead of shell scripts.

## 🎯 Overview

Since you already have all migrations in `supabase/migrations/`, you just need to:
1. Run the migration SQL files in order on your **new** Supabase project
2. Copy storage files manually (if needed)
3. Configure Realtime

---

## 📋 Step 1: Run Migrations in Order

Go to your **NEW** Supabase project → **SQL Editor** and run these migrations in order:

### Core Tables & Setup:
1. `001_create_tables.sql` - Creates products, orders, admins tables
2. `002_create_storage_bucket.sql` - Creates storage bucket and policies
3. `003_create_rpc_functions.sql` - Creates RPC functions (decrementer_stock)
4. `004_update_rls_policies.sql` - Updates RLS policies
5. `005_admin_produits_rls.sql` - Admin product RLS policies
6. `005_create_storage_functions.sql` - Storage helper functions

### Additional Features:
7. `007_create_categories_table.sql` - Categories table
8. `009_add_taille_to_produits.sql` - Add size column to products
10. `010_allow_public_read_orders_by_id.sql` - Allow public order reading
11. `011_enable_realtime_commandes.sql` - Enable Realtime for orders
12. `012_allow_realtime_subscriptions.sql` - Realtime subscriptions
13. `013_add_multiple_images_and_colors.sql` - Multiple images/colors support
14. `014_create_settings_table.sql` - Settings table
15. `015_add_product_indexes.sql` - Product indexes
16. `016_add_fulltext_search.sql` - Full-text search support

### Or Use Complete Migration Script:
Instead of running each file individually, you can use:
- `05_complete_migration.sql` - **Complete schema in one file** (recommended!)

---

## 🚀 Quick Start: Using Complete Migration Script

### Step 1: Open SQL Editor
1. Go to your **NEW** Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run Complete Migration
1. Open `scripts/migration/05_complete_migration.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click **Run** (or press Ctrl+Enter)

This will create:
- ✅ All tables
- ✅ All indexes
- ✅ All RLS policies
- ✅ All functions
- ✅ All triggers
- ✅ Storage buckets and policies
- ✅ Realtime configuration

### Step 3: Import Data (Optional)

If you need to import data from your old project:

1. **Export from old project:**
   - Go to old Supabase project → Database → Backups
   - Create a backup or use pgAdmin/DBeaver to export data

2. **Import to new project:**
   - Go to new Supabase project → SQL Editor
   - Paste your data INSERT statements
   - Or use Supabase Dashboard → Database → Table Editor → Import

---

## 📦 Step 2: Storage Migration

### Option 1: Manual File Upload (Recommended for small projects)

1. Go to **Storage** in your new Supabase project
2. Create bucket `produits-images` (if not already created by migration)
3. Upload files manually through the dashboard

### Option 2: Use Supabase CLI (For large projects)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Copy files (if you have them locally)
supabase storage cp local-folder/ produits-images/
```

---

## 🔄 Step 3: Realtime Configuration

The Realtime configuration is already included in `05_complete_migration.sql`, but if you need to run it separately:

1. Open `scripts/migration/04_migrate_realtime.sql`
2. Copy and paste into SQL Editor
3. Run it

This will:
- ✅ Create `supabase_realtime` publication
- ✅ Add `commandes` table to realtime
- ✅ Configure REPLICA IDENTITY

---

## ✅ Verification Checklist

After running migrations, verify:

- [ ] Tables created: `produits`, `commandes`, `admins`, `categories`, `settings`
- [ ] Storage bucket `produits-images` exists and is public
- [ ] RLS policies are active (check in Authentication → Policies)
- [ ] Functions work: `decrementer_stock`, `search_products`, etc.
- [ ] Realtime is enabled (check in Database → Replication)

---

## 🎯 Complete Migration Order (If Running Individually)

If you prefer to run migrations one by one instead of the complete script:

```sql
-- 1. Core tables
001_create_tables.sql

-- 2. Storage
002_create_storage_bucket.sql
005_create_storage_functions.sql

-- 3. Functions
003_create_rpc_functions.sql

-- 4. RLS Policies
004_update_rls_policies.sql
005_admin_produits_rls.sql
010_allow_public_read_orders_by_id.sql

-- 5. Additional features
007_create_categories_table.sql
009_add_taille_to_produits.sql
013_add_multiple_images_and_colors.sql
014_create_settings_table.sql

-- 6. Performance
015_add_product_indexes.sql
016_add_fulltext_search.sql

-- 7. Realtime
011_enable_realtime_commandes.sql
012_allow_realtime_subscriptions.sql
```

---

## 📝 Notes

- **All migrations are idempotent** - They use `IF NOT EXISTS` and `ON CONFLICT`, so safe to run multiple times
- **Data is NOT migrated** - Only schema. You'll need to export/import data separately if needed
- **Storage files** - Need to be uploaded manually or via CLI
- **Test data** - `008_insert_test_products.sql` is optional (only if you want test data)

---

## 🆘 Troubleshooting

### "Relation already exists" errors
- This is normal if you run migrations multiple times
- The migrations use `IF NOT EXISTS`, so they're safe to re-run

### RLS policies not working
- Check that RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Verify policies exist in Authentication → Policies

### Storage bucket not accessible
- Make sure bucket is set to **public**
- Check storage policies in SQL Editor: `SELECT * FROM storage.buckets;`

---

## 🎉 Done!

Once all migrations are run, your new Supabase project will have the same schema as your old one. Just update your environment variables in Vercel to point to the new project!

