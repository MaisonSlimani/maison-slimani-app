#!/bin/bash

# Complete script to migrate entire Supabase project
# Usage: ./00_full_migration.sh
# This script will guide you through each migration step

set -e

echo "🚀 =========================================="
echo "   SUPABASE PROJECT MIGRATION TOOL"
echo "   =========================================="
echo ""

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command -v psql &> /dev/null; then
  echo "❌ psql not found. Please install PostgreSQL client."
  exit 1
fi

if ! command -v pg_dump &> /dev/null; then
  echo "❌ pg_dump not found. Please install PostgreSQL client."
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "❌ jq not found. Please install jq."
  echo "   Ubuntu/Debian: sudo apt-get install jq"
  echo "   macOS: brew install jq"
  exit 1
fi

if ! command -v curl &> /dev/null; then
  echo "❌ curl not found. Please install curl."
  exit 1
fi

echo "✅ All dependencies ready!"
echo ""

# Main menu
while true; do
  echo "📋 Select migration step you want to perform:"
  echo ""
  echo "   1. Export database from old project"
  echo "   2. Create schema on new project (using complete SQL script)"
  echo "   3. Import data into new project"
  echo "   4. Migrate storage buckets and policies"
  echo "   5. Migrate storage files"
  echo "   6. Configure Realtime"
  echo "   7. Run all steps (full migration)"
  echo "   8. View detailed guide"
  echo "   0. Exit"
  echo ""
  read -p "Enter choice (0-8): " choice
  
  case $choice in
    1)
      echo ""
      echo "📦 Step 1: Export database from old project"
      ./01_export_database.sh
      echo ""
      read -p "Press Enter to continue..."
      ;;
    2)
      echo ""
      echo "📦 Step 2: Create schema on new project"
      echo ""
      read -p "Enter HOST of new project: " NEW_HOST
      read -p "Enter PASSWORD of new database: " -s NEW_PASSWORD
      echo ""
      read -p "Enter PORT (default 5432): " NEW_PORT
      NEW_PORT=${NEW_PORT:-5432}
      
      echo ""
      echo "⚠️  This script will create entire schema (tables, functions, triggers, RLS, etc.)"
      read -p "Are you sure you want to continue? (yes/no): " CONFIRM
      
      if [ "$CONFIRM" = "yes" ]; then
        echo ""
        echo "📦 Creating schema..."
        PGPASSWORD="$NEW_PASSWORD" psql \
          -h "$NEW_HOST" \
          -U postgres \
          -d postgres \
          -p "$NEW_PORT" \
          -f 05_complete_migration.sql
        
        echo ""
        echo "✅ Schema created successfully!"
      else
        echo "❌ Cancelled."
      fi
      echo ""
      read -p "Press Enter to continue..."
      ;;
    3)
      echo ""
      echo "📦 Step 3: Import data into new project"
      if [ ! -f "exports/full_database_export.sql" ]; then
        echo "❌ File exports/full_database_export.sql not found"
        echo "   Please run step 1 first!"
      else
        ./02_import_database.sh
      fi
      echo ""
      read -p "Press Enter to continue..."
      ;;
    4)
      echo ""
      echo "📦 Step 4: Migrate storage buckets"
      ./03_migrate_storage.sh
      echo ""
      read -p "Press Enter to continue..."
      ;;
    5)
      echo ""
      echo "📦 Step 5: Migrate storage files"
      ./03b_migrate_storage_files.sh
      echo ""
      read -p "Press Enter to continue..."
      ;;
    6)
      echo ""
      echo "📦 Step 6: Configure Realtime"
      read -p "Enter HOST of new project: " NEW_HOST
      read -p "Enter PASSWORD of new database: " -s NEW_PASSWORD
      echo ""
      read -p "Enter PORT (default 5432): " NEW_PORT
      NEW_PORT=${NEW_PORT:-5432}
      
      echo ""
      echo "📦 Configuring Realtime..."
      PGPASSWORD="$NEW_PASSWORD" psql \
        -h "$NEW_HOST" \
        -U postgres \
        -d postgres \
        -p "$NEW_PORT" \
        -f 04_migrate_realtime.sql
      
      echo ""
      echo "✅ Realtime configured!"
      echo ""
      read -p "Press Enter to continue..."
      ;;
    7)
      echo ""
      echo "🚀 Starting full migration..."
      echo ""
      echo "⚠️  WARNING: This process will:"
      echo "   1. Export database from old project"
      echo "   2. Create schema on new project"
      echo "   3. Import data into new project"
      echo "   4. Migrate storage buckets"
      echo "   5. Migrate storage files"
      echo "   6. Configure Realtime"
      echo ""
      read -p "Are you sure you want to continue? (yes/no): " CONFIRM
      
      if [ "$CONFIRM" != "yes" ]; then
        echo "❌ Cancelled."
        continue
      fi
      
      # Step 1: Export
      echo ""
      echo "📦 [1/6] Exporting database from old project..."
      ./01_export_database.sh
      
      # Step 2: Create schema
      echo ""
      echo "📦 [2/6] Creating schema on new project..."
      read -p "Enter HOST of new project: " NEW_HOST
      read -p "Enter PASSWORD of new database: " -s NEW_PASSWORD
      echo ""
      read -p "Enter PORT (default 5432): " NEW_PORT
      NEW_PORT=${NEW_PORT:-5432}
      
      PGPASSWORD="$NEW_PASSWORD" psql \
        -h "$NEW_HOST" \
        -U postgres \
        -d postgres \
        -p "$NEW_PORT" \
        -f 05_complete_migration.sql
      
      # Step 3: Import data
      echo ""
      echo "📦 [3/6] Importing data into new project..."
      PGPASSWORD="$NEW_PASSWORD" psql \
        -h "$NEW_HOST" \
        -U postgres \
        -d postgres \
        -p "$NEW_PORT" \
        -f exports/data_export.sql
      
      # Step 4: Storage buckets
      echo ""
      echo "📦 [4/6] Migrating storage buckets..."
      ./03_migrate_storage.sh
      
      if [ -f "exports/storage_migration.sql" ]; then
        PGPASSWORD="$NEW_PASSWORD" psql \
          -h "$NEW_HOST" \
          -U postgres \
          -d postgres \
          -p "$NEW_PORT" \
          -f exports/storage_migration.sql
      fi
      
      # Step 5: Storage files
      echo ""
      echo "📦 [5/6] Migrating storage files..."
      read -p "Do you want to migrate storage files now? (yes/no): " MIGRATE_FILES
      if [ "$MIGRATE_FILES" = "yes" ]; then
        ./03b_migrate_storage_files.sh
      else
        echo "⏭️  Skipping storage files migration. You can run it later using script 03b_migrate_storage_files.sh"
      fi
      
      # Step 6: Realtime
      echo ""
      echo "📦 [6/6] Configuring Realtime..."
      PGPASSWORD="$NEW_PASSWORD" psql \
        -h "$NEW_HOST" \
        -U postgres \
        -d postgres \
        -p "$NEW_PORT" \
        -f 04_migrate_realtime.sql
      
      echo ""
      echo "✅ =========================================="
      echo "   MIGRATION COMPLETE!"
      echo "   =========================================="
      echo ""
      echo "📝 Next steps:"
      echo "   1. Check database in Supabase Dashboard"
      echo "   2. Test API endpoints"
      echo "   3. Update environment variables in application"
      echo "   4. Delete export files for security: rm -rf exports/"
      echo ""
      read -p "Press Enter to continue..."
      ;;
    8)
      echo ""
      cat README.md | less
      ;;
    0)
      echo ""
      echo "👋 Goodbye!"
      exit 0
      ;;
    *)
      echo ""
      echo "❌ Invalid choice. Please try again."
      echo ""
      ;;
  esac
done
