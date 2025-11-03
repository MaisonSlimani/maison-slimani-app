import { motion } from 'framer-motion';
import EnteteMobile from '@/components/EnteteMobile';
import MenuBasNavigation from '@/components/MenuBasNavigation';
import lookbookImage from '@/assets/lookbook-1.jpg';

const NotreMaison = () => {
  return (
    <div className="min-h-screen pb-24">
      <EnteteMobile />

      <div className="container px-6 py-12 max-w-4xl">
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <header>
            <h1 className="text-4xl md:text-5xl font-serif mb-6">Notre Maison</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              L'histoire d'une passion transmise de génération en génération
            </p>
          </header>

          <img
            src={lookbookImage}
            alt="Artisans Maison Slimani"
            className="w-full rounded-lg shadow-2xl"
          />

          <section className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-serif mb-4">Un héritage artisanal</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Fondée au cœur de Casablanca, Maison Slimani perpétue l'excellence 
              de l'artisanat marocain du cuir. Nos maîtres artisans, formés selon 
              les techniques ancestrales, confectionnent chaque paire avec une 
              attention méticuleuse aux détails.
            </p>

            <h2 className="text-3xl font-serif mb-4 mt-12">Notre engagement qualité</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Nous sélectionnons rigoureusement les meilleurs cuirs, tannés de 
              manière traditionnelle. Chaque modèle est le fruit d'heures de travail 
              manuel, garantissant une durabilité et un confort exceptionnels.
            </p>

            <h2 className="text-3xl font-serif mb-4 mt-12">Made in Morocco</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Fièrement marocaine, Maison Slimani contribue à la préservation d'un 
              savoir-faire unique. Nous sommes engagés dans une démarche durable, 
              respectueuse de nos artisans et de l'environnement.
            </p>
          </section>
        </motion.article>
      </div>

      <MenuBasNavigation />
    </div>
  );
};

export default NotreMaison;
