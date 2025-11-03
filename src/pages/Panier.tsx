import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import EnteteMobile from '@/components/EnteteMobile';
import MenuBasNavigation from '@/components/MenuBasNavigation';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Panier = () => {
  const [articles, setArticles] = useState<any[]>([]);

  const supprimerArticle = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id));
  };

  const total = articles.reduce((acc, article) => acc + article.prix * article.quantite, 0);

  return (
    <div className="min-h-screen pb-24">
      <EnteteMobile />

      <div className="container px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-serif mb-8 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            Mon Panier
          </h1>

          {articles.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mb-6">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-serif mb-4">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-8">
                Découvrez notre collection de chaussures haut de gamme
              </p>
              <Button asChild size="lg">
                <Link to="/produits">Voir la collection</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => (
                <Card key={article.id} className="p-6">
                  <div className="flex gap-6">
                    <img
                      src={article.image}
                      alt={article.nom}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">{article.nom}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Taille: {article.taille}
                      </p>
                      <p className="font-medium text-primary">
                        {article.prix.toLocaleString('fr-MA')} DH
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => supprimerArticle(article.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              ))}

              <Card className="p-6 bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-2xl font-serif">{total.toLocaleString('fr-MA')} DH</span>
                </div>
                <Button size="lg" className="w-full">
                  Commander (paiement à la livraison)
                </Button>
              </Card>
            </div>
          )}
        </motion.div>
      </div>

      <MenuBasNavigation />
    </div>
  );
};

export default Panier;
