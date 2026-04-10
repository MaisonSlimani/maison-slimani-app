import { Link } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Settings, LogOut,
  ChevronDown, ChevronRight, AlertCircle, Truck, CheckCircle,
  XCircle, Share2,
  LucideIcon
} from 'lucide-react'
import { Button } from '@maison/ui'
import { cn } from '@maison/shared'
import { Category } from '@maison/domain'

interface OrderCounts {
  enAttente: number
  expediee: number
  livree: number
  annulee: number
}

interface SidebarProps {
  pathname: string
  counts: OrderCounts
  categories: Category[]
  loadingCategories: boolean
  onLogout: () => void
}

export function AdminSidebar({ pathname, counts, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shadow-lg h-full">
      <div className="p-6 border-b border-border flex-shrink-0">
        <h1 className="text-2xl font-serif">Maison <span className="text-dore">Slimani</span></h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <SidebarLink to="/" icon={LayoutDashboard} label="Tableau de bord" active={pathname === '/'} />
        <SidebarLink to="/socials" icon={Share2} label="Socials" active={pathname === '/socials'} />
        
        {/* Commandes Section */}
        <div className="space-y-1">
          <SidebarNavButton icon={ShoppingBag} label="Commandes" active={pathname.startsWith('/commandes')} expanded={true} onClick={() => {}} />
          <div className="pl-4 space-y-1 pt-2">
            <SidebarBadgeLink to="/commandes/en-attente" icon={AlertCircle} label="En attente" count={counts.enAttente} active={pathname === '/commandes/en-attente'} />
            <SidebarBadgeLink to="/commandes/expediee" icon={Truck} label="Expédiée" count={counts.expediee} active={pathname === '/commandes/expediee'} />
            <SidebarBadgeLink to="/commandes/livree" icon={CheckCircle} label="Livrée" count={counts.livree} active={pathname === '/commandes/livree'} />
            <SidebarBadgeLink to="/commandes/annulee" icon={XCircle} label="Annulée" count={counts.annulee} active={pathname === '/commandes/annulee'} />
          </div>
        </div>

        {/* Produits Section (Direct link for now as categories sub-menu is handled in ProductsPage) */}
        <SidebarLink to="/produits" icon={ShoppingBag} label="Produits" active={pathname === '/produits'} />
        <SidebarLink to="/categories" icon={Settings} label="Catégories" active={pathname === '/categories'} />
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <SidebarLink to="/settings" icon={Settings} label="Paramètres" active={pathname === '/settings'} />
        <Button variant="ghost" onClick={onLogout} className="w-full justify-start text-foreground/80">
          <LogOut className="w-5 h-5 mr-3" /> Déconnexion
        </Button>
      </div>
    </aside>
  )
}

interface NavLinkProps {
  to: string
  icon: LucideIcon
  label: string
  active: boolean
}

function SidebarLink({ to, icon: Icon, label, active }: NavLinkProps) {
  return (
    <Link to={to} className={cn('flex items-center gap-3 px-4 py-3 rounded-lg transition-colors', active ? 'bg-dore/20 text-dore border border-dore/30' : 'text-foreground/80 hover:bg-accent/50')}>
      <Icon className="w-5 h-5" /> <span>{label}</span>
    </Link>
  )
}

interface NavButtonProps {
  icon: LucideIcon
  label: string
  active: boolean
  expanded: boolean
  onClick: () => void
}

function SidebarNavButton({ icon: Icon, label, active, expanded, onClick }: NavButtonProps) {
  return (
    <button onClick={onClick} className={cn('w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg', active ? 'bg-dore/20 text-dore' : 'text-foreground/80')}>
      <div className="flex items-center gap-3"><Icon className="w-5 h-5" /> <span>{label}</span></div>
      {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
    </button>
  )
}

interface BadgeLinkProps extends NavLinkProps {
  count: number
}

function SidebarBadgeLink({ to, icon: Icon, label, count, active }: BadgeLinkProps) {
  return (
    <Link to={to} className={cn('flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors', active ? 'bg-dore/10 text-dore font-medium' : 'text-foreground/70 hover:text-foreground')}>
      <div className="flex items-center gap-3"><Icon className="w-4 h-4" /> <span>{label}</span></div>
      {count > 0 && <span className="bg-dore/10 text-dore px-2 py-0.5 rounded-full text-xs">{count}</span>}
    </Link>
  )
}
