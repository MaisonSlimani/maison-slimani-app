'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@maison/shared'

interface ImageItem {
  url: string
}

interface ThumbnailListProps {
  images: ImageItem[]
  currentIndex: number
  setIndex: (idx: number) => void
  _colorContext: string | null
}

export const ThumbnailList = ({ images, currentIndex, setIndex, _colorContext }: ThumbnailListProps) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {images.map((img, index) => (
        <button
          key={index}
          onClick={() => setIndex(index)}
          className={cn(
            'relative aspect-square overflow-hidden rounded-lg border-2 transition-all',
            currentIndex === index ? 'border-dore ring-2 ring-dore/20' : 'border-transparent hover:border-gray-400'
          )}
        >
          <Image
            src={img.url}
            alt={`Miniature ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 25vw, 100px"
          />
        </button>
      ))}
    </div>
  )
}
