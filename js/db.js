// A tiny key-value store on top of IndexedDB.
// Used for things that are too big for localStorage: diary pages and pictures.

const DB_NAME = 'planner'
const STORE = 'kv'
let dbPromise

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

function run(mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = fn(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(req && req.result)
    tx.onerror = () => reject(tx.error)
  }))
}

export const get = (key) => run('readonly', (s) => s.get(key)).catch(() => undefined)
export const set = (key, value) => run('readwrite', (s) => s.put(value, key))
export const del = (key) => run('readwrite', (s) => s.delete(key))
export const keys = (prefix = '') => run('readonly', (s) => s.getAllKeys()).then((all) => (all || []).filter((k) => String(k).startsWith(prefix))).catch(() => [])

// Shrinks a photo so the diary stays light: longest side at most `max` pixels, saved as JPEG.
export function shrinkImage(file, max = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve({ src: c.toDataURL('image/jpeg', 0.82), ratio: c.height / c.width })
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This file is not a picture')) }
    img.src = url
  })
}
