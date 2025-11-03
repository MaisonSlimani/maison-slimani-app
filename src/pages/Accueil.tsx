import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-chaussures.jpg';
import lookbookImage from '@/assets/lookbook-1.jpg';
import EnteteMobile from '@/components/EnteteMobile';
import MenuBasNavigation from '@/components/MenuBasNavigation';
import { Truck, RefreshCcw } from 'lucide-react';

const Accueil = () => {
  return (
    <div className="min-h-screen">
      <EnteteMobile />

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-end overflow-hidden">
        <motion.img
          src={heroImage}
          alt="Chaussures luxe Maison Slimani"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charbon/80 via-charbon/20 to-transparent" />
        
        <motion.div
          className="relative z-10 container pb-16 px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-serif text-ecru mb-4 text-balance">
            L'excellence du cuir marocain
          </h1>
          <p className="text-lg md:text-xl text-ecru/90 mb-8 max-w-md">
            Chaussures homme haut de gamme, confectionnées avec passion
          </p>
          <Button asChild size="lg" className="bg-dore text-charbon hover:bg-dore/90 font-medium">
            <Link to="/produits">Découvrir la collection</Link>
          </Button>
        </motion.div>
      </section>

      {/* Bandeau Livraison */}
      <section className="bg-primary text-primary-foreground py-4">
        <div className="container px-6 flex items-center justify-center gap-8 flex-wrap text-sm md:text-base">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <span>Livraison gratuite sur tout le Maroc</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5" />
            <span>Retour sous 7 jours</span>
          </div>
        </div>
      </section>

      {/* Lookbook Section */}
      <section className="py-20 px-6">
        <motion.div
          className="container max-w-6xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Un savoir-faire ancestral
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Maison Slimani perpétue l'excellence de l'artisanat marocain. 
                Chaque paire est confectionnée à la main par nos maîtres artisans, 
                dans le respect des traditions séculaires du travail du cuir.
              </p>
              <Button asChild variant="outline" size="lg">
                <Link to="/notre-maison">Notre histoire</Link>
              </Button>
            </div>
            <motion.div
              className="order-1 md:order-2 overflow-hidden rounded-lg shadow-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={lookbookImage}
                alt="Lookbook Maison Slimani"
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      <MenuBasNavigation />
    </div>
  );
};

export default Accueil;
