// Sign-in and sync between devices, through Supabase.
// Everything still lives on the device first (localStorage + IndexedDB), so the app works offline.
// Sync copies each piece of data to the cloud as one row: 'state', 'bp:N' (diary page), 'cover:<id>'.
// When the same piece changed in two places, the newer change wins.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'
import { getState, replaceState } from './store.js'
import * as db from './db.js'

const STAMPS = 'planner.stamps'   // when each key last changed on this device
const SYNCED = 'planner.synced'   // this device has synced at least once
const TABLE = 'planner_data'
const SYNCED_PREFIXES = ['bp:', 'cover:']

let client = null
let user = null
let status = 'off'                // off | signed-out | syncing | ok | error
let lastSync = 0
let lastError = ''
const dirty = new Set()
const listeners = new Set()
let timer = null

export const configured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY) || !!window.__plannerSupabase
export const info = () => ({ status, email: user?.email || '', lastSync, lastError })
export const onStatus = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
const setStatus = (s, err = '') => { status = s; lastError = err; listeners.forEach((fn) => fn(info())) }

const stamps = () => { try { return JSON.parse(localStorage.getItem(STAMPS)) || {} } catch { return {} } }
const saveStamps = (m) => { try { localStorage.setItem(STAMPS, JSON.stringify(m)) } catch {} }
const stamp = (key, t = Date.now()) => { const m = stamps(); m[key] = t; saveStamps(m) }
const synced = (key) => SYNCED_PREFIXES.some((p) => key.startsWith(p)) || key === 'state'

async function getClient() {
  if (client) return client
  if (window.__plannerSupabase) return (client = window.__plannerSupabase) // used by tests
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, detectSessionInUrl: false } })
  return client
}

/* ---------- reading and writing one key on this device ---------- */

async function readLocal(key) {
  if (key === 'state') { const { diaryBook, ...rest } = getState(); return { ...rest, diaryBook: { count: diaryBook.count } } }
  return db.get(key)
}

async function writeLocal(key, value) {
  if (key === 'state') {
    if (value) replaceState({ ...value, diaryBook: { ...value.diaryBook, spread: getState().diaryBook.spread } })
    return
  }
  if (value == null) await db.del(key, true)
  else await db.set(key, value, true)
}

/* ---------- the sync itself ---------- */

export async function syncNow() {
  if (!user) return
  clearTimeout(timer)
  setStatus('syncing')
  try {
    const c = await getClient()
    const first = !localStorage.getItem(SYNCED)
    const local = stamps()
    const { data: rows, error } = await c.from(TABLE).select('key, updated_at')
    if (error) throw error
    const remote = new Map(rows.map((r) => [r.key, new Date(r.updated_at).getTime()]))

    // 1. take what is newer in the cloud (on a new device the cloud always wins)
    const pull = [...remote].filter(([k, t]) => first || !(k in local) || t > local[k]).map(([k]) => k)
    let changedHere = false
    for (let i = 0; i < pull.length; i += 20) {
      const { data, error: e2 } = await c.from(TABLE).select('key, value, updated_at').in('key', pull.slice(i, i + 20))
      if (e2) throw e2
      for (const r of data) { await writeLocal(r.key, r.value); stamp(r.key, new Date(r.updated_at).getTime()); dirty.delete(r.key) }
      changedHere = changedHere || data.length > 0
    }

    // 2. send what is newer here
    const localKeys = new Set(['state', ...(await db.keys('bp:')), ...(await db.keys('cover:')), ...dirty])
    const now = stamps()
    const push = [...localKeys].filter((k) => !pull.includes(k) && (dirty.has(k) || !remote.has(k) || (now[k] || 0) > remote.get(k)))
    for (const k of push) {
      const value = await readLocal(k)
      const updated_at = new Date().toISOString()
      const { error: e3 } = await c.from(TABLE).upsert({ key: k, value: value ?? null, updated_at }, { onConflict: 'user_id,key' })
      if (e3) throw e3
      stamp(k, new Date(updated_at).getTime())
      dirty.delete(k)
    }

    localStorage.setItem(SYNCED, '1')
    lastSync = Date.now()
    setStatus('ok')
    if (changedHere) window.dispatchEvent(new CustomEvent('planner:synced'))
  } catch (e) {
    setStatus('error', e?.message || 'Could not sync')
  }
}

const soon = () => { clearTimeout(timer); timer = setTimeout(syncNow, 2000) }

window.addEventListener('planner:change', (e) => {
  const key = e.detail
  if (!synced(key)) return
  stamp(key)
  dirty.add(key)
  if (user) soon()
})
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && user) syncNow() })
window.addEventListener('online', () => user && syncNow())
window.addEventListener('focus', () => user && status !== 'syncing' && syncNow())
setInterval(() => { if (user && document.visibilityState === 'visible' && status !== 'syncing') syncNow() }, 60 * 1000)

/* ---------- account ---------- */

export async function start() {
  if (!configured()) return
  try {
    const c = await getClient()
    const { data } = await c.auth.getSession()
    user = data?.session?.user || null
    setStatus(user ? 'ok' : 'signed-out')
    if (user) syncNow()
  } catch (e) { setStatus('error', e?.message || 'Could not reach the cloud') }
}

export async function signIn(email, password, create = false) {
  const c = await getClient()
  const { data, error } = create ? await c.auth.signUp({ email, password }) : await c.auth.signInWithPassword({ email, password })
  if (error) throw error
  user = data.user && data.session ? data.user : null
  if (!user) return 'check-email'   // the project asks people to confirm their email first
  localStorage.removeItem(SYNCED)    // first sync on this device: the cloud copy wins
  setStatus('ok')
  await syncNow()
  return 'ok'
}

export async function signOut() {
  const c = await getClient()
  await c.auth.signOut()
  user = null
  setStatus('signed-out')
}
