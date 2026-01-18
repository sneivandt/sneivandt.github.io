/*
 * Simple Service Worker for offline support.
 * Strategy: Stale-While-Revalidate for assets, Network-First for navigation.
 */

const CACHE_NAME = 'sneivandt-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/particles-manager.js',
  './js/typewriter.js',
  './font/OpenSans/OpenSans-Regular.ttf',
  './img/favicon.svg',
  './img/profile.webp',
  'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  // Strategy 1: Network First for HTML (Navigation) to ensure fresh content
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.match(e.request)) // Fallback to cache if offline
    );
    return;
  }

  // Strategy 2: Stale-While-Revalidate for known assets
  // Returns cached version immediately, then fetches update in background
  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(e.request);

      const networkFetch = fetch(e.request).then((resp) => {
        if (resp.ok) {
          cache.put(e.request, resp.clone());
        }
        return resp;
      }).catch(() => {
        // network failed, just return undefined (cachedResponse handles it)
      });

      // Keep SW alive until cache is updated
      e.waitUntil(networkFetch);

      return cachedResponse || networkFetch;
    })
  );
});
