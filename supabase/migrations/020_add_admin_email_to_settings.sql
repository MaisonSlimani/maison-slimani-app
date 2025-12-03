-- Migration : Ajout du champ admin_email à la table settings

-- Ajouter la colonne admin_email si elle n'existe pas déjà
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS admin_email TEXT;

-- Mettre à jour la valeur par défaut si elle est NULL (utiliser l'email entreprise ou une valeur par défaut)
UPDATE settings
SET admin_email = COALESCE(email_entreprise, 'admin@maison-slimani.com')
WHERE admin_email IS NULL;

-- Commentaire pour documenter
COMMENT ON COLUMN settings.admin_email IS 'Email pour recevoir les notifications de commandes et messages de contact';

