-- 01_initial_schema.sql: Core Monorepo Baseline
-- Definitive English columns, original French table names.

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('en_attente', 'confirmee', 'expediee', 'livree', 'annulee');
    END IF;
END $$;

-- 1. ADMISSION & SETTINGS
CREATE TABLE IF NOT EXISTS admins (
    email TEXT PRIMARY KEY,
    hash_mdp TEXT NOT NULL,
    role TEXT DEFAULT 'admin'
);

-- BOOTSTRAP: Default Admin (admin@admin.com / password)
-- In production, replace with real hash.
INSERT INTO admins (email, hash_mdp, role)
VALUES ('admin@admin.com', '$2b$10$6p2.vCj3qP0w/XfO/qKqO.L7Xv8C7m6Y6L6v6F6X6v6L6v6F6X6v6', 'superadmin')
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    description TEXT,
    logo_url TEXT,
    contact_email TEXT,
    facebook TEXT,
    instagram TEXT,
    meta_pixel_code TEXT,
    gtm_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    color TEXT DEFAULT '#000000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRODUITS (English Columns & JSONB Weights)
CREATE TABLE IF NOT EXISTS produits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    stock INTEGER DEFAULT 0,
    total_stock INTEGER DEFAULT 0,
    category TEXT REFERENCES categories(name) ON UPDATE CASCADE,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT false,
    has_colors BOOLEAN DEFAULT false,
    colors JSONB DEFAULT '[]'::jsonb, -- [{name, code, stock, images: [], sizes: [{name, stock}]}]
    sizes JSONB DEFAULT '[]'::jsonb,  -- [{name, stock}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    upsell_products UUID[] DEFAULT '{}',
    rating NUMERIC(2,1) DEFAULT 5.0,
    rating_count INTEGER DEFAULT 0
);

-- 4. COMMANDES
CREATE TABLE IF NOT EXISTS commandes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{id, name, price, quantity, color, size}]
    total NUMERIC(10,2) NOT NULL,
    status order_status DEFAULT 'en_attente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    idempotency_key TEXT UNIQUE,
    payment_method TEXT DEFAULT 'cash_on_delivery',
    payment_status TEXT DEFAULT 'pending'
);

-- 5. COMMENTAIRES & SOCIAL
CREATE TABLE IF NOT EXISTS commentaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES produits(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    status TEXT DEFAULT 'en_attente',
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT UNIQUE NOT NULL,
    results_count INTEGER DEFAULT 0,
    search_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription JSONB UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limits (
    ip TEXT PRIMARY KEY,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    last_request TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_produits_slug ON produits(slug);
CREATE INDEX IF NOT EXISTS idx_produits_category ON produits(category);
CREATE INDEX IF NOT EXISTS idx_commandes_status ON commandes(status);
CREATE INDEX IF NOT EXISTS idx_commentaires_product ON commentaires(product_id);

-- GIN Index for fast Trigram search on name and description
CREATE INDEX IF NOT EXISTS idx_produits_search_trgm ON produits USING gin (name gin_trgm_ops, description gin_trgm_ops);
-- 6. STORAGE SETUP (Safe initialization)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('produits', 'produits', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;
