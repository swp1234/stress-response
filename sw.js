const CACHE_PREFIX = 'stress-response-';
const CACHE_NAME = 'stress-response-v2';
const APP_PATH = '/stress-response/';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/i18n.js',
  './icon-192.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_PATH)) return;
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request).then(networkResponse => {
      if (networkResponse.ok) {
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return networkResponse;
    }))
  );
});
