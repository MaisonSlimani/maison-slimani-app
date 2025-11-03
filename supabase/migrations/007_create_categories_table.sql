-- Migration : Création de la table categories pour gérer les catégories dynamiquement

-- Table categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  couleur TEXT,
  ordre INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  date_creation TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_ordre ON categories(ordre);

-- Activer Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Les catégories actives sont visibles par tous
CREATE POLICY "Les catégories actives sont visibles par tous" ON categories
  FOR SELECT USING (active = true);

-- Supprimer la contrainte CHECK sur categorie dans produits et permettre des catégories dynamiques
ALTER TABLE produits DROP CONSTRAINT IF EXISTS produits_categorie_check;

-- Ajouter une contrainte de clé étrangère optionnelle (si on veut forcer la cohérence)
-- ALTER TABLE produits ADD CONSTRAINT fk_produits_categorie 
--   FOREIGN KEY (categorie) REFERENCES categories(nom) ON DELETE SET NULL;

-- Insertion des catégories par défaut
INSERT INTO categories (nom, slug, description, ordre) VALUES
  ('Classiques', 'classiques', 'L''essence de l''élégance quotidienne. Nos modèles classiques allient tradition et modernité.', 1),
  ('Cuirs Exotiques', 'cuirs-exotiques', 'Le luxe dans sa forme la plus rare. Des cuirs précieux et exotiques pour des créations d''exception.', 2),
  ('Éditions Limitées', 'editions-limitees', 'Des pièces uniques pour les connaisseurs. Chaque édition limitée raconte une histoire unique.', 3),
  ('Nouveautés', 'nouveautes', 'Les dernières créations de nos ateliers. Découvrez nos nouveautés qui célèbrent l''innovation.', 4)
ON CONFLICT (slug) DO NOTHING;

