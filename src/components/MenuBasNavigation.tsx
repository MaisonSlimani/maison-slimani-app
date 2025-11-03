import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MenuBasNavigation = () => {
  const location = useLocation();

  const items = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/produits', icon: Package, label: 'Produits' },
    { href: '/panier', icon: ShoppingBag, label: 'Panier' },
    { href: '/notre-maison', icon: User, label: 'Maison' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-2xl">
      <div className="container px-4 h-16 flex items-center justify-around">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors min-w-[70px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MenuBasNavigation;
