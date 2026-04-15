-- Migration: Rename Core Columns from French to English (REVISED)
-- This covers products, categories, orders, and reviews

-- 1. Table: produits
ALTER TABLE produits RENAME COLUMN nom TO name;
ALTER TABLE produits RENAME COLUMN prix TO price;
ALTER TABLE produits RENAME COLUMN categorie TO category;
ALTER TABLE produits RENAME COLUMN vedette TO featured;
ALTER TABLE produits RENAME COLUMN couleurs TO colors;
ALTER TABLE produits RENAME COLUMN tailles TO sizes;
ALTER TABLE produits RENAME COLUMN taille TO size;
ALTER TABLE produits RENAME COLUMN date_ajout TO created_at;

-- 2. Table: categories
ALTER TABLE categories RENAME COLUMN nom TO name;
ALTER TABLE categories RENAME COLUMN ordre TO "order";
ALTER TABLE categories RENAME COLUMN active TO is_active;
ALTER TABLE categories RENAME COLUMN date_creation TO created_at;
ALTER TABLE categories RENAME COLUMN couleur TO color;

-- 3. Table: commandes (Orders)
ALTER TABLE commandes RENAME COLUMN nom_client TO customer_name;
ALTER TABLE commandes RENAME COLUMN telephone TO phone;
ALTER TABLE commandes RENAME COLUMN adresse TO address;
ALTER TABLE commandes RENAME COLUMN ville TO city;
ALTER TABLE commandes RENAME COLUMN statut TO status;
ALTER TABLE commandes RENAME COLUMN date_commande TO created_at;
ALTER TABLE commandes RENAME COLUMN produits TO items;

-- 4. Table: commentaires (Reviews)
ALTER TABLE commentaires RENAME COLUMN nom TO name;
ALTER TABLE commentaires RENAME COLUMN commentaire TO content;
-- created_at is already English

-- IMPORTANT: The RPC functions MUST be recreated to use these new names.
