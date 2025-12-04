-- ============================================
-- Script 1: Find All Unoptimized Images
-- ============================================
-- This script finds all images in storage that are NOT WebP format
-- and shows which products reference them
-- ============================================

-- Find all non-WebP images in storage
SELECT 
  name as filename,
  metadata->>'size' as size_bytes,
  ROUND((metadata->>'size')::bigint / 1024.0 / 1024.0, 2) as size_mb,
  created_at,
  updated_at
FROM storage.objects
WHERE bucket_id = 'produits-images'
  AND name LIKE 'produits/%'
  AND NOT name LIKE '%.webp'
ORDER BY (metadata->>'size')::bigint DESC;

-- ============================================
-- Find products that reference unoptimized images
-- ============================================

-- Get all non-WebP filenames from storage
WITH unoptimized_files AS (
  SELECT 
    name as filename,
    SPLIT_PART(name, '/', 2) as file_basename
  FROM storage.objects
  WHERE bucket_id = 'produits-images'
    AND name LIKE 'produits/%'
    AND NOT name LIKE '%.webp'
),
-- Extract just the unique identifier part (timestamp-random part)
file_identifiers AS (
  SELECT DISTINCT
    filename,
    file_basename,
    -- Extract the identifier part (e.g., "1764697631265-k2qc4h" from "1764697631265-k2qc4h.png")
    SPLIT_PART(file_basename, '.', 1) as file_id
  FROM unoptimized_files
)
-- Find products that reference these files
SELECT DISTINCT
  p.id,
  p.nom,
  p.image_url,
  CASE 
    WHEN p.image_url LIKE '%' || fi.file_id || '%' THEN '✅ image_url'
    ELSE NULL
  END as in_image_url,
  CASE 
    WHEN p.images::text LIKE '%' || fi.file_id || '%' THEN '✅ images array'
    ELSE NULL
  END as in_images_array,
  CASE 
    WHEN p.couleurs::text LIKE '%' || fi.file_id || '%' THEN '✅ couleurs.images'
    ELSE NULL
  END as in_couleurs,
  fi.filename as unoptimized_file
FROM produits p
CROSS JOIN file_identifiers fi
WHERE 
  p.image_url LIKE '%' || fi.file_id || '%'
  OR p.images::text LIKE '%' || fi.file_id || '%'
  OR p.couleurs::text LIKE '%' || fi.file_id || '%'
ORDER BY p.nom, fi.filename;

-- ============================================
-- Summary: Count unoptimized images by type
-- ============================================
SELECT 
  CASE 
    WHEN name LIKE '%.png' THEN 'PNG'
    WHEN name LIKE '%.jpg' OR name LIKE '%.jpeg' THEN 'JPEG'
    ELSE 'Other'
  END as file_type,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::bigint) as total_bytes,
  ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_mb,
  ROUND(AVG((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as avg_mb
FROM storage.objects
WHERE bucket_id = 'produits-images'
  AND name LIKE 'produits/%'
  AND NOT name LIKE '%.webp'
GROUP BY file_type
ORDER BY total_mb DESC;

