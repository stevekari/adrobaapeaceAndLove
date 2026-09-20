// Peace & Love, Adroabaa - PWA Service Worker
const CACHE_NAME = 'peace-love-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png'
];

// 1. Install Event: Cache Core Static Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Core caching partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean Old Caches & Claim Clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or chrome-extension schemes
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // API Requests: Network-First (live data with offline fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Clone and cache successful API responses for offline viewing
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return cached API response if network is offline
          return caches.match(event.request);
        })
    );
    return;
  }

  // Navigation / HTML page requests (SPA support)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html') || caches.match('/'))
    );
    return;
  }

  // Static Assets (CSS, JS, Fonts, Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

