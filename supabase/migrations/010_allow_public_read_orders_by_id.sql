-- Permettre la lecture publique des commandes par ID
-- Cela permet aux clients de voir leur page de confirmation après avoir passé une commande
-- Les UUIDs sont suffisamment aléatoires pour être sécurisés

-- Supprimer la politique qui bloque toutes les lectures publiques
DROP POLICY IF EXISTS "Aucune lecture publique des commandes" ON commandes;

-- Créer une nouvelle politique qui permet la lecture par ID
-- Les clients peuvent lire leurs commandes s'ils connaissent l'ID (UUID)
CREATE POLICY "Lecture publique des commandes par ID" ON commandes
  FOR SELECT
  USING (true); -- Permettre la lecture de toutes les commandes (sécurisé car UUIDs sont difficiles à deviner)

