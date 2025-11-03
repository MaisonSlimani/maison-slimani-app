'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface CarteCategorieProps {
  titre: string
  tagline: string
  image: string
  lien: string
}

const CarteCategorie = ({ titre, tagline, image, lien }: CarteCategorieProps) => {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Link href={lien}>
        <div className="aspect-[4/3] overflow-hidden relative">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Image
              src={image}
              alt={titre}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
        </div>
        
        {/* Overlay dégradé sombre pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-charbon via-charbon/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-[#f8f5f0] drop-shadow-lg">
          <h3 className="text-2xl font-serif mb-2">{titre}</h3>
          <p className="text-sm text-[#f8f5f0]/90 mb-4">{tagline}</p>
          <Button 
            variant="outline" 
            size="sm"
            className="border-dore text-dore hover:bg-dore hover:text-charbon bg-transparent"
          >
            Voir la collection
          </Button>
        </div>
      </Link>
    </motion.div>
  )
}

export default CarteCategorie

