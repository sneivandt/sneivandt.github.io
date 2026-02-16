/**
 * @file sw.js
 * @description Service Worker for offline support and asset caching.
 *
 * Implements a hybrid caching strategy:
 * 1. Navigation requests (HTML) -> Network First (fresh content)
 * 2. Static Assets (Images, Fonts) -> Cache First (performance)
 * 3. Other Assets (CSS, JS) -> Stale-While-Revalidate (fast load + background update)
 */

"use strict";

const CACHE_VERSION = 'v2';
const CACHE_NAME = `sneivandt-${CACHE_VERSION}`;

/**
 * Assets to pre-fetch during installation to ensure basic site functionality offline.
 */
const PRECACHE_ASSETS = [
  './',
  './assets/css/style.css',
  './assets/font/Inter-Bold.woff2',
  './assets/font/Inter-Light.woff2',
  './assets/font/Inter-Regular.woff2',
  './assets/font/Inter-SemiBold.woff2',
  './assets/img/favicon.ico',
  './assets/img/favicon.svg',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/img/stuart-neivandt.webp',
  './index.html',
  './assets/js/main.js',
  './assets/js/components/typewriter-effect.js',
  './assets/js/components/share-button.js',
  './assets/js/components/connection-status.js',
  './assets/js/components/last-updated.js',
  './assets/js/components/console-brand.js',
  './assets/js/components/profile-card.js',
  './assets/js/components/social-links.js',
  './assets/js/components/copyright-notice.js',
  './manifest.json'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Must cache critical assets successfully
      await cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
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

// Fetch Event
self.addEventListener('fetch', (e) => {
  // Only handle GET requests and ensure valid scheme (http/https)
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const url = new URL(e.request.url);

      // Strategy 1: Navigation requests (HTML) -> Network First
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
          // Return a basic offline page response instead of throwing
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        }
      }

      // Strategy 2: Static Assets (Images, Fonts) -> Cache First
      if (
        url.pathname.match(/\.(webp|png|jpg|jpeg|svg|ttf|woff|woff2)$/i) ||
        url.pathname.includes('/assets/img/') ||
        url.pathname.includes('/assets/font/')
      ) {
        const cachedResponse = await cache.match(e.request);
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(e.request);
          if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // Return a basic error response for missing assets
          return new Response('', {
            status: 404,
            statusText: 'Not Found'
          });
        }
      }

      // Strategy 3: Code (CSS, JS) -> Stale-While-Revalidate
      const cachedResponse = await cache.match(e.request);

      if (cachedResponse) {
        // Serve from cache immediately, update in background
        e.waitUntil(
          fetch(e.request).then((networkResponse) => {
            if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
              return cache.put(e.request, networkResponse.clone());
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }

      // If not in cache, fetch from network
      try {
        const networkResponse = await fetch(e.request);
        if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
          cache.put(e.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // Return a basic error response when offline and not cached
        return new Response('', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    })()
  );
});
