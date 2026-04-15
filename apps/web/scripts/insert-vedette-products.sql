-- Script SQL pour ajouter les 3 produits vedette (anciennement hardcodés) dans la base de données
-- Les images seront ajoutées manuellement via l'admin ou directement dans Supabase Storage

-- Produit 1: Mocassin Fès
INSERT INTO produits (nom, description, prix, stock, image_url, categorie, vedette, date_ajout) VALUES
(
  'Mocassin Fès',
  'Mocassin élégant confectionné à la main dans la tradition marocaine. Chaussure en cuir de veau premium, finition soignée et détails artisanaux caractéristiques de la ville impériale. Confort exceptionnel et élégance intemporelle pour un style raffiné au quotidien.',
  2800.00,
  15,
  NULL, -- Image à ajouter manuellement
  'Classiques',
  true,
  NOW()
);

-- Produit 2: Richelieu Marrakech
INSERT INTO produits (nom, description, prix, stock, image_url, categorie, vedette, date_ajout) VALUES
(
  'Richelieu Marrakech',
  'Richelieu classique inspiré de l''élégance marocaine, confectionné en cuir italien de première qualité. Ligne épurée et sophistiquée, parfaite pour les occasions formelles. Finition impeccable et semelle intérieure en cuir pour un confort optimal tout au long de la journée.',
  3200.00,
  12,
  NULL, -- Image à ajouter manuellement
  'Classiques',
  true,
  NOW()
);

-- Produit 3: Boots Casablanca
INSERT INTO produits (nom, description, prix, stock, image_url, categorie, vedette, date_ajout) VALUES
(
  'Boots Casablanca',
  'Boots modernes alliant confort et style, en cuir grainé résistant. Design contemporain inspiré de la métropole marocaine, parfait pour un usage quotidien tout en conservant une élégance raffinée. Semelle technique et doublure cuir pour un maintien optimal du pied.',
  3600.00,
  10,
  NULL, -- Image à ajouter manuellement
  'Classiques',
  true,
  NOW()
);

-- Note: Après l'insertion, vous devrez mettre à jour les image_url via l'admin ou directement dans Supabase :
-- UPDATE produits SET image_url = 'votre_url_image' WHERE nom = 'Mocassin Fès';
-- UPDATE produits SET image_url = 'votre_url_image' WHERE nom = 'Richelieu Marrakech';
-- UPDATE produits SET image_url = 'votre_url_image' WHERE nom = 'Boots Casablanca';

