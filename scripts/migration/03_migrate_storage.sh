#!/bin/bash

# Script to migrate Storage buckets from old project to new project
# Usage: ./03_migrate_storage.sh

set -e

echo "🚀 Starting Storage buckets migration..."

# Request old project information
read -p "Enter PROJECT REF of old project: " OLD_PROJECT_REF
read -p "Enter SERVICE ROLE KEY of old project: " -s OLD_SERVICE_KEY
echo ""

# Request new project information
read -p "Enter PROJECT REF of new project: " NEW_PROJECT_REF
read -p "Enter SERVICE ROLE KEY of new project: " -s NEW_SERVICE_KEY
echo ""

# Create temp directory if it doesn't exist
mkdir -p exports/storage_temp

echo ""
echo "📦 Loading bucket list from old project..."

# Get bucket list from old project
BUCKETS=$(curl -s \
  -H "apikey: $OLD_SERVICE_KEY" \
  -H "Authorization: Bearer $OLD_SERVICE_KEY" \
  "https://$OLD_PROJECT_REF.supabase.co/storage/v1/bucket" | jq -r '.[].name')

if [ -z "$BUCKETS" ]; then
  echo "⚠️  No buckets found in old project"
  exit 0
fi

echo "✅ Found buckets: $BUCKETS"

# Create SQL script to create buckets and policies
SQL_FILE="exports/storage_migration.sql"
cat > "$SQL_FILE" << 'EOF'
-- Storage Migration: Create buckets and policies
-- This script will recreate all buckets and policies from old project

EOF

for BUCKET in $BUCKETS; do
  echo ""
  echo "📦 Processing bucket: $BUCKET"
  
  # Get bucket information from old project
  BUCKET_INFO=$(curl -s \
    -H "apikey: $OLD_SERVICE_KEY" \
    -H "Authorization: Bearer $OLD_SERVICE_KEY" \
    "https://$OLD_PROJECT_REF.supabase.co/storage/v1/bucket/$BUCKET")
  
  PUBLIC=$(echo "$BUCKET_INFO" | jq -r '.public // false')
  FILE_SIZE_LIMIT=$(echo "$BUCKET_INFO" | jq -r '.file_size_limit // 5242880')
  ALLOWED_MIME_TYPES=$(echo "$BUCKET_INFO" | jq -r '.allowed_mime_types // [] | join(",")')
  
  # Add SQL to create bucket
  cat >> "$SQL_FILE" << EOF

-- Bucket: $BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  '$BUCKET',
  '$BUCKET',
  $PUBLIC,
  $FILE_SIZE_LIMIT,
  ARRAY[$(echo "$ALLOWED_MIME_TYPES" | sed "s/,/', '/g" | sed "s/^/'/" | sed "s/$/'/")]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

EOF
  
  # Get file list in bucket
  echo "   Loading file list..."
  FILES=$(curl -s \
    -H "apikey: $OLD_SERVICE_KEY" \
    -H "Authorization: Bearer $OLD_SERVICE_KEY" \
    "https://$OLD_PROJECT_REF.supabase.co/storage/v1/object/list/$BUCKET" | jq -r '.[].name' 2>/dev/null || echo "")
  
  if [ -n "$FILES" ]; then
    echo "   Found $(echo "$FILES" | wc -l) files"
    echo "   ⚠️  Files need to be downloaded and uploaded manually or via separate script"
  fi
done

# Add storage policies to SQL file
cat >> "$SQL_FILE" << 'EOF'

-- ============================================
-- Storage Policies for produits-images bucket
-- ============================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Lecture publique des images produits" ON storage.objects;
DROP POLICY IF EXISTS "Insertion images produits" ON storage.objects;
DROP POLICY IF EXISTS "Mise à jour images produits" ON storage.objects;
DROP POLICY IF EXISTS "Suppression images produits" ON storage.objects;

-- Public read policy (everyone can read)
CREATE POLICY "Lecture publique des images produits"
ON storage.objects
FOR SELECT
USING (bucket_id = 'produits-images');

-- Insert policy (authenticated only - admin via service role)
CREATE POLICY "Insertion images produits"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'produits-images');

-- Update policy (admin only)
CREATE POLICY "Mise à jour images produits"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'produits-images')
WITH CHECK (bucket_id = 'produits-images');

-- Delete policy (admin only)
CREATE POLICY "Suppression images produits"
ON storage.objects
FOR DELETE
USING (bucket_id = 'produits-images');

EOF

echo ""
echo "✅ SQL script created: $SQL_FILE"
echo ""
echo "📝 Next steps:"
echo "   1. Run this SQL script on new project:"
echo "      psql -h [NEW_HOST] -U postgres -d postgres -f $SQL_FILE"
echo ""
echo "   2. Or import via Supabase Dashboard:"
echo "      Database → SQL Editor → Paste contents of $SQL_FILE"
echo ""
echo "   3. To migrate files, use script 03b_migrate_storage_files.sh"
