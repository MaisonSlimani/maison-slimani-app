#!/bin/bash

# Script to export entire database from old Supabase project
# Usage: ./01_export_database.sh

set -e

echo "🚀 Starting database export from old Supabase project..."

# Request connection information from user
read -p "Enter HOST of old project (e.g., db.xxxxx.supabase.co): " OLD_HOST
read -p "Enter PASSWORD of old database: " -s OLD_PASSWORD
echo ""
read -p "Enter PORT (default 5432): " OLD_PORT
OLD_PORT=${OLD_PORT:-5432}

# Create exports directory if it doesn't exist
mkdir -p exports

echo ""
echo "📦 Exporting schema (database structure)..."
PGPASSWORD="$OLD_PASSWORD" pg_dump \
  -h "$OLD_HOST" \
  -U postgres \
  -d postgres \
  -p "$OLD_PORT" \
  --schema-only \
  --no-owner \
  --no-privileges \
  --clean \
  -f exports/schema_export.sql

echo "✅ Schema exported to exports/schema_export.sql"

echo ""
echo "📦 Exporting data..."
PGPASSWORD="$OLD_PASSWORD" pg_dump \
  -h "$OLD_HOST" \
  -U postgres \
  -d postgres \
  -p "$OLD_PORT" \
  --data-only \
  --no-owner \
  --no-privileges \
  -f exports/data_export.sql

echo "✅ Data exported to exports/data_export.sql"

echo ""
echo "📦 Exporting everything (schema + data) - recommended file..."
PGPASSWORD="$OLD_PASSWORD" pg_dump \
  -h "$OLD_HOST" \
  -U postgres \
  -d postgres \
  -p "$OLD_PORT" \
  --no-owner \
  --no-privileges \
  --clean \
  -f exports/full_database_export.sql

echo "✅ Export complete!"
echo ""
echo "📁 Files created:"
echo "   - exports/schema_export.sql (schema only)"
echo "   - exports/data_export.sql (data only)"
echo "   - exports/full_database_export.sql (schema + data) ⭐ RECOMMENDED"
echo ""
echo "⚠️  WARNING: Delete these files after migration for security!"

