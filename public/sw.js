/* ──────────────────────────────────────────────────────────────────────────
   Service worker — conservative offline support.

   Safety-first design so it can never "brick" the live site (which the APK
   also loads):
     • Navigation (HTML) → NETWORK-FIRST. Online users always get fresh markup;
       the cached copy is only used when the network is unavailable.
     • Same-origin static assets + /data JSON → STALE-WHILE-REVALIDATE. Served
       instantly from cache, refreshed in the background.
     • Cross-origin requests (AI, translation, TTS, RSS, fonts) are ignored and
       handled by the browser as usual.
   ────────────────────────────────────────────────────────────────────────── */

const VERSION = 'dlsw-v4';
const RUNTIME = VERSION + '-runtime';
const PRECACHE_URLS = ['/offline.html', '/data/vocab.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(RUNTIME)
      .then((c) => c.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return; // leave cross-origin to the browser

  // Navigation: network-first, fall back to cached page → offline shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/offline.html')))
    );
    return;
  }

  // Static assets + data JSON: stale-while-revalidate.
  if (/\.(?:js|css|woff2?|ttf|png|jpe?g|svg|gif|webp|ico|json)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(RUNTIME).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
