// GameCast Service Worker
// Caches static shell for offline/fast load; API calls always go to network.

const CACHE_NAME = 'gamecast-v2'

const PRECACHE = [
  '/',
  '/live',
  '/highlights',
  '/profile',
  '/manifest.json',
]

// ── Install: pre-cache the app shell ─────────────────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(PRECACHE).catch(() => {})  // don't fail install if offline
    )
  )
})

// ── Activate: remove old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: network-first for API, cache-first for static ─────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Always go to network for API calls, TTS, and gamecaster streams
  if (url.pathname.startsWith('/api/') || request.method !== 'GET') {
    return  // let browser handle it
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(res => {
        // Only cache successful same-origin responses
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return res
      }).catch(() => cached || new Response('Offline', { status: 503 }))
    })
  )
})
