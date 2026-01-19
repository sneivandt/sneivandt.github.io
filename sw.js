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
  './js/typewriter.js',
  './font/OpenSans/OpenSans-Regular.ttf',
  './img/favicon.svg',
  './img/profile.webp',
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

  // Hybrid Strategy:
  // - Navigation requests (HTML): Network-First (fresh content when online)
  // - Asset requests (CSS, JS, images): Stale-While-Revalidate (fast loading)
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Check if this is a navigation request (HTML page)
      if (e.request.mode === 'navigate') {
        // Network-First Strategy for HTML
        try {
          const networkResponse = await fetch(e.request);
          // If successful, update cache and return fresh content
          if (networkResponse && networkResponse.ok) {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          }
          // Non-ok response (404, 500, etc.) - try cache as fallback
          const cachedResponse = await cache.match(e.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // No cache available, return the non-ok network response
          return networkResponse;
        } catch (error) {
          // Network failed (offline), try cache
          const cachedResponse = await cache.match(e.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // No cache either, let the error propagate
          throw error;
        }
      }

      // Stale-While-Revalidate Strategy for assets
      const cachedResponse = await cache.match(e.request);

      // Fetch from network to update cache (background)
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Check if valid response
        if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
          cache.put(e.request, networkResponse.clone());
        }
        return networkResponse;
      });

      // If cached response exists, return it immediately and update in background
      if (cachedResponse) {
        fetchPromise.catch(() => {
          // Fail silently on background update error
        });
        return cachedResponse;
      }

      // Otherwise wait for network
      return fetchPromise;
    })()
  );
});
