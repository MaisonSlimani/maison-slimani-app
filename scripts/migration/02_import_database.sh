#!/bin/bash

# Script to import database into new Supabase project
# Usage: ./02_import_database.sh

set -e

echo "🚀 Starting database import into new Supabase project..."

# Check if export file exists
if [ ! -f "exports/full_database_export.sql" ]; then
  echo "❌ File exports/full_database_export.sql not found"
  echo "   Please run script 01_export_database.sh first!"
  exit 1
fi

# Request connection information from user
read -p "Enter HOST of new project (e.g., db.xxxxx.supabase.co): " NEW_HOST
read -p "Enter PASSWORD of new database: " -s NEW_PASSWORD
echo ""
read -p "Enter PORT (default 5432): " NEW_PORT
NEW_PORT=${NEW_PORT:-5432}

echo ""
echo "⚠️  WARNING: This script will DELETE and RECREATE the entire database!"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Import cancelled."
  exit 1
fi

echo ""
echo "📦 Importing database..."
PGPASSWORD="$NEW_PASSWORD" psql \
  -h "$NEW_HOST" \
  -U postgres \
  -d postgres \
  -p "$NEW_PORT" \
  -f exports/full_database_export.sql

echo ""
echo "✅ Database import complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run script 03_migrate_storage.sh to migrate storage buckets"
echo "   2. Run script 04_migrate_realtime.sql to configure Realtime"
echo "   3. Check the database in Supabase Dashboard"

