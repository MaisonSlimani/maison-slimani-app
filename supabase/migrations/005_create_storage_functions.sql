-- Fonctions utilitaires pour gérer les images produits dans Storage

-- Fonction pour obtenir l'URL publique d'une image
CREATE OR REPLACE FUNCTION get_image_url(image_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CONCAT(
    current_setting('app.supabase_url', true),
    '/storage/v1/object/public/produits-images/',
    image_path
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour supprimer une image du Storage
-- Note: Cette fonction nécessite d'être appelée avec le service role key
CREATE OR REPLACE FUNCTION delete_product_image(image_path TEXT)
RETURNS VOID AS $$
BEGIN
  -- Supprimer l'objet du storage
  -- Note: En pratique, cela doit être fait via l'API Supabase Storage
  -- Cette fonction est un placeholder pour la logique
  RAISE NOTICE 'Suppression de l''image: %', image_path;
END;
$$ LANGUAGE plpgsql;

