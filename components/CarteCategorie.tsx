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
  priority?: boolean
}

const CarteCategorie = ({ titre, tagline, image, lien, priority = false }: CarteCategorieProps) => {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Link href={lien}>
        <div className="aspect-[4/3] overflow-hidden relative w-full">
          <motion.div
            className="absolute inset-0 w-full h-full"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Image
              src={image}
              alt={titre}
              fill
              className="object-cover w-full h-full"
              loading={priority ? undefined : "lazy"}
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 32vw, 21vw"
            />
          </motion.div>
        
        {/* Overlay dégradé sombre pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-charbon via-charbon/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        
          {/* Only category name inside image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-[#f8f5f0] drop-shadow-lg">
            <h3 className="text-2xl font-serif">{titre}</h3>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default CarteCategorie

