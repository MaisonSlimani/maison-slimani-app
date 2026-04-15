# 📝 Manual Migration Guide

This directory contains SQL migration files for manually migrating your Supabase project.

## 🚀 Quick Start

### Recommended: Use Complete Migration Script

1. Go to your **NEW** Supabase project → **SQL Editor**
2. Open `05_complete_migration.sql`
3. Copy and paste the entire file
4. Click **Run**

This will create your entire database schema in one go!

---

## 📁 Files in This Directory

### Main Migration Scripts:
- **`05_complete_migration.sql`** ⭐ - **Complete schema migration** (use this!)
- **`04_migrate_realtime.sql`** - Realtime configuration (included in complete script)

### Individual Migrations (in `supabase/migrations/`):
- `001_create_tables.sql` - Core tables
- `002_create_storage_bucket.sql` - Storage setup
- `003_create_rpc_functions.sql` - Database functions
- And more... (see `supabase/migrations/` folder)

---

## 📖 Full Guide

See **`MANUAL_MIGRATION_GUIDE.md`** for detailed step-by-step instructions.

---

## ✅ What Gets Migrated

- ✅ Database schema (tables, indexes, constraints)
- ✅ RLS policies (Row Level Security)
- ✅ Functions and triggers
- ✅ Storage buckets and policies
- ✅ Realtime configuration

## ❌ What Doesn't Get Migrated

- ❌ Data (you need to export/import separately)
- ❌ Storage files (upload manually or via CLI)
- ❌ Edge Functions (you're using Vercel API routes)

---

## 🎯 Migration Steps Summary

1. **Run `05_complete_migration.sql`** in new Supabase SQL Editor
2. **Import data** (if needed) via SQL Editor or Dashboard
3. **Upload storage files** manually or via Supabase CLI
4. **Update Vercel environment variables** to point to new project
5. **Test** your application

That's it! 🎉
