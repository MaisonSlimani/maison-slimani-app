import { FAQItem, SiteSettings, FilterState } from './index'
import { Product, CartItem } from '@maison/domain'
import { LucideIcon } from 'lucide-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

/**
 * Mapped category item shape used by view components.
 * Derived from Category domain model.
 */
export interface CategoryCardItem {
  title: string
  tagline: string
  image: string
  link: string
}

/**
 * Data shape passed from HomeClient to Home views.
 */
export interface HomeViewData {
  categories: CategoryCardItem[]
  loadingCategories: boolean
  featuredProducts: Product[]
  loadingFeatured: boolean
  whatsappNumber: string | null
  categorySlugMap: Record<string, string>
}

/**
 * Data shape passed to ProductDetail view components.
 */
export interface ProductViewData {
  product: Product & { categorySlug?: string }
  categorySlugMap?: Record<string, string>
}

/**
 * Data shape for Favorites View.
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
  products: Product[];
  loadingProducts: boolean;
  categories: { name: string; slug: string }[];
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
  category: string;
  categories: { name: string; slug: string }[];
  router: AppRouterInstance;
}

/**
 * Category view data shape.
 */
export interface CategoryViewData {
  categoryInfo: {
    name: string;
    description: string | null;
    image: string;
  } | null;
  loadingCategory: boolean;
  products: Product[];
  productsLoading: boolean;
  triPrice: string;
  setTriPrice: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}
