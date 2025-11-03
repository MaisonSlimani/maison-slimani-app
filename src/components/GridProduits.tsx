import { motion } from 'framer-motion';
import CarteProduit from './CarteProduit';
import produitMocassin from '@/assets/produit-mocassin.jpg';
import produitRichelieu from '@/assets/produit-richelieu.jpg';
import produitBoots from '@/assets/produit-boots.jpg';

interface GridProduitsProps {
  filtreTaille: string;
  triPrix: string;
}

const GridProduits = ({ filtreTaille, triPrix }: GridProduitsProps) => {
  // Données de démonstration
  const produits = [
    {
      id: '1',
      nom: 'Mocassin Cuir Cognac',
      slug: 'mocassin-cuir-cognac',
      prix: 1890,
      image: produitMocassin,
      taillesDisponibles: ['40', '41', '42', '43', '44'],
      matiere: 'Cuir pleine fleur',
    },
    {
      id: '2',
      nom: 'Richelieu Cuir Marron',
      slug: 'richelieu-cuir-marron',
      prix: 2190,
      image: produitRichelieu,
      taillesDisponibles: ['39', '40', '41', '42', '43', '44', '45'],
      matiere: 'Cuir box',
    },
    {
      id: '3',
      nom: 'Boots Daim Sable',
      slug: 'boots-daim-sable',
      prix: 2490,
      image: produitBoots,
      taillesDisponibles: ['40', '41', '42', '43', '44'],
      matiere: 'Daim',
    },
    {
      id: '4',
      nom: 'Mocassin Cuir Cognac',
      slug: 'mocassin-cuir-cognac-2',
      prix: 1890,
      image: produitMocassin,
      taillesDisponibles: ['40', '41', '42', '43'],
      matiere: 'Cuir pleine fleur',
    },
  ];

  // Filtrage simple côté client
  const produitsFiltres = produits.filter((produit) => {
    if (filtreTaille === 'tous') return true;
    return produit.taillesDisponibles.includes(filtreTaille);
  });

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      {produitsFiltres.map((produit, index) => (
        <motion.div
          key={produit.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <CarteProduit produit={produit} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default GridProduits;
