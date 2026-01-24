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

const CACHE_VERSION = 'v1';
const CACHE_NAME = `sneivandt-${CACHE_VERSION}`;

/**
 * Assets to pre-fetch during installation to ensure basic site functionality offline.
 */
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/share-button.js',
  './js/typewriter.js',
  './js/connection-status.js',
  './font/Inter/Inter-Light.woff2',
  './font/Inter/Inter-Regular.woff2',
  './font/Inter/Inter-SemiBold.woff2',
  './font/Inter/Inter-Bold.woff2',
  './img/favicon.svg',
  './img/favicon.ico',
  './img/stuart-neivandt.webp',
  './manifest.json',
  './img/icon-192.png',
  './img/icon-512.png'
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
          throw error;
        }
      }

      // Strategy 2: Static Assets (Images, Fonts) -> Cache First
      if (
        url.pathname.match(/\.(webp|png|jpg|jpeg|svg|ttf|woff|woff2)$/i) ||
        url.pathname.includes('/img/') ||
        url.pathname.includes('/font/')
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
          // If offline and image not in cache, fallback logic could go here
          throw error;
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
        throw error;
      }
    })()
  );
});
