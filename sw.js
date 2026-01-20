/*
 * Simple Service Worker for offline support.
 * Strategy:
 * - Network-First for navigation requests (HTML) - ensures fresh content when online
 * - Stale-While-Revalidate for assets (CSS, JS, images) - fast loading with background updates
 */
"use strict";

const CACHE_VERSION = 'v1';
const CACHE_NAME = `sneivandt-${CACHE_VERSION}`;

// Precache assets: Site functionality depends on these
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/particles-manager.js',
  './js/share-button.js',
  './js/typewriter.js',
  './font/OpenSans/OpenSans-Regular.ttf',
  './img/favicon.svg',
  './img/stuart-neivandt.webp',
  './manifest.json'
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
  // Only handle GET requests and ensure valid scheme (http/https)
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

  // Optimized Strategy:
  // - Navigation (HTML): Network-First (fresh content)
  // - Static Assets (Images, Fonts): Cache-First (performance, save bandwidth)
  // - Code (CSS, JS): Stale-While-Revalidate (fast load + updates)
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const url = new URL(e.request.url);

      // 1. Navigation requests (HTML) - Network First
      if (e.request.mode === 'navigate') {
        try {
          const networkResponse = await fetch(e.request);
          if (networkResponse && networkResponse.ok) {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          }
          return (await cache.match(e.request)) || networkResponse;
        } catch (error) {
          const cachedResponse = await cache.match(e.request);
          if (cachedResponse) return cachedResponse;
          throw error;
        }
      }

      // 2. Static Assets (Images, Fonts) - Cache First
      // Addresses "efficient cache lifetimes" by avoiding network requests for unchanged assets
      if (url.pathname.match(/\.(webp|png|jpg|jpeg|svg|ttf|woff|woff2)$/i) ||
          url.pathname.includes('/img/') ||
          url.pathname.includes('/font/')) {
        const cachedResponse = await cache.match(e.request);
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(e.request);
          if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // If offline and image not in cache, we just fail or could return placeholder
          throw error;
        }
      }

      // 3. Other Assets (CSS, JS) - Stale-While-Revalidate
      const cachedResponse = await cache.match(e.request);

      if (cachedResponse) {
        // Serve from cache, update in background
        e.waitUntil(
          fetch(e.request).then((networkResponse) => {
            if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
              return cache.put(e.request, networkResponse.clone());
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(e.request);
        if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
          cache.put(e.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        throw error;
      }
    })()
  );
});
