-- Migration initiale : Création des tables pour Maison Slimani

-- Table produits
CREATE TABLE IF NOT EXISTS produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  description TEXT NOT NULL,
  prix NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  categorie TEXT CHECK (categorie IN ('Classiques', 'Cuirs Exotiques', 'Éditions Limitées', 'Nouveautés')),
  vedette BOOLEAN DEFAULT false,
  date_ajout TIMESTAMP DEFAULT NOW()
);

-- Table commandes
CREATE TABLE IF NOT EXISTS commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_client TEXT NOT NULL,
  telephone TEXT NOT NULL,
  adresse TEXT NOT NULL,
  ville TEXT NOT NULL,
  produits JSONB NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  statut TEXT CHECK (statut IN ('En attente', 'Expédiée', 'Livrée', 'Annulée')) DEFAULT 'En attente',
  date_commande TIMESTAMP DEFAULT NOW()
);

-- Table admins
CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  hash_mdp TEXT NOT NULL,
  role TEXT DEFAULT 'super-admin'
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_produits_categorie ON produits(categorie);
CREATE INDEX IF NOT EXISTS idx_produits_vedette ON produits(vedette);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_date ON commandes(date_commande);

-- Activer Row Level Security (RLS)
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour produits (lecture publique uniquement)
CREATE POLICY "Les produits sont visibles par tous" ON produits
  FOR SELECT USING (true);

-- Politiques RLS pour commandes (lecture/écriture publique pour création, lecture admin pour gestion)
CREATE POLICY "Tout le monde peut créer une commande" ON commandes
  FOR INSERT WITH CHECK (true);

-- Politiques RLS pour admins (aucun accès public)
CREATE POLICY "Aucun accès public aux admins" ON admins
  FOR ALL USING (false);

