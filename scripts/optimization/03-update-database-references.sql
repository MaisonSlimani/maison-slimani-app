-- ============================================
-- Script 3: Update Database References
-- ============================================
-- This script updates all product references to use WebP versions
-- instead of PNG/JPEG versions
-- ============================================
-- IMPORTANT: Run Script 2 first to create optimized versions!
-- ============================================
-- SAFETY: This script verifies WebP versions exist in storage
-- before updating database references
-- ============================================

-- ============================================
-- Step 0: Verification - Check which WebP files exist
-- ============================================
-- This query shows which PNG/JPEG files have WebP versions
SELECT 
  original.name as original_file,
  CASE 
    WHEN webp.name IS NOT NULL THEN '✅ WebP exists'
    ELSE '❌ WebP missing'
  END as webp_status
FROM storage.objects original
LEFT JOIN storage.objects webp ON 
  webp.bucket_id = 'produits-images'
  AND webp.name = REPLACE(REPLACE(REPLACE(original.name, '.png', '.webp'), '.jpg', '.webp'), '.jpeg', '.webp')
WHERE original.bucket_id = 'produits-images'
  AND original.name LIKE 'produits/%'
  AND (original.name LIKE '%.png' OR original.name LIKE '%.jpg' OR original.name LIKE '%.jpeg')
  AND NOT original.name LIKE '%.webp'
ORDER BY 
  CASE WHEN webp.name IS NOT NULL THEN 0 ELSE 1 END,
  original.name;

-- ============================================
-- Step 1: Update image_url column (with verification)
-- ============================================
-- Only update if WebP version exists in storage
UPDATE produits p
SET image_url = REPLACE(p.image_url, '.png', '.webp')
WHERE p.image_url LIKE '%.png'
  AND p.image_url LIKE '%/produits/%'
  AND EXISTS (
    SELECT 1
    FROM storage.objects so
    WHERE so.bucket_id = 'produits-images'
      AND so.name = REPLACE(
        REPLACE(p.image_url, 'https://', ''),
        SPLIT_PART(SPLIT_PART(p.image_url, '/storage/v1/object/public/produits-images/', 2), '?', 1),
        REPLACE(SPLIT_PART(SPLIT_PART(p.image_url, '/storage/v1/object/public/produits-images/', 2), '?', 1), '.png', '.webp')
      )
  );

-- Simpler approach: Extract filename and check if WebP exists
-- For image_url, we'll use a function that checks storage
CREATE OR REPLACE FUNCTION update_image_url_if_webp_exists()
RETURNS void AS $$
DECLARE
  produit_record RECORD;
  original_filename TEXT;
  webp_filename TEXT;
  webp_exists BOOLEAN;
BEGIN
  FOR produit_record IN 
    SELECT id, image_url
    FROM produits
    WHERE image_url LIKE '%/produits/%'
      AND (image_url LIKE '%.png' OR image_url LIKE '%.jpg' OR image_url LIKE '%.jpeg')
  LOOP
    -- Extract filename from URL
    original_filename := SPLIT_PART(SPLIT_PART(produit_record.image_url, '/produits/', 2), '?', 1);
    
    -- Generate WebP filename
    webp_filename := REPLACE(REPLACE(REPLACE(original_filename, '.png', '.webp'), '.jpg', '.webp'), '.jpeg', '.webp');
    
    -- Check if WebP exists in storage
    SELECT EXISTS (
      SELECT 1
      FROM storage.objects
      WHERE bucket_id = 'produits-images'
        AND name = 'produits/' || webp_filename
    ) INTO webp_exists;
    
    -- Only update if WebP exists
    IF webp_exists THEN
      UPDATE produits
      SET image_url = REPLACE(REPLACE(REPLACE(image_url, '.png', '.webp'), '.jpg', '.webp'), '.jpeg', '.webp')
      WHERE id = produit_record.id;
    ELSE
      RAISE NOTICE 'Skipping % - WebP version not found: %', produit_record.id, webp_filename;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the function
SELECT update_image_url_if_webp_exists();

-- Drop the function
DROP FUNCTION update_image_url_if_webp_exists();

-- ============================================
-- Step 2: Update images JSONB array (with verification)
-- ============================================
-- Update images array where each element has a 'url' field
-- Only updates if WebP version exists
CREATE OR REPLACE FUNCTION update_images_array_if_webp_exists()
RETURNS void AS $$
DECLARE
  produit_record RECORD;
  img JSONB;
  img_url TEXT;
  webp_url TEXT;
  webp_filename TEXT;
  webp_exists BOOLEAN;
  updated_images JSONB;
BEGIN
  FOR produit_record IN 
    SELECT id, images
    FROM produits
    WHERE images IS NOT NULL
      AND images::text LIKE '%/produits/%'
      AND (images::text LIKE '%.png%' OR images::text LIKE '%.jpg%' OR images::text LIKE '%.jpeg%')
  LOOP
    updated_images := '[]'::jsonb;
    
    -- Loop through each image in the array
    FOR img IN SELECT * FROM jsonb_array_elements(produit_record.images)
    LOOP
      IF img->>'url' IS NOT NULL THEN
        img_url := img->>'url';
        
        -- Extract filename from URL
        webp_filename := SPLIT_PART(SPLIT_PART(img_url, '/produits/', 2), '?', 1);
        
        -- Generate WebP filename
        webp_filename := REPLACE(REPLACE(REPLACE(webp_filename, '.png', '.webp'), '.jpg', '.webp'), '.jpeg', '.webp');
        
        -- Check if WebP exists
        SELECT EXISTS (
          SELECT 1
          FROM storage.objects
          WHERE bucket_id = 'produits-images'
            AND name = 'produits/' || webp_filename
        ) INTO webp_exists;
        
        -- Only update if WebP exists
        IF webp_exists THEN
          webp_url := REPLACE(REPLACE(REPLACE(img_url, '.png', '.webp'), '.jpg', '.webp'), '.jpeg', '.webp');
          updated_images := updated_images || jsonb_set(img, '{url}', to_jsonb(webp_url));
        ELSE
          -- Keep original if WebP doesn't exist
          RAISE NOTICE 'Skipping image in product % - WebP not found: %', produit_record.id, webp_filename;
          updated_images := updated_images || img;
        END IF;
      ELSE
        updated_images := updated_images || img;
      END IF;
    END LOOP;
    
    -- Update the product
    UPDATE produits
    SET images = updated_images
    WHERE id = produit_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the function
SELECT update_images_array_if_webp_exists();

-- Drop the function
DROP FUNCTION update_images_array_if_webp_exists();

-- ============================================
-- Step 3: Update couleurs JSONB array (with verification)
-- ============================================
-- This is the most complex: update images array within each color
-- Only updates if WebP version exists in storage
CREATE OR REPLACE FUNCTION update_couleurs_images_to_webp()
RETURNS void AS $$
DECLARE
  produit_record RECORD;
  updated_couleurs JSONB;
  couleur JSONB;
  updated_images JSONB;
  img_text TEXT;
  updated_img TEXT;
  webp_filename TEXT;
  webp_exists BOOLEAN;
BEGIN
  -- Loop through products that have couleurs with images
  FOR produit_record IN 
    SELECT id, couleurs
    FROM produits
    WHERE couleurs IS NOT NULL
      AND couleurs::text LIKE '%/produits/%'
      AND (couleurs::text LIKE '%.png%' OR couleurs::text LIKE '%.jpg%' OR couleurs::text LIKE '%.jpeg%')
  LOOP
    updated_couleurs := '[]'::jsonb;
    
    -- Loop through each color
    FOR couleur IN SELECT * FROM jsonb_array_elements(produit_record.couleurs)
    LOOP
      updated_images := '[]'::jsonb;
      
      -- Check if this color has an images array
      IF couleur->'images' IS NOT NULL AND jsonb_typeof(couleur->'images') = 'array' THEN
        -- Loop through each image in the color's images array
        FOR img_text IN SELECT * FROM jsonb_array_elements_text(couleur->'images')
        LOOP
          -- Extract filename from URL
          webp_filename := SPLIT_PART(SPLIT_PART(img_text, '/produits/', 2), '?', 1);
          
          -- Generate WebP filename
          webp_filename := REPLACE(REPLACE(REPLACE(webp_filename, '.png', '.webp'), '.jpg', '.webp'), '.jpeg', '.webp');
          
          -- Check if WebP exists in storage
          SELECT EXISTS (
            SELECT 1
            FROM storage.objects
            WHERE bucket_id = 'produits-images'
              AND name = 'produits/' || webp_filename
          ) INTO webp_exists;
          
          -- Only update if WebP exists
          IF webp_exists THEN
            updated_img := img_text;
            
            IF img_text LIKE '%.png%' THEN
              updated_img := REPLACE(img_text, '.png', '.webp');
            ELSIF img_text LIKE '%.jpg%' THEN
              updated_img := REPLACE(img_text, '.jpg', '.webp');
            ELSIF img_text LIKE '%.jpeg%' THEN
              updated_img := REPLACE(img_text, '.jpeg', '.webp');
            END IF;
            
            updated_images := updated_images || to_jsonb(updated_img);
          ELSE
            -- Keep original if WebP doesn't exist
            RAISE NOTICE 'Skipping image in product % - WebP not found: %', produit_record.id, webp_filename;
            updated_images := updated_images || to_jsonb(img_text);
          END IF;
        END LOOP;
        
        -- Update the color with new images array
        couleur := jsonb_set(couleur, '{images}', updated_images);
      END IF;
      
      updated_couleurs := updated_couleurs || couleur;
    END LOOP;
    
    -- Update the product
    UPDATE produits
    SET couleurs = updated_couleurs
    WHERE id = produit_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the function
SELECT update_couleurs_images_to_webp();

-- Drop the function after use
DROP FUNCTION update_couleurs_images_to_webp();

-- ============================================
-- Step 4: Summary of skipped images (WebP not found)
-- ============================================
-- This shows which images were NOT updated because WebP doesn't exist
-- You should run Script 2 again for these images
SELECT 
  'Images that were NOT updated (WebP missing)' as status,
  COUNT(*) as count
FROM produits
WHERE (
  (image_url LIKE '%/produits/%' AND (image_url LIKE '%.png' OR image_url LIKE '%.jpg' OR image_url LIKE '%.jpeg'))
  OR (images::text LIKE '%/produits/%' AND (images::text LIKE '%.png%' OR images::text LIKE '%.jpg%' OR images::text LIKE '%.jpeg%'))
  OR (couleurs::text LIKE '%/produits/%' AND (couleurs::text LIKE '%.png%' OR couleurs::text LIKE '%.jpg%' OR couleurs::text LIKE '%.jpeg%'))
)
AND NOT (
  image_url LIKE '%.webp%'
  OR images::text LIKE '%.webp%'
  OR couleurs::text LIKE '%.webp%'
);

-- ============================================
-- Verification: Check what was updated
-- ============================================
-- Count products with WebP vs non-WebP images
SELECT 
  'image_url' as location,
  COUNT(*) FILTER (WHERE image_url LIKE '%.webp%') as webp_count,
  COUNT(*) FILTER (WHERE image_url LIKE '%/produits/%' AND image_url NOT LIKE '%.webp%' AND (image_url LIKE '%.png%' OR image_url LIKE '%.jpg%' OR image_url LIKE '%.jpeg%')) as non_webp_count
FROM produits
WHERE image_url LIKE '%/produits/%'

UNION ALL

SELECT 
  'images array' as location,
  COUNT(*) FILTER (WHERE images::text LIKE '%.webp%') as webp_count,
  COUNT(*) FILTER (WHERE images::text LIKE '%/produits/%' AND images::text NOT LIKE '%.webp%' AND (images::text LIKE '%.png%' OR images::text LIKE '%.jpg%' OR images::text LIKE '%.jpeg%')) as non_webp_count
FROM produits
WHERE images::text LIKE '%/produits/%'

UNION ALL

SELECT 
  'couleurs.images' as location,
  COUNT(*) FILTER (WHERE couleurs::text LIKE '%.webp%') as webp_count,
  COUNT(*) FILTER (WHERE couleurs::text LIKE '%/produits/%' AND couleurs::text NOT LIKE '%.webp%' AND (couleurs::text LIKE '%.png%' OR couleurs::text LIKE '%.jpg%' OR couleurs::text LIKE '%.jpeg%')) as non_webp_count
FROM produits
WHERE couleurs::text LIKE '%/produits/%';

-- ============================================
-- Show sample of updated products
-- ============================================
SELECT 
  id,
  nom,
  CASE 
    WHEN image_url LIKE '%.webp%' THEN '✅ WebP'
    WHEN image_url LIKE '%/produits/%' THEN '⚠️ Still non-WebP'
    ELSE 'N/A'
  END as image_url_status,
  CASE 
    WHEN images::text LIKE '%.webp%' THEN '✅ WebP'
    WHEN images::text LIKE '%/produits/%' THEN '⚠️ Still non-WebP'
    ELSE 'N/A'
  END as images_array_status,
  CASE 
    WHEN couleurs::text LIKE '%.webp%' THEN '✅ WebP'
    WHEN couleurs::text LIKE '%/produits/%' THEN '⚠️ Still non-WebP'
    ELSE 'N/A'
  END as couleurs_status
FROM produits
WHERE image_url LIKE '%/produits/%'
   OR images::text LIKE '%/produits/%'
   OR couleurs::text LIKE '%/produits/%'
LIMIT 10;

