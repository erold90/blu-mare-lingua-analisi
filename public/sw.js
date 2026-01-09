// Service Worker per Villa MareBlu
// Versione cache - aggiorna per invalidare cache
const CACHE_VERSION = 'v1.0.1';
const CACHE_NAME = `villa-mareblu-${CACHE_VERSION}`;

// Assets da pre-cacheare (shell dell'app)
const PRECACHE_ASSETS = [
  '/',
  '/index.html'
];

// Strategia: Cache First per assets statici
const CACHE_FIRST_PATTERNS = [
  /\.(?:js|css|woff2?|ttf|otf|eot)$/,
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/
];

// Strategia: Network First per API e contenuti dinamici
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /supabase\.co/,
  /imagekit\.io/
];

// Strategia: Stale While Revalidate per immagini
const STALE_WHILE_REVALIDATE_PATTERNS = [
  /\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico)$/
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('villa-mareblu-') && name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - routing strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Network First for API calls
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache First for static assets
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname) || pattern.test(url.href))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale While Revalidate for images
  if (STALE_WHILE_REVALIDATE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default: Network First for navigation
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Fallback: Network with cache fallback
  event.respondWith(networkFirst(request));
});

// Cache First Strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache first fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // For navigation requests, return cached index.html
    if (request.mode === 'navigate') {
      const cachedIndex = await caches.match('/index.html');
      if (cachedIndex) return cachedIndex;
    }

    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then(c => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// Message handler for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
