// Anonymous usage statistics, only for the owner of the app.
// We count what people do (opened the diary, added a book, came back after a week) — never what they write.
// Events wait in this device until the person is signed in, then go to Supabase in small batches.

import * as sync from './sync.js'
import { todayISO } from './store.js'

const QUEUE = 'planner.events'
const queue = () => { try { return JSON.parse(localStorage.getItem(QUEUE)) || [] } catch { return [] } }
const keep = (q) => { try { localStorage.setItem(QUEUE, JSON.stringify(q.slice(-300))) } catch {} }
const onceToday = new Set()
let timer = null

export function track(name, props = {}) {
  keep([...queue(), { name, props, at: new Date().toISOString() }])
  clearTimeout(timer)
  timer = setTimeout(flush, 4000)
}

// only once a day per device, for things like "opened the app"
export function trackDaily(name, props = {}) {
  const k = 'planner.day.' + name
  const today = todayISO()
  try { if (localStorage.getItem(k) === today) return; localStorage.setItem(k, today) } catch {}
  track(name, props)
}

// once per session for each page
export function trackView(page) {
  if (onceToday.has(page)) return
  onceToday.add(page)
  track('view', { page })
}

export async function flush() {
  if (!sync.signedIn() || sync.currentUser()?.offline) return
  const q = queue()
  if (!q.length) return
  try {
    const c = await sync.getClient()
    const { error } = await c.from('app_events').insert(q.map((e) => ({ name: e.name, props: e.props, created_at: e.at })))
    if (!error) keep(queue().slice(q.length)) // events added while sending stay for next time
  } catch { /* try again later */ }
}

window.addEventListener('planner:track', (e) => track(e.detail.name, e.detail.props))
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush() })
