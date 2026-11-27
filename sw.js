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

const CACHE_VERSION = 'v55';
const CACHE_NAME = `sneivandt-${CACHE_VERSION}`;

// HTTP Status Codes
const HTTP_STATUS = {
  NOT_FOUND: 404,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Assets to pre-fetch during installation to ensure basic site functionality offline.
 */
const PRECACHE_ASSETS = [
  './',
  './assets/css/style.css',
  './assets/font/Inter-Regular.woff2',
  './assets/font/Inter-SemiBold.woff2',
  './assets/img/stuart-neivandt.webp',
  './assets/js/main.js',
  './manifest.json'
];

const putInCache = (cache, request, response) =>
  cache.put(request, response).catch(() => {});

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (e) => {
  // Only handle same-origin GET requests over http/https
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Strategy 1: Navigation requests (HTML) -> Network First
      if (e.request.mode === 'navigate') {
        const isHome = url.pathname === '/' || url.pathname === '/index.html';
        const cacheKey = isHome ? './' : url.pathname;

        try {
          const networkResponse = await fetch(e.request);
          if (networkResponse && networkResponse.ok) {
            e.waitUntil(putInCache(cache, cacheKey, networkResponse.clone()));
            return networkResponse;
          }
          return (await cache.match(cacheKey)) || networkResponse;
        } catch (error) {
          const cachedResponse =
            (await cache.match(e.request, { ignoreSearch: true })) ||
            (isHome ? await cache.match('./') : null);
          if (cachedResponse) return cachedResponse;
          // Return a basic offline page response instead of throwing
          return new Response('Offline', {
            status: HTTP_STATUS.SERVICE_UNAVAILABLE,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        }
      }

      // Strategy 2: Static Assets (Images, Fonts) -> Cache First
      if (
        url.pathname.match(/\.(webp|png|jpg|jpeg|svg|ico|ttf|woff|woff2)$/i) ||
        url.pathname.includes('/assets/img/') ||
        url.pathname.includes('/assets/font/')
      ) {
        const cachedResponse = await cache.match(e.request);
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(e.request);
          if (networkResponse && networkResponse.ok) {
            e.waitUntil(putInCache(cache, e.request, networkResponse.clone()));
          }
          return networkResponse;
        } catch (error) {
          // Return a basic error response for missing assets
          return new Response('', {
            status: HTTP_STATUS.NOT_FOUND,
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
            if (networkResponse && networkResponse.ok) {
              return putInCache(cache, e.request, networkResponse.clone());
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }

      // If not in cache, fetch from network
      try {
        const networkResponse = await fetch(e.request);
        if (networkResponse && networkResponse.ok) {
          e.waitUntil(putInCache(cache, e.request, networkResponse.clone()));
        }
        return networkResponse;
      } catch (error) {
        // Return a basic error response when offline and not cached
        return new Response('', {
          status: HTTP_STATUS.SERVICE_UNAVAILABLE,
          statusText: 'Service Unavailable'
        });
      }
    })()
  );
});
