-- Migration : Création de la table settings pour gérer les paramètres du site

-- Table settings (une seule ligne pour stocker tous les paramètres)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_entreprise TEXT,
  telephone TEXT,
  adresse TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insérer une ligne par défaut
INSERT INTO settings (id, email_entreprise, telephone, adresse, description)
VALUES (
  gen_random_uuid(),
  'contact@maisonslimani.com',
  '+212 5XX-XXXXXX',
  'Casablanca, Maroc',
  ''
)
ON CONFLICT DO NOTHING;

-- Activer Row Level Security (RLS)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Les settings sont visibles par tous (lecture publique)
CREATE POLICY "Les settings sont visibles par tous" ON settings
  FOR SELECT USING (true);

-- Politique RLS : Seuls les admins peuvent modifier (via service role key)
-- La modification se fera via l'API avec vérification de session admin

