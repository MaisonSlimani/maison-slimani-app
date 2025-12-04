-- Verification queries for image optimization
-- Run these in Supabase SQL Editor after running the optimization script

-- 1. Check optimized WebP files (should show the 5 new files)
SELECT 
  name,
  metadata->>'size' as size_bytes,
  ROUND((metadata->>'size')::bigint / 1024.0 / 1024.0, 2) as size_mb,
  created_at,
  updated_at
FROM storage.objects
WHERE bucket_id = 'produits-images'
  AND name LIKE 'produits/%'
  AND name LIKE '%.webp'
ORDER BY created_at DESC
LIMIT 10;

-- 2. Compare original vs optimized for specific files
-- Replace the filenames with the ones that were optimized
SELECT 
  name,
  metadata->>'size' as size_bytes,
  ROUND((metadata->>'size')::bigint / 1024.0 / 1024.0, 2) as size_mb,
  CASE 
    WHEN name LIKE '%.webp' THEN 'Optimized (WebP)'
    ELSE 'Original'
  END as file_type
FROM storage.objects
WHERE bucket_id = 'produits-images'
  AND (
    -- Add the filenames that were processed here
    name LIKE '%1764700464634-gmy7ci%' OR
    name LIKE '%1764697631265-k2qc4h%' OR
    name LIKE '%1764705838567-o0j6gd%' OR
    name LIKE '%1764697639527-y7nwpi%' OR
    name LIKE '%1764705848075-vix93z%'
  )
ORDER BY name;

-- 3. Check products that reference optimized images
SELECT 
  id,
  nom,
  image_url,
  images,
  CASE 
    WHEN image_url LIKE '%.webp' THEN '✅ Using WebP'
    WHEN image_url IS NOT NULL THEN '⚠️ Still using original'
    ELSE 'No image_url'
  END as image_status
FROM produits
WHERE image_url LIKE '%1764700464634-gmy7ci%'
   OR image_url LIKE '%1764697631265-k2qc4h%'
   OR image_url LIKE '%1764705838567-o0j6gd%'
   OR image_url LIKE '%1764697639527-y7nwpi%'
   OR image_url LIKE '%1764705848075-vix93z%'
   OR images::text LIKE '%1764700464634-gmy7ci%'
   OR images::text LIKE '%1764697631265-k2qc4h%'
   OR images::text LIKE '%1764705838567-o0j6gd%'
   OR images::text LIKE '%1764697639527-y7nwpi%'
   OR images::text LIKE '%1764705848075-vix93z%'
LIMIT 20;

-- 4. Total storage usage comparison
SELECT 
  CASE 
    WHEN name LIKE '%.webp' THEN 'WebP (Optimized)'
    WHEN name LIKE '%.jpg' OR name LIKE '%.jpeg' THEN 'JPEG'
    WHEN name LIKE '%.png' THEN 'PNG'
    ELSE 'Other'
  END as file_type,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::bigint) as total_bytes,
  ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_mb
FROM storage.objects
WHERE bucket_id = 'produits-images'
  AND name LIKE 'produits/%'
GROUP BY file_type
ORDER BY total_mb DESC;

