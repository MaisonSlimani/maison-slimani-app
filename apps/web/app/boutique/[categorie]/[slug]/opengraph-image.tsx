import { ImageResponse } from 'next/og'
import { fetchProductByPath } from '../../../data/fetchProduct'

export const runtime = 'nodejs'

export const alt = 'Vente de chaussures de luxe | Maison Slimani'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

function DecorativeBorder() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
        border: '1px solid #D4AF37',
        opacity: 0.3,
      }}
    />
  )
}

function ProductInfo({ name, price }: { name: string; price: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingRight: '40px',
      }}
    >
      <div style={{ fontSize: 24, color: '#D4AF37', letterSpacing: '0.2em', marginBottom: '10px', textTransform: 'uppercase' }}>
        Maison Slimani
      </div>
      <div style={{ fontSize: 64, fontWeight: 'bold', lineHeight: 1.1, marginBottom: '20px', maxWidth: '600px' }}>
        {name}
      </div>
      <div style={{ fontSize: 32, color: '#fff', backgroundColor: '#D4AF37', padding: '10px 20px', width: 'fit-content', fontWeight: 'bold', borderRadius: '4px' }}>
        {price}
      </div>
      <div style={{ marginTop: '40px', fontSize: 20, color: '#888' }}>
        Artisanat de luxe • Livraison offerte • Fait main
      </div>
    </div>
  )
}

function ProductImage({ src, altText }: { src: string; altText: string }) {
  return (
    <div
      style={{
        width: '500px',
        height: '500px',
        display: 'flex',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        border: '1px solid #333',
      }}
    >
      <img
        src={src}
        alt={altText}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  )
}

export default async function Image({ params }: { params: Promise<{ categorie: string; slug: string }> }) {
  const { categorie, slug } = await params
  const product = await fetchProductByPath(categorie, slug)

  if (!product) return new Response('Not Found', { status: 404 })

  const mainImage = product.image_url || (product.images && product.images.length > 0 ? product.images[0] : null)
  const priceLabel = product.price ? `${product.price} MAD` : ''

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          backgroundImage: 'linear-gradient(to bottom right, #1a1a1a, #000)',
          fontFamily: 'sans-serif',
          color: '#fff',
          padding: '40px',
          position: 'relative',
        }}
      >
        <DecorativeBorder />
        <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center' }}>
          <ProductInfo name={product.name} price={priceLabel} />
          {mainImage && <ProductImage src={mainImage} altText={product.name} />}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
