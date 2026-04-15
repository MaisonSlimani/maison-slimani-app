import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Menu, X, FolderTree, LucideIcon } from 'lucide-react'
import { Button } from '@maison/ui'
import { cn } from '@maison/shared'
import { supabase } from '@/lib/repositories'

interface MenuItem { to: string; label: string; icon: LucideIcon }
const MENU_ITEMS: MenuItem[] = [
  { to: '/pwa', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pwa/commandes', label: 'Commandes', icon: ShoppingBag },
  { to: '/pwa/produits', label: 'Produits', icon: Package },
  { to: '/pwa/categories', label: 'Catégories', icon: FolderTree },
  { to: '/pwa/settings', label: 'Paramètres', icon: Settings },
]

function NavLink({ item, isActive, onClick }: { item: MenuItem; isActive: boolean; onClick: () => void }) {
  const Icon = item.icon
  return (
    <Link to={item.to} onClick={onClick} className={cn('flex items-center gap-3 px-4 py-3 rounded-lg transition-colors', isActive ? 'bg-dore/20 text-dore border border-dore/30' : 'hover:bg-accent/50')}>
      <Icon className="w-5 h-5" /><span>{item.label}</span>
    </Link>
  )
}

export default function DrawerNav() {
  const [isOpen, setIsOpen] = useState(false); const { pathname } = useLocation(); const navigate = useNavigate()
  const handleLogout = async () => { try { await supabase.auth.signOut(); navigate('/login') } catch (e) { console.error(e) } }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed top-4 left-4 z-50 p-2 bg-card border rounded-lg shadow-lg"><Menu className="w-6 h-6" /></button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/50 z-40" />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} className="fixed top-0 left-0 bottom-0 w-64 bg-card border-r z-50 shadow-xl">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b flex items-center justify-between"><h1 className="text-xl font-serif">Maison <span className="text-dore">Slimani</span></h1>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8"><X className="h-4 h-4" /></Button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {MENU_ITEMS.map(item => <NavLink key={item.to} item={item} isActive={pathname === item.to} onClick={() => setIsOpen(false)} />)}
                </nav>
                <div className="p-4 border-t"><Button variant="ghost" onClick={handleLogout} className="w-full justify-start"><LogOut className="w-5 h-5 mr-3" />Déconnexion</Button></div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
