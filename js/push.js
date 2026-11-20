// Reminders that arrive even when Alcove is closed.
// The app writes your coming reminders to the server; every minute the server sends
// the ones that are due as push notifications to each device where you turned them on.
// It needs the server part (supabase/push.sql and the send-reminders function); until
// that is there, this quietly does nothing and reminders work while the app is open.

import * as sync from './sync.js'
import { getState, subscribe } from './store.js'
import { VAPID_PUBLIC_KEY } from './config.js'

let ready = false, off = null, timer = null, lastSent = ''

const b64 = (s) => { const p = '='.repeat((4 - (s.length % 4)) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(r, (c) => c.charCodeAt(0)) }
const usable = () => VAPID_PUBLIC_KEY && 'serviceWorker' in navigator && 'PushManager' in window && sync.signedIn() && !sync.currentUser()?.offline && Notification.permission === 'granted'
const missingTable = (e) => e && (e.code === '42P01' || e.code === 'PGRST205' || /does not exist|schema cache/i.test(e.message || ''))

export async function initPush() {
  if (ready || !usable()) return
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID_PUBLIC_KEY) }))
    const c = await sync.getClient()
    const { error } = await c.from('push_subscriptions').upsert({ endpoint: sub.endpoint, keys: sub.toJSON().keys, user_id: sync.currentUser().id })
    if (error) { if (!missingTable(error)) console.warn('push', error.message); return }
    ready = true
    off = subscribe(soon)
    soon()
  } catch (e) { console.warn('push', e.message) }
}

// the reminders that should be on the server: plans with a time and "remind me", in the next 60 days
function wanted() {
  const now = Date.now(), until = now + 60 * 86400000
  return getState().events.filter((e) => e.remind && e.time && !e.done).map((e) => {
    const at = new Date(`${e.date}T${e.time}`).getTime()
    return { id: e.id, at, title: 'Alcove', body: `${e.time} · ${e.title}` }
  }).filter((r) => r.at > now && r.at < until)
}

function soon() { clearTimeout(timer); timer = setTimeout(send, 2000) }

async function send() {
  if (!ready) return
  const list = wanted()
  const key = JSON.stringify(list)
  if (key === lastSent) return
  try {
    const c = await sync.getClient(), uid = sync.currentUser().id
    if (list.length) {
      const { error } = await c.from('push_reminders').upsert(list.map((r) => ({ user_id: uid, id: r.id, at: new Date(r.at).toISOString(), title: r.title, body: r.body, url: './#calendar', sent_at: null })))
      if (error) return
    }
    // plans that were deleted or moved to no reminder: take them off the server
    const { data } = await c.from('push_reminders').select('id').is('sent_at', null)
    const keep = new Set(list.map((r) => r.id))
    const gone = (data || []).map((r) => r.id).filter((id) => !keep.has(id))
    if (gone.length) await c.from('push_reminders').delete().in('id', gone).is('sent_at', null)
    lastSent = key
  } catch { /* offline: try again on the next change */ }
}

export function stopPush() { ready = false; off?.(); off = null }
