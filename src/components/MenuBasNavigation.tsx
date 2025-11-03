import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingBag, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const MenuBasNavigation = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const items = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/produits', icon: Package, label: 'Boutique' },
    { href: '/panier', icon: ShoppingBag, label: 'Panier' },
    { href: '/contact', icon: Mail, label: 'Contact' },
  ];

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 md:hidden",
        "bg-background/80 backdrop-blur-md border-t border-border/50 shadow-lg",
        !visible && "translate-y-full"
      )}
    >
      <div className="container px-4 h-16 flex items-center justify-around">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all duration-200 min-w-[70px]',
                isActive
                  ? 'text-dore scale-105'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              )}
              onClick={() => {
                if ((window as any).playClickSound) {
                  (window as any).playClickSound();
                }
              }}
            >
              <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MenuBasNavigation;
