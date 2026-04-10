import { FAQItem, SiteSettings, FilterState } from './index'
import { Product, CartItem } from '@maison/domain'

/**
 * Mapped category item shape used by view components.
 * Derived from Category domain model by useHomeData.
 */
export interface CategoryCardItem {
  titre: string
  tagline: string
  image: string
  lien: string
}

/**
 * Data shape passed from HomeClient to DesktopHomeView / MobileHomeView.
 */
export interface HomeViewData {
  categories: CategoryCardItem[]
  loadingCategories: boolean
  produitsVedette: Product[]
  loadingVedette: boolean
  whatsappNumber: string | null
  categorySlugMap: Record<string, string>
}

/**
 * Data shape passed to ProductDetail view components.
 */
export interface ProductViewData {
  produit: Product & { categorySlug?: string }
  categorySlugMap?: Record<string, string>
}

/**
 * Data shape for Favoris View.
 */
export interface FavorisViewData {
  items: CartItem[];
  removeItem: (id: string) => void;
  isInCart: (id: string) => boolean;
  handleAddToCart: (item: CartItem) => void;
  loadingProduct: boolean;
}

/**
 * Data shape for FAQ View.
 */
export interface FAQViewData {
  settings: SiteSettings;
  faqs: FAQItem[];
  loading: boolean;
}

/**
 * Data shape for Contact View.
 */
export interface ContactViewData {
  settings: SiteSettings;
  loading: boolean;
}

import { LucideIcon } from 'lucide-react'

/**
 * Navigation state hook return type.
 */
export interface NavigationState {
  pathname: string;
  scrolled: boolean;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
  cartCount: number;
  wishlistCount: number;
  isHomePage: boolean;
}

/**
 * Individual item in bottom navigation.
 */
export interface BottomNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  isCenter?: boolean;
  badge?: number;
}

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

/**
 * Bottom navigation hook return type.
 */
export interface BottomNavState {
  pathname: string | null;
  navItems: BottomNavItem[];
  activeIndex: number;
  indicatorLeft: number | null;
  iconRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  isRouteActive: (href: string, currentPath: string | null) => boolean;
}

/**
 * Boutique view data shape.
 */
export interface BoutiqueViewData {
  produits: Product[];
  loadingProducts: boolean;
  categories: { nom: string; slug: string }[];
  categoriesWithImages: CategoryCardItem[];
  loadingCategories: boolean;
}

/**
 * Boutique Header props.
 */
export interface BoutiqueHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onFocus: () => void;
  categorie: string;
  categories: { nom: string; slug: string }[];
  router: AppRouterInstance;
}

/**
 * Category view data shape.
 */
export interface CategoryViewData {
  categorieInfo: {
    nom: string;
    description: string | null;
    image: string;
  } | null;
  loadingCategory: boolean;
  produits: Product[];
  produitsLoading: boolean;
  triPrix: string;
  setTriPrix: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  pagination?: {
    total: number;
    count: number;
    page: number;
    totalPages: number;
  };
}
