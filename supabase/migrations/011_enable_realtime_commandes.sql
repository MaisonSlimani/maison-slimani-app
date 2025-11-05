-- Activer la réplication en temps réel pour la table commandes
-- Cela permet aux abonnements Supabase realtime de fonctionner

-- Vérifier et activer la publication
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
  END IF;
END $$;

-- Ajouter la table commandes à la publication realtime
-- Note: On utilise une transaction pour éviter les erreurs si la table est déjà dans la publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'commandes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE commandes;
  END IF;
END $$;

-- Définir REPLICA IDENTITY pour permettre la capture des INSERT events
-- Avec une clé primaire, on utilise DEFAULT (qui utilise la clé primaire)
-- Mais on devons nous assurer que les INSERT events sont capturés
ALTER TABLE commandes REPLICA IDENTITY DEFAULT;

-- Note: REPLICA IDENTITY DEFAULT utilise la clé primaire (id UUID)
-- Cela permet à realtime de capturer INSERT, UPDATE, et DELETE events
-- La réplication devrait maintenant fonctionner pour tous les événements

