import { useState } from 'react';
import { motion } from 'framer-motion';
import EnteteMobile from '@/components/EnteteMobile';
import MenuBasNavigation from '@/components/MenuBasNavigation';
import GridProduits from '@/components/GridProduits';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Produits = () => {
  const [filtreTaille, setFiltreTaille] = useState<string>('tous');
  const [triPrix, setTriPrix] = useState<string>('pertinence');

  return (
    <div className="min-h-screen pb-24">
      <EnteteMobile />

      <div className="container px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-serif mb-2">Notre Collection</h1>
          <p className="text-muted-foreground mb-8">
            Découvrez nos modèles de chaussures homme haut de gamme
          </p>

          {/* Filtres */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Select value={filtreTaille} onValueChange={setFiltreTaille}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Toutes les tailles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes les tailles</SelectItem>
                <SelectItem value="39">39</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="41">41</SelectItem>
                <SelectItem value="42">42</SelectItem>
                <SelectItem value="43">43</SelectItem>
                <SelectItem value="44">44</SelectItem>
                <SelectItem value="45">45</SelectItem>
              </SelectContent>
            </Select>

            <Select value={triPrix} onValueChange={setTriPrix}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pertinence">Pertinence</SelectItem>
                <SelectItem value="prix-asc">Prix croissant</SelectItem>
                <SelectItem value="prix-desc">Prix décroissant</SelectItem>
                <SelectItem value="nouveaute">Nouveautés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <GridProduits filtreTaille={filtreTaille} triPrix={triPrix} />
        </motion.div>
      </div>

      <MenuBasNavigation />
    </div>
  );
};

export default Produits;
