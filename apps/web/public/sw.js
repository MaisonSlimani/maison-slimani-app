const CACHE_NAME = 'maison-slimani-v1'
const RUNTIME_CACHE = 'maison-slimani-runtime-v1'

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/pwa',
  '/pwa/boutique',
  '/pwa/panier',
  '/pwa/contact',
]

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Skip API routes (always fetch fresh)
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Skip admin routes
  if (url.pathname.startsWith('/admin')) {
    return
  }

  // Strategy: Network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache GET requests (POST, PUT, DELETE, etc. cannot be cached)
        if (request.method === 'GET' && response.status === 200) {
          // Clone the response
          const responseToCache = response.clone()

          // Cache successful responses
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })
        }

        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          // Fallback to offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/pwa')
          }

          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          })
        })
      })
  )
})

// Background sync for orders (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders())
  }
})

async function syncOrders() {
  // Implement order sync logic here
  console.log('Syncing orders...')
}

