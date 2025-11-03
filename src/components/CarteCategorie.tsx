import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CarteCategorieProps {
  titre: string;
  tagline: string;
  image: string;
  lien: string;
}

const CarteCategorie = ({ titre, tagline, image, lien }: CarteCategorieProps) => {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Link to={lien}>
        <div className="aspect-[4/3] overflow-hidden">
          <motion.img
            src={image}
            alt={titre}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            loading="lazy"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-charbon via-charbon/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-ecru">
          <h3 className="text-2xl font-serif mb-2">{titre}</h3>
          <p className="text-sm text-ecru/80 mb-4">{tagline}</p>
          <Button 
            variant="outline" 
            size="sm"
            className="border-dore text-dore hover:bg-dore hover:text-charbon"
          >
            Voir la collection
          </Button>
        </div>
      </Link>
    </motion.div>
  );
};

export default CarteCategorie;
