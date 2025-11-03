import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-chaussures.jpg';
import lookbookImage from '@/assets/lookbook-1.jpg';
import EnteteMobile from '@/components/EnteteMobile';
import MenuBasNavigation from '@/components/MenuBasNavigation';
import Footer from '@/components/Footer';
import CarteCategorie from '@/components/CarteCategorie';
import CarteProduit from '@/components/CarteProduit';
import SoundPlayer from '@/components/SoundPlayer';
import { Truck, RefreshCcw, Award } from 'lucide-react';
import categorieClassiques from '@/assets/categorie-classiques.jpg';
import categorieExotiques from '@/assets/categorie-exotiques.jpg';
import categorieLimitees from '@/assets/categorie-limitees.jpg';
import categorieNouveautes from '@/assets/categorie-nouveautes.jpg';
import lookbookLifestyle1 from '@/assets/lookbook-lifestyle-1.jpg';
import lookbookAtelier from '@/assets/lookbook-atelier.jpg';
import lookbookLifestyle2 from '@/assets/lookbook-lifestyle-2.jpg';
import produitMocassin from '@/assets/produit-mocassin.jpg';
import produitRichelieu from '@/assets/produit-richelieu.jpg';
import produitBoots from '@/assets/produit-boots.jpg';

const Accueil = () => {
  const categories = [
    {
      titre: 'Classiques',
      tagline: "L'essence de l'élégance quotidienne",
      image: categorieClassiques,
      lien: '/produits?categorie=classiques',
    },
    {
      titre: 'Cuirs Exotiques',
      tagline: 'Le luxe dans sa forme la plus rare',
      image: categorieExotiques,
      lien: '/produits?categorie=exotiques',
    },
    {
      titre: 'Éditions Limitées',
      tagline: 'Des pièces uniques pour les connaisseurs',
      image: categorieLimitees,
      lien: '/produits?categorie=limitees',
    },
    {
      titre: 'Nouveautés',
      tagline: 'Les dernières créations de nos ateliers',
      image: categorieNouveautes,
      lien: '/produits?categorie=nouveautes',
    },
  ];

  const produitsVedette = [
    {
      id: '1',
      nom: 'Mocassin Fès',
      slug: 'mocassin-fes',
      prix: 2800,
      image: produitMocassin,
      matiere: 'Cuir de veau premium',
    },
    {
      id: '2',
      nom: 'Richelieu Marrakech',
      slug: 'richelieu-marrakech',
      prix: 3200,
      image: produitRichelieu,
      matiere: 'Cuir italien',
    },
    {
      id: '3',
      nom: 'Boots Casablanca',
      slug: 'boots-casablanca',
      prix: 3600,
      image: produitBoots,
      matiere: 'Cuir grainé',
    },
  ];

  const lookbookImages = [
    { src: lookbookLifestyle1, caption: "L'élégance marocaine contemporaine" },
    { src: lookbookAtelier, caption: "Nos maîtres artisans au travail" },
    { src: lookbookLifestyle2, caption: 'Le souci du détail' },
  ];

  const handleButtonClick = () => {
    if ((window as any).playClickSound) {
      (window as any).playClickSound();
    }
  };

  return (
    <div className="min-h-screen">
      <SoundPlayer enabled={true} />
      <EnteteMobile />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.img
          src={heroImage}
          alt="Chaussures luxe Maison Slimani"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/50" />
        
        <motion.div
          className="relative z-10 container text-center px-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9 }}
        >
          <h1 className="text-5xl md:text-7xl font-serif text-ecru mb-6 text-balance leading-tight">
            L'excellence du cuir <span className="text-dore">marocain</span>
          </h1>
          <p className="text-xl md:text-2xl text-ecru/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Chaussures homme haut de gamme, confectionnées avec passion
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-dore text-charbon hover:bg-dore/90 font-medium text-base px-10 py-6"
            onClick={handleButtonClick}
          >
            <Link to="/produits">Découvrir la collection</Link>
          </Button>
        </motion.div>
      </section>

      {/* Nos Catégories */}
      <section className="py-20 px-6 bg-ecru">
        <div className="container max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-4 text-charbon">
              Nos Catégories
            </h2>
            <p className="text-lg text-charbon/70 max-w-2xl mx-auto">
              Découvrez nos collections exclusives, chacune incarnant l'excellence marocaine
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((categorie, index) => (
              <motion.div
                key={categorie.titre}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <CarteCategorie {...categorie} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Produits en Vedette */}
      <section className="py-20 px-6">
        <div className="container max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-4">
              Produits en Vedette
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nos créations les plus prisées, alliant tradition et modernité
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {produitsVedette.map((produit, index) => (
              <motion.div
                key={produit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  <CarteProduit produit={produit} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="border-dore text-dore hover:bg-dore hover:text-charbon"
              onClick={handleButtonClick}
            >
              <Link to="/produits">Voir toute la collection</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Notre Savoir-Faire */}
      <section className="py-20 px-6 bg-ecru">
        <motion.div
          className="container max-w-6xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl md:text-5xl font-serif mb-6 text-charbon">
                Un savoir-faire ancestral
              </h2>
              <p className="text-charbon/80 text-lg mb-6 leading-relaxed">
                Maison Slimani perpétue l'excellence de l'artisanat marocain. 
                Chaque paire est confectionnée à la main par nos maîtres artisans, 
                dans le respect des traditions séculaires du travail du cuir.
              </p>
              <p className="text-charbon/70 text-base mb-8 leading-relaxed italic">
                Du choix des peaux les plus nobles à la finition minutieuse, 
                chaque étape incarne notre passion pour l'excellence et notre attachement 
                au patrimoine marocain.
              </p>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-cuir text-cuir hover:bg-cuir hover:text-ecru"
                onClick={handleButtonClick}
              >
                <Link to="/notre-maison">Découvrir la Maison</Link>
              </Button>
            </div>
            <motion.div
              className="order-1 md:order-2 overflow-hidden rounded-lg shadow-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={lookbookImage}
                alt="Artisanat Maison Slimani"
                className="w-full h-auto"
                loading="lazy"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Lookbook / Inspiration */}
      <section className="py-20">
        <div className="container max-w-7xl px-0">
          <motion.div
            className="text-center mb-16 px-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-4">
              Inspiration
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              L'élégance marocaine contemporaine
            </p>
          </motion.div>

          <div className="space-y-0">
            {lookbookImages.map((item, index) => (
              <motion.div
                key={index}
                className="relative h-[70vh] overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1 }}
              >
                <motion.img
                  src={item.src}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charbon/80 via-charbon/30 to-transparent" />
                <motion.div
                  className="absolute bottom-12 left-0 right-0 text-center px-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <p className="text-2xl md:text-3xl font-serif text-ecru">
                    {item.caption}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bannière de Confiance */}
      <section className="bg-charbon text-dore py-8">
        <div className="container px-6">
          <div className="flex items-center justify-center gap-12 flex-wrap text-center">
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Truck className="w-8 h-8" />
              <span className="font-serif text-lg">Livraison gratuite</span>
              <span className="text-ecru/70 text-sm">Dans tout le Maroc</span>
            </motion.div>
            
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <RefreshCcw className="w-8 h-8" />
              <span className="font-serif text-lg">Retours sous 7 jours</span>
              <span className="text-ecru/70 text-sm">Satisfait ou remboursé</span>
            </motion.div>
            
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Award className="w-8 h-8" />
              <span className="font-serif text-lg">Artisanat d'exception</span>
              <span className="text-ecru/70 text-sm">Fait main au Maroc</span>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      <MenuBasNavigation />
    </div>
  );
};

export default Accueil;
