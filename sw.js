// ==============================================================================
// VRUSHABH DESHMUKH // PWA SERVICE WORKER (OFFLINE DISPATCHES CACHE)
// ==============================================================================

const CACHE_NAME = 'vrushabh-v3.1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/about/',
  '/projects/',
  '/blog/',
  '/resume/',
  '/contact/',
  '/assets/css/main.css',
  '/assets/css/omarchy-themes.css',
  '/assets/css/syntax.css',
  '/assets/js/main.js',
  '/assets/js/omarchy.js',
  '/assets/js/modules/theme.js',
  '/assets/js/modules/canvas.js',
  '/assets/js/modules/sfx.js',
  '/assets/js/modules/menubar.js',
  '/assets/js/modules/audio.js',
  '/assets/js/modules/palette.js',
  '/assets/js/modules/shortcuts.js',
  '/assets/js/modules/terminal.js',
  '/assets/js/modules/stats.js',
  '/assets/js/modules/widgets.js',
  '/assets/js/modules/model3d.js',
  '/assets/images/3D_helmat_model_v3.webp',
  '/assets/images/3D_model_v3.webp',
  '/assets/images/favicon.svg',
  '/assets/images/omarchy-logo.svg',
  '/site.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('PWA Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Ignore non-GET or cross-origin requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // Stale-while-revalidate strategy for same-origin assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, resClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cached;
      });

      return cached || fetchPromise;
    })
  );
});
