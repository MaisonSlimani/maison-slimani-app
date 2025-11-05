-- Permettre les abonnements realtime pour les INSERT events
-- Les abonnements realtime ont besoin de pouvoir "voir" les événements INSERT
-- même si RLS bloque la lecture normale

-- Note: Les abonnements realtime fonctionnent au niveau de la réplication PostgreSQL
-- et ne sont pas directement affectés par RLS, mais il est important de s'assurer
-- que la publication inclut bien les INSERT events

-- Vérifier que la table est bien dans la publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'commandes'
  ) THEN
    RAISE EXCEPTION 'La table commandes n''est pas dans la publication supabase_realtime';
  END IF;
END $$;

-- S'assurer que REPLICA IDENTITY est configuré correctement
-- Cela permet de capturer les INSERT events pour realtime
ALTER TABLE commandes REPLICA IDENTITY DEFAULT;

-- Note: Les abonnements realtime devraient maintenant recevoir tous les événements
-- (INSERT, UPDATE, DELETE) pour la table commandes

