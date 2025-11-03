import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="bg-charbon text-ecru py-12 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-serif mb-4">
              Maison <span className="text-dore">Slimani</span>
            </h3>
            <p className="text-ecru/70 text-sm leading-relaxed">
              L'excellence du cuir marocain depuis trois générations
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-dore">Navigation</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-ecru/80 hover:text-dore transition-colors text-sm">
                Accueil
              </Link>
              <Link href="/boutique" className="text-ecru/80 hover:text-dore transition-colors text-sm">
                Boutique
              </Link>
              <Link href="/maison" className="text-ecru/80 hover:text-dore transition-colors text-sm">
                La Maison
              </Link>
              <Link href="/contact" className="text-ecru/80 hover:text-dore transition-colors text-sm">
                Contact
              </Link>
            </nav>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-dore">Contact</h4>
            <a 
              href="mailto:contact@maisonslimani.com" 
              className="text-ecru/80 hover:text-dore transition-colors text-sm block mb-2"
            >
              contact@maisonslimani.com
            </a>
            <p className="text-ecru/70 text-sm mb-2">
              Livraison gratuite dans tout le Maroc 🇲🇦
            </p>
            <p className="text-ecru/70 text-sm">
              Politique de retour : 7 jours
            </p>
          </div>
        </div>
        
        <div className="border-t border-ecru/20 pt-6 text-center text-ecru/60 text-xs">
          © {new Date().getFullYear()} Maison Slimani. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}

export default Footer

