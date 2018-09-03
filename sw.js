var CACHE_NAME = 'site-cache-v1';
var urlsToCache = [
    '/',
    '/404',
    '/resume',
    '/public/css/bootstrap.min.css',
    '/public/css/bootstrap.min.css.map',
    '/public/css/fontawesome.min.css',
    '/public/css/styles.css',
    '/public/images/headshot.jpg',
    '/public/js/bootstrap.min.js',
    '/public/js/bootstrap.min.js.map',
    '/public/js/jquery.slim.min.js',
    '/public/js/load.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
            if (response) {
                return response;
            }
            return fetch(event.request);
        }
      )
    );
});