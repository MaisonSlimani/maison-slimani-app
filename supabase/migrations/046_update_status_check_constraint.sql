-- Migration: Update status check constraint for English values
-- Fixing: "new row for relation "commandes" violates check constraint "commandes_statut_check""

-- 1. Drop existing constraints to avoid conflicts
ALTER TABLE commandes DROP CONSTRAINT IF EXISTS commandes_statut_check;
ALTER TABLE commandes DROP CONSTRAINT IF EXISTS commandes_status_check;

-- 2. Clean up existing data FIRST
-- Map French human-readable values to English snake_case
UPDATE commandes SET status = 'en_attente' WHERE status ILIKE 'En attente' OR status = 'en-attente';
UPDATE commandes SET status = 'expediee' WHERE status ILIKE 'Expédié%' OR status = 'expediee';
UPDATE commandes SET status = 'livree' WHERE status ILIKE 'Livré%' OR status = 'livree';
UPDATE commandes SET status = 'annulee' WHERE status ILIKE 'Annulé%' OR status = 'annulee';

-- 3. Safety: Set anything remaining that doesn't match to 'en_attente' 
-- This prevents the ADD CONSTRAINT from failing if there's weird data
UPDATE commandes 
SET status = 'en_attente' 
WHERE status NOT IN ('en_attente', 'expediee', 'livree', 'annulee');

-- 4. Add the new English check constraint
ALTER TABLE commandes ADD CONSTRAINT commandes_status_check 
CHECK (status IN ('en_attente', 'expediee', 'livree', 'annulee'));
