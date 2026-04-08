// IPL Analytics Hub — Service Worker
// Caches the app shell for offline use. Data files are fetched fresh.

const CACHE = 'ipl-hub-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always network-first for ipl2026.json (live data)
  if (url.pathname.includes('ipl2026.json')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, images, logos)
  if (
    url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/) ||
    url.pathname.includes('/assets/') ||
    url.pathname.includes('/logos/')
  ) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Network-first for HTML navigation
  e.respondWith(
    fetch(e.request).catch(() => caches.match('./index.html'))
  );
});
