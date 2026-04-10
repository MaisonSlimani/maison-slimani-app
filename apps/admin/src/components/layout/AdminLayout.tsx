import { type ReactNode } from 'react'
import { LuxuryLoading } from '@maison/ui'
import { useAdminLayout } from '@/hooks/admin/useAdminLayout'
import { AdminSidebar } from './AdminSidebar'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { 
    pathname, 
    loading, 
    counts, 
    categories, 
    loadingCategories, 
    handleLogout 
  } = useAdminLayout()

  if (loading) {
    return <LuxuryLoading fullScreen message="Chargement de l'application..." />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar 
          pathname={pathname}
          counts={counts}
          categories={categories}
          loadingCategories={loadingCategories}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto bg-background admin-scroll">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
