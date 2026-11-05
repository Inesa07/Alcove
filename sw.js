// Lets the app open without internet once it has been visited.
const CACHE = 'planner-v51'
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css', 'css/views.css', 'css/light.css',
  'js/app.js', 'js/store.js', 'js/db.js', 'js/ui.js', 'js/room.js', 'js/classify.js', 'js/reminders.js', 'js/stickers.js', 'js/templates.js', 'js/config.js', 'js/sync.js', 'js/account.js', 'js/bin.js', 'js/analytics.js', 'js/onboarding.js', 'js/views/admin.js', 'js/weather.js', 'js/sounds.js', 'js/friends.js', 'js/views/friends.js', 'js/views/year.js', 'js/tour.js',
  'js/views/room.js', 'js/views/diary.js', 'js/views/books.js', 'js/views/notes.js', 'js/views/calendar.js',
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
    const open = list.find((c) => 'focus' in c)
    if (open) { open.navigate('./#calendar'); return open.focus() }
    return self.clients.openWindow('./#calendar')
  }))
})
