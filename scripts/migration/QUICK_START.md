# ⚡ Quick Start - Supabase Migration

Quick guide to migrate your Supabase project in 5 minutes.

## 🚀 Fastest Way

```bash
cd scripts/migration
chmod +x *.sh
./00_full_migration.sh
```

Choose option `7` to run full automated migration.

---

## 📋 Manual Steps

### 1. Export Database
```bash
./01_export_database.sh
```

### 2. Create New Schema
```bash
# Method 1: Use complete SQL script (RECOMMENDED)
psql -h [NEW_HOST] -U postgres -d postgres -f 05_complete_migration.sql

# Method 2: Import from export file (will delete and recreate everything)
./02_import_database.sh
```

### 3. Import Data (if using Method 1 in Step 2)
```bash
psql -h [NEW_HOST] -U postgres -d postgres -f exports/data_export.sql
```

### 4. Migrate Storage
```bash
# Create buckets and policies
./03_migrate_storage.sh
psql -h [NEW_HOST] -U postgres -d postgres -f exports/storage_migration.sql

# Migrate files
./03b_migrate_storage_files.sh
```

### 5. Configure Realtime
```bash
psql -h [NEW_HOST] -U postgres -d postgres -f 04_migrate_realtime.sql
```

---

## 📝 Information to Prepare

**Old Project:**
- Database HOST: `db.xxxxx.supabase.co`
- Database PASSWORD
- PROJECT REF: `xxxxx`
- SERVICE ROLE KEY

**New Project:**
- Database HOST
- Database PASSWORD
- PROJECT REF
- SERVICE ROLE KEY

> Get from: Supabase Dashboard → Settings → API

---

## ✅ Post-Migration Checklist

- [ ] Database schema has been created
- [ ] Data has been imported
- [ ] Storage buckets have been created
- [ ] Storage files have been uploaded
- [ ] Realtime is working
- [ ] Test API endpoints
- [ ] Update environment variables
- [ ] Delete export files: `rm -rf exports/`

---

## 🆘 Having Issues?

See `README.md` for detailed guide and troubleshooting.
