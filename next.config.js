/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // Permettre les images locales non optimisées si nécessaire
    unoptimized: false,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Assurer que les assets statiques sont correctement servis
  trailingSlash: false,
  // Ignorer les fichiers Supabase Edge Functions (Deno) - déjà exclus dans tsconfig.json
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

export default nextConfig
