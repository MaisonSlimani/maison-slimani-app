-- Fonction RPC pour décrémenter le stock

CREATE OR REPLACE FUNCTION decrementer_stock(
  produit_id UUID,
  quantite INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE produits
  SET stock = stock - quantite
  WHERE id = produit_id;
END;
$$ LANGUAGE plpgsql;

