import { Category } from '@maison/domain'
import MobileBoutiqueView from '@/components/boutique/MobileBoutiqueView'
import DesktopBoutiqueView from '@/components/boutique/DesktopBoutiqueView'

/**
 * Unified Boutique Page
 * 
 * This component preserves the "worked hard on" PWA design for mobile
 * while keeping the luxury desktop design, merged into a single responsive flow.
 */
export default function BoutiquePage({ initialCategories }: { initialCategories?: Category[] }) {
  return (
    <main className="min-h-screen">
      {/* Mobile View - PWA Design preserved */}
      <div className="block md:hidden">
        <MobileBoutiqueView initialCategories={initialCategories} />
      </div>

      {/* Desktop View - Standard Design */}
      <div className="hidden md:block">
        <DesktopBoutiqueView initialCategories={initialCategories} />
      </div>
    </main>
  )
}
