/*
 * Simple Service Worker for offline support.
 * Strategy: Network-First (cache fallback) for all assets.
 */

const CACHE_NAME = 'sneivandt-v1';

// Precache assets: Site functionality depends on these
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/particles-manager.js',
  './js/typewriter.js',
  './font/OpenSans/OpenSans-Regular.ttf',
  './img/favicon.svg',
  './img/profile.webp'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Must cache critical assets successfully
      await cache.addAll(PRECACHE_ASSETS);
    })
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

  // Strategy: Network First (with Cache Fallback)
  // Ensures user always gets fresh content if online, but has offline backup.
  e.respondWith(
    (async () => {
      try {
        // 1. Try network
        const response = await fetch(e.request);

        // 2. If valid response, update cache
        // (Check response.ok for own assets, or opaque for external/CDN)
        if (response && (response.ok || response.type === 'opaque')) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(e.request, response.clone());
        }

        return response;
      } catch (err) {
        // 3. Network failed, try cache
        const cachedResponse = await caches.match(e.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw err;
      }
    })()
  );
});
