import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@maison/ui'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import { AdminLayout } from '@/components/layout/AdminLayout'
import ProductsPage from '@/pages/admin/ProductsPage'
import CategoriesPage from '@/pages/admin/CategoriesPage'
import CommandesPage from '@/pages/admin/CommandesPage'
import CommandesStatutPage from '@/pages/admin/CommandesStatutPage'
import SocialsPage from '@/pages/admin/SocialsPage'
import SettingsPage from '@/pages/admin/SettingsPage'
import CategoryProductsPage from '@/pages/admin/CategoryProductsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const withLayout = (component: React.ReactNode) => (
  <AdminLayout>{component}</AdminLayout>
)

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={withLayout(<DashboardPage />)} />
            <Route path="/produits" element={withLayout(<ProductsPage />)} />
            <Route path="/produits/:categorySlug" element={withLayout(<CategoryProductsPage />)} />
            <Route path="/categories" element={withLayout(<CategoriesPage />)} />
            <Route path="/commandes" element={withLayout(<CommandesPage />)} />
            <Route path="/commandes/:statut" element={withLayout(<CommandesStatutPage />)} />
            <Route path="/socials" element={withLayout(<SocialsPage />)} />
            <Route path="/settings" element={withLayout(<SettingsPage />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  )
}

export default App
