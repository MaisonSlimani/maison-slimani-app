-- Migration 048: Deep Normalization of JSONB Stock Data to English Keys
-- This transforms all 'nom' to 'name' and 'quantite' to 'stock' inside JSONB columns.

UPDATE produits
SET 
  colors = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', COALESCE(v->>'name', v->>'nom', ''),
        'code', COALESCE(v->>'code', ''),
        'stock', COALESCE((v->>'stock')::int, (v->>'quantite')::int, 0),
        'images', COALESCE(v->'images', '[]'::jsonb),
        'sizes', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'name', COALESCE(s->>'name', s->>'nom', ''),
              'stock', COALESCE((s->>'stock')::int, (s->>'quantite')::int, 0)
            )
          )
          FROM jsonb_array_elements(COALESCE(v->'sizes', v->'tailles', '[]'::jsonb)) s
        )
      )
    )
    FROM jsonb_array_elements(colors) v
  )
WHERE colors IS NOT NULL 
  AND jsonb_typeof(colors) = 'array'
  AND jsonb_array_length(colors) > 0;

-- Also normalize standalone sizes
UPDATE produits
SET 
  sizes = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', COALESCE(s->>'name', s->>'nom', ''),
        'stock', COALESCE((s->>'stock')::int, (s->>'quantite')::int, 0)
      )
    )
    FROM jsonb_array_elements(sizes) s
  )
WHERE sizes IS NOT NULL 
  AND jsonb_typeof(sizes) = 'array'
  AND jsonb_array_length(sizes) > 0;

-- Refresh total stock for everyone
UPDATE produits
SET total_stock = (
  CASE 
    WHEN has_colors THEN (
      SELECT SUM((s->>'stock')::int)
      FROM jsonb_array_elements(colors) v,
           jsonb_array_elements(v->'sizes') s
    )
    WHEN sizes IS NOT NULL AND jsonb_array_length(sizes) > 0 THEN (
      SELECT SUM((s->>'stock')::int)
      FROM jsonb_array_elements(sizes) s
    )
    ELSE stock
  END
);
