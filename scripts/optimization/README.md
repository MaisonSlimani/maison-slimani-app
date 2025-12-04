# Image Optimization Scripts

This directory contains 4 separate scripts to optimize all product images and update the database.

## Scripts Overview

1. **01-find-unoptimized-images.sql** - Find all unoptimized images
2. **02-create-optimized-versions.ts** - Create WebP optimized versions
3. **03-update-database-references.sql** - Update database to use WebP URLs
4. **04-remove-unoptimized-from-storage.ts** - Delete original PNG/JPEG files

## Execution Order

**IMPORTANT:** Run scripts in this exact order:

```
1. Run Script 1 (SQL) → See what needs optimization
2. Run Script 2 (TypeScript) → Create optimized versions
3. Run Script 3 (SQL) → Update database references
4. Run Script 4 (TypeScript) → Delete original files
```

## How to Run

### Script 1: Find Unoptimized Images (SQL)
Run in Supabase SQL Editor:
```sql
-- Copy and paste contents of 01-find-unoptimized-images.sql
```

### Script 2: Create Optimized Versions (TypeScript)
```bash
npm run optimize:create-versions
```

Or directly:
```bash
tsx scripts/optimization/02-create-optimized-versions.ts
```

### Script 3: Update Database References (SQL)
Run in Supabase SQL Editor:
```sql
-- Copy and paste contents of 03-update-database-references.sql
```

### Script 4: Remove Unoptimized Files (TypeScript)
```bash
npm run optimize:cleanup
```

Or directly:
```bash
tsx scripts/optimization/04-remove-unoptimized-from-storage.ts
```

## What Each Script Does

### Script 1: Find Unoptimized Images
- Lists all PNG/JPEG files in storage
- Shows which products reference them
- Provides summary statistics

### Script 2: Create Optimized Versions
- Downloads each PNG/JPEG image
- Optimizes with sharp (WebP, quality 85, max 2000px)
- Uploads optimized version to storage
- Keeps original files intact

### Script 3: Update Database References
- Updates `image_url` column (PNG/JPEG → WebP)
- Updates `images` JSONB array (PNG/JPEG → WebP)
- Updates `couleurs` JSONB array (PNG/JPEG → WebP in each color's images)
- Provides verification queries

### Script 4: Remove Unoptimized Files
- Verifies WebP versions exist for each file
- Deletes original PNG/JPEG files from storage
- Shows summary of space freed

## Safety Features

- Script 2: Creates new files, doesn't delete originals
- Script 3: Updates database, doesn't touch storage
- Script 4: Verifies WebP exists before deleting, skips if not found

## Verification

After running all scripts, verify:

1. **Storage**: Check Supabase Storage → `produits-images` bucket
   - Should only see `.webp` files
   - Original PNG/JPEG should be gone

2. **Database**: Run verification query from Script 3
   - All image URLs should end with `.webp`

3. **Website**: Check product pages
   - Images should load correctly
   - Should be faster (smaller file sizes)

## Troubleshooting

### Script 2 fails
- Check environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Ensure sharp is installed: `npm install sharp`

### Script 3 shows errors
- Make sure Script 2 completed successfully
- Check that WebP files exist in storage

### Script 4 skips files
- This means WebP version doesn't exist
- Re-run Script 2 for those specific files

## Notes

- Scripts are designed to be run separately
- Each script can be run multiple times safely
- Script 4 will skip files without WebP versions
- Original files are kept until Script 4 is run

