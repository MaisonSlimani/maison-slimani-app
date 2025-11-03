import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EnteteMobile = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-serif tracking-tight">
            Maison <span className="text-primary">Slimani</span>
          </h1>
        </Link>

        <Button variant="ghost" size="icon" asChild>
          <Link to="/panier">
            <ShoppingBag className="w-5 h-5" />
            <span className="sr-only">Panier</span>
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default EnteteMobile;
