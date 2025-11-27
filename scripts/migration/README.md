# 🚀 Supabase Project Migration Guide

This toolkit helps you migrate your entire Supabase project (database, storage buckets, and configurations) from one Supabase project to a new one.

## 📋 Table of Contents

1. [Requirements](#requirements)
2. [Migration Steps](#migration-steps)
3. [Script Details](#script-details)
4. [Troubleshooting](#troubleshooting)

---

## 🔧 Requirements

### Required Tools

1. **PostgreSQL Client** (`psql` and `pg_dump`)
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql-client
   
   # macOS
   brew install postgresql
   ```

2. **jq** (to parse JSON in bash scripts)
   ```bash
   # Ubuntu/Debian
   sudo apt-get install jq
   
   # macOS
   brew install jq
   ```

3. **curl** (usually pre-installed)

### Information to Prepare

**From Old Project:**
- Database HOST (e.g., `db.xxxxx.supabase.co`)
- Database PASSWORD
- PROJECT REF (e.g., `xxxxx`)
- SERVICE ROLE KEY

**From New Project:**
- Database HOST
- Database PASSWORD
- PROJECT REF
- SERVICE ROLE KEY

> 💡 **Get information:** Go to Supabase Dashboard → Settings → API → Database → Connection string and Service role key

---

## 📝 Migration Steps

### Step 1: Export Database from Old Project

```bash
cd scripts/migration
chmod +x *.sh
./01_export_database.sh
```

This script will create:
- `exports/schema_export.sql` - Schema only
- `exports/data_export.sql` - Data only
- `exports/full_database_export.sql` - Schema + Data ⭐ **RECOMMENDED**

### Step 2: Create Schema on New Project

**Method 1: Use complete SQL script (RECOMMENDED)**
```bash
# Run the complete SQL script
psql -h [NEW_HOST] -U postgres -d postgres -f 05_complete_migration.sql
```

**Method 2: Import from export file**
```bash
./02_import_database.sh
```

> ⚠️ **WARNING:** The `02_import_database.sh` script will DELETE and RECREATE the entire database!

### Step 3: Import Data (if using Method 1 in Step 2)

If you created the schema using `05_complete_migration.sql`, you only need to import data:

```bash
# Import data only, not schema
psql -h [NEW_HOST] -U postgres -d postgres -f exports/data_export.sql
```

Or use the script:
```bash
./02_import_database.sh
```

### Step 4: Migrate Storage Buckets

```bash
# Create buckets and policies
./03_migrate_storage.sh

# Then run the generated SQL:
psql -h [NEW_HOST] -U postgres -d postgres -f exports/storage_migration.sql
```

### Step 5: Migrate Storage Files

```bash
# Download and upload files from old bucket to new one
./03b_migrate_storage_files.sh
```

### Step 6: Configure Realtime

```bash
# Run SQL script to configure Realtime
psql -h [NEW_HOST] -U postgres -d postgres -f 04_migrate_realtime.sql
```

---

## 📄 Script Details

### `01_export_database.sh`
- **Purpose:** Export entire database from old project
- **Input:** HOST, PASSWORD, PORT of old project
- **Output:** SQL files in `exports/` directory

### `02_import_database.sh`
- **Purpose:** Import database into new project
- **Input:** HOST, PASSWORD, PORT of new project
- **Warning:** This script will DELETE and RECREATE the entire database!

### `03_migrate_storage.sh`
- **Purpose:** Create SQL script for buckets and policies
- **Input:** PROJECT REF and SERVICE ROLE KEY of both projects
- **Output:** `exports/storage_migration.sql`

### `03b_migrate_storage_files.sh`
- **Purpose:** Download files from old bucket and upload to new bucket
- **Input:** PROJECT REF, SERVICE ROLE KEY, and bucket name
- **Note:** This script downloads files to local first, then uploads them

### `04_migrate_realtime.sql`
- **Purpose:** Configure Realtime subscriptions
- **Usage:** Run directly on new database

### `05_complete_migration.sql`
- **Purpose:** Complete SQL script with all schema, functions, triggers, RLS policies
- **Usage:** Run directly on new database to create entire schema
- **Note:** This script does NOT import data, only creates schema

---

## 🔍 Troubleshooting

### Error: "pg_dump: command not found"
```bash
# Install PostgreSQL client
sudo apt-get install postgresql-client  # Ubuntu/Debian
brew install postgresql                 # macOS
```

### Error: "jq: command not found"
```bash
# Install jq
sudo apt-get install jq  # Ubuntu/Debian
brew install jq          # macOS
```

### Database connection error
- Check if HOST and PASSWORD are correct
- Check if firewall/network is blocking the connection
- Try manual connection: `psql -h [HOST] -U postgres -d postgres`

### Error when migrating storage files
- Check if SERVICE ROLE KEY is correct
- Check if bucket name is correct
- Check storage API access permissions

### RLS Policies not working
- Ensure you've run the complete `05_complete_migration.sql` script
- Check if RLS is enabled: `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;`
- Check if policies are created: `SELECT * FROM pg_policies WHERE tablename = '[table]';`

### Realtime not working
- Ensure you've run the `04_migrate_realtime.sql` script
- Check publication: `SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';`
- Check table in publication: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`

---

## ✅ Post-Migration Checklist

- [ ] Database schema has been created completely
- [ ] Data has been imported
- [ ] Storage buckets have been created
- [ ] Storage files have been uploaded
- [ ] RLS policies are working correctly
- [ ] Realtime subscriptions are working
- [ ] Test API endpoints
- [ ] Test admin dashboard
- [ ] Test client app
- [ ] Update environment variables in application

---

## 🔒 Security

⚠️ **IMPORTANT:** After migration is complete, delete export files containing sensitive information:

```bash
# Delete export files
rm -rf exports/
```

Or if you want to keep them, ensure:
- Don't commit to Git
- Set appropriate file permissions: `chmod 600 exports/*.sql`
- Store in a secure location

---

## 📞 Support

If you encounter issues, check:
1. Script logs
2. Supabase Dashboard → Logs
3. PostgreSQL logs (if you have access)

---

## 📚 References

- [Supabase Migration Guide](https://supabase.com/docs/guides/database/migrations)
- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Supabase Storage API](https://supabase.com/docs/reference/javascript/storage)
