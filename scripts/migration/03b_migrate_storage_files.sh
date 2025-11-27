#!/bin/bash

# Script to migrate files from old storage bucket to new one
# Usage: ./03b_migrate_storage_files.sh

set -e

echo "🚀 Starting Storage files migration..."

# Request old project information
read -p "Enter PROJECT REF of old project: " OLD_PROJECT_REF
read -p "Enter SERVICE ROLE KEY of old project: " -s OLD_SERVICE_KEY
echo ""

# Request new project information
read -p "Enter PROJECT REF of new project: " NEW_PROJECT_REF
read -p "Enter SERVICE ROLE KEY of new project: " -s NEW_SERVICE_KEY
echo ""

read -p "Enter bucket name to migrate (e.g., produits-images): " BUCKET_NAME

# Create temp directory
mkdir -p exports/storage_temp/$BUCKET_NAME

echo ""
echo "📦 Loading file list from bucket: $BUCKET_NAME"

# Get file list
FILES=$(curl -s \
  -H "apikey: $OLD_SERVICE_KEY" \
  -H "Authorization: Bearer $OLD_SERVICE_KEY" \
  "https://$OLD_PROJECT_REF.supabase.co/storage/v1/object/list/$BUCKET_NAME" | jq -r '.[].name' 2>/dev/null || echo "")

if [ -z "$FILES" ]; then
  echo "⚠️  No files found in bucket $BUCKET_NAME"
  exit 0
fi

FILE_COUNT=$(echo "$FILES" | grep -v '^$' | wc -l)
echo "✅ Found $FILE_COUNT files"

echo ""
echo "📥 Downloading files to local..."

DOWNLOADED=0
FAILED=0

for FILE in $FILES; do
  if [ -z "$FILE" ]; then
    continue
  fi
  
  # Create subdirectory if needed
  FILE_DIR=$(dirname "$FILE")
  if [ "$FILE_DIR" != "." ]; then
    mkdir -p "exports/storage_temp/$BUCKET_NAME/$FILE_DIR"
  fi
  
  # Download file
  echo "   Downloading: $FILE"
  HTTP_CODE=$(curl -s -o "exports/storage_temp/$BUCKET_NAME/$FILE" \
    -w "%{http_code}" \
    -H "apikey: $OLD_SERVICE_KEY" \
    -H "Authorization: Bearer $OLD_SERVICE_KEY" \
    "https://$OLD_PROJECT_REF.supabase.co/storage/v1/object/public/$BUCKET_NAME/$FILE")
  
  if [ "$HTTP_CODE" = "200" ]; then
    DOWNLOADED=$((DOWNLOADED + 1))
  else
    echo "   ❌ Error downloading $FILE (HTTP $HTTP_CODE)"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "📤 Uploading files to new project..."

UPLOADED=0
UPLOAD_FAILED=0

for FILE in $FILES; do
  if [ -z "$FILE" ] || [ ! -f "exports/storage_temp/$BUCKET_NAME/$FILE" ]; then
    continue
  fi
  
  echo "   Uploading: $FILE"
  
  # Upload file
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "apikey: $NEW_SERVICE_KEY" \
    -H "Authorization: Bearer $NEW_SERVICE_KEY" \
    -H "Content-Type: $(file --mime-type -b "exports/storage_temp/$BUCKET_NAME/$FILE")" \
    --data-binary "@exports/storage_temp/$BUCKET_NAME/$FILE" \
    "https://$NEW_PROJECT_REF.supabase.co/storage/v1/object/$BUCKET_NAME/$FILE")
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    UPLOADED=$((UPLOADED + 1))
  else
    echo "   ❌ Error uploading $FILE (HTTP $HTTP_CODE)"
    UPLOAD_FAILED=$((UPLOAD_FAILED + 1))
  fi
done

echo ""
echo "✅ Storage files migration complete!"
echo "   📥 Downloaded: $DOWNLOADED files"
echo "   📤 Uploaded: $UPLOADED files"
if [ $FAILED -gt 0 ] || [ $UPLOAD_FAILED -gt 0 ]; then
  echo "   ⚠️  Errors: $FAILED downloads, $UPLOAD_FAILED uploads"
fi

echo ""
echo "🧹 Cleaning up temporary files..."
rm -rf exports/storage_temp

echo "✅ Complete!"
