/* SIRIUS – service worker (installerbar PWA)
 * Cache-first for statiske filer; nett for alt annet (aldri cache lyd-strøm
 * eller API). Bump CACHE når du endrer filer. */
const CACHE = 'sirius-v3';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './assets/logo.svg',
  './js/config.js',
  './js/i18n.js',
  './js/starfield.js',
  './js/player.js',
  './js/ai.js',
  './js/schedule.js',
  './js/auth.js',
  './js/favorites.js',
  './js/podcast.js',
  './js/djprofile.js',
  './js/stations.js',
  './js/search.js',
  './js/app.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Aldri cache API-kall eller lyd-strøm
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/listen/') || /\.(mp3|aac|ogg)$/i.test(url.pathname)) return;
  // Kun samme opphav (unngå å cache eksterne strømmer/CDN)
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => cached))
  );
});
