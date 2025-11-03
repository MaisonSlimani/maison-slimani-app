'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface Produit {
  id: string
  nom: string
  slug?: string
  prix: number
  image: string
  matiere?: string
  image_url?: string
}

interface CarteProduitProps {
  produit: Produit
}

const CarteProduit = ({ produit }: CarteProduitProps) => {
  const imageUrl = produit.image_url || produit.image
  const href = `/produit/${produit.id}`

  return (
    <Link href={href}>
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
        <motion.div
          className="aspect-square overflow-hidden bg-muted relative"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        >
          <Image
            src={imageUrl}
            alt={produit.nom}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>

        <div className="p-5">
          <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">
            {produit.nom}
          </h3>
          {produit.matiere && (
            <p className="text-sm text-muted-foreground mb-3">{produit.matiere}</p>
          )}
          <p className="text-xl font-serif text-primary">
            {produit.prix.toLocaleString('fr-MA')} DH
          </p>
        </div>
      </Card>
    </Link>
  )
}

export default CarteProduit

