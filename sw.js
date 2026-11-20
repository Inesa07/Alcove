// Lets the app open without internet once it has been visited.
const CACHE = 'planner-v71'
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css', 'css/views.css', 'css/light.css',
  'js/app.js', 'js/store.js', 'js/db.js', 'js/ui.js', 'js/room.js', 'js/classify.js', 'js/reminders.js', 'js/stickers.js', 'js/templates.js', 'js/config.js', 'js/sync.js', 'js/account.js', 'js/bin.js', 'js/analytics.js', 'js/onboarding.js', 'js/views/admin.js', 'js/weather.js', 'js/sounds.js', 'js/friends.js', 'js/views/friends.js', 'js/views/year.js', 'js/tour.js', 'js/chapters.js',
  'js/views/room.js', 'js/views/diary.js', 'js/views/books.js', 'js/views/notes.js', 'js/walls.js', 'js/views/calendar.js', 'js/life.js', 'js/kit.js', 'js/guide.js', 'js/search.js', 'js/habits.js', 'js/push.js', 'js/views/habits.js', 'js/vendor/three.module.min.js', 'js/vendor/GLTFLoader.js', 'js/vendor/BufferGeometryUtils.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))))
  self.clients.claim()
})

// Network first, so updates show up; the cache is the fallback when offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }) // always ask the server for the newest version
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copy))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})

// Tapping a reminder opens the calendar.
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((list) => {
    const url = (e.notification.data && e.notification.data.url) || './#calendar'
    const open = list.find((c) => 'focus' in c)
    if (open) { open.navigate(url); return open.focus() }
    return self.clients.openWindow(url)
  }))
})

// A reminder pushed by the server while Alcove is closed.
self.addEventListener('push', (e) => {
  let d = {}
  try { d = e.data ? e.data.json() : {} } catch { d = { body: e.data && e.data.text() } }
  e.waitUntil(self.registration.showNotification(d.title || 'Alcove', { body: d.body || '', tag: d.tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: d.url || './#calendar' } }))
})
