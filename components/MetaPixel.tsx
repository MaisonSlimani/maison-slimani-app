'use client'

import { useEffect, useState } from 'react'

export default function MetaPixel() {
  const [pixelCode, setPixelCode] = useState<string | null>(null)

  useEffect(() => {
    const fetchPixelCode = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.meta_pixel_code) {
            setPixelCode(result.data.meta_pixel_code)
          }
        }
      } catch (error) {
        console.error('Error fetching Meta Pixel code:', error)
      }
    }
    fetchPixelCode()
  }, [])

  if (!pixelCode) return null

  return <div dangerouslySetInnerHTML={{ __html: pixelCode }} />
}

