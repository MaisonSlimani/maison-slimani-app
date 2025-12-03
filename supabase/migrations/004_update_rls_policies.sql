-- Mise à jour des politiques RLS pour permettre l'insertion de commandes depuis le client

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Tout le monde peut créer une commande" ON commandes;

-- Créer une nouvelle politique pour l'insertion (accessible publiquement)
CREATE POLICY "Insertion publique des commandes" ON commandes
  FOR INSERT
  WITH CHECK (true);

-- Politique pour la lecture des commandes (admin uniquement via service role)
-- Les utilisateurs publics ne peuvent pas lire les commandes
CREATE POLICY "Aucune lecture publique des commandes" ON commandes
  FOR SELECT
  USING (false);

-- Note: Les admins utiliseront le service role key pour lire/modifier les commandes
-- via les Edge Functions ou directement dans le dashboard admin

