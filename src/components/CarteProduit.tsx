import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface Produit {
  id: string;
  nom: string;
  slug: string;
  prix: number;
  image: string;
  matiere: string;
}

interface CarteProduitProps {
  produit: Produit;
}

const CarteProduit = ({ produit }: CarteProduitProps) => {
  return (
    <Link to={`/produits/${produit.slug}`}>
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
        <motion.div
          className="aspect-square overflow-hidden bg-muted"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src={produit.image}
            alt={produit.nom}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>

        <div className="p-5">
          <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">
            {produit.nom}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">{produit.matiere}</p>
          <p className="text-xl font-serif text-primary">
            {produit.prix.toLocaleString('fr-MA')} DH
          </p>
        </div>
      </Card>
    </Link>
  );
};

export default CarteProduit;
