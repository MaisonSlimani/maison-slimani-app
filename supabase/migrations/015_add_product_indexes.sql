-- Optimisation des requêtes produits
CREATE INDEX IF NOT EXISTS idx_produits_categorie
  ON public.produits (categorie);

CREATE INDEX IF NOT EXISTS idx_produits_vedette
  ON public.produits (vedette);

CREATE INDEX IF NOT EXISTS idx_produits_date_ajout
  ON public.produits (date_ajout DESC);

CREATE INDEX IF NOT EXISTS idx_produits_prix
  ON public.produits (prix);

