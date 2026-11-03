// Small data (name, notes, books, calendar, room settings) lives in localStorage.
// Big data (diary pages with drawings and photos, book covers) lives in IndexedDB, see db.js.
// Later this file is the only place that changes when we move to Supabase.

import { DEFAULT_ROOM } from './room.js'

const KEY = 'planner.v2'
const OLD_KEY = 'planner.v1'

const empty = () => ({
  name: '',
  notes: [],      // { id, text, color, createdAt }
  books: [],      // { id, title, author, color, hasCover, finishedOn, createdAt }
  events: [],     // { id, title, date: 'YYYY-MM-DD', time: 'HH:MM' | '', remind, notified }
  diaryDays: [],  // dates on which something was written or drawn (for the plant)
  diaryBook: { count: 0, spread: 0 }, // how many pages the diary has, and where it is open
  room: { ...DEFAULT_ROOM },
})

let state = load()
const listeners = new Set()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = { ...empty(), ...JSON.parse(raw) }
      s.room = { ...DEFAULT_ROOM, ...s.room }
      s.diaryBook = { ...empty().diaryBook, ...s.diaryBook }
      return s
    }
    const old = localStorage.getItem(OLD_KEY)
    if (old) return migrate(JSON.parse(old))
  } catch { /* broken or blocked storage: start fresh */ }
  return empty()
}

// Version 1 had tasks; they become calendar events.
function migrate(v1) {
  const s = empty()
  s.name = v1.name || ''
  s.notes = (v1.notes || []).map((n) => ({ id: n.id, text: n.text, color: pick(NOTE_COLORS), createdAt: n.createdAt || Date.now() }))
  s.books = (v1.books || []).map((b) => ({ id: b.id, title: b.title, author: '', color: pick(COVER_COLORS), hasCover: false, finishedOn: todayISO(), createdAt: b.createdAt || Date.now() }))
  s.events = (v1.tasks || []).filter((t) => !t.done).map((t) => ({ id: t.id, title: t.text, date: t.date, time: t.time || '', remind: !!t.time, notified: false }))
  return s
}

function save(fromCloud = false) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage full or blocked */ }
  if (!fromCloud) window.dispatchEvent(new CustomEvent('planner:change', { detail: 'state' }))
  listeners.forEach((fn) => fn(state))
}

// Used by sync: the version from the cloud replaces this one.
export function replaceState(next) {
  state = { ...empty(), ...next }
  state.room = { ...DEFAULT_ROOM, ...state.room }
  state.diaryBook = { ...empty().diaryBook, ...state.diaryBook, spread: state.diaryBook?.spread ?? 0 }
  save(true)
}

export const NOTE_COLORS = ['#FBE7A6', '#F7CFD9', '#CFE4F5', '#D8EBD9', '#E6DCF5']
export const COVER_COLORS = ['#8E7CC3', '#E28FA3', '#6FA287', '#D9A441', '#5F86B3', '#C97F62', '#9C6FA8', '#3F6B5E']
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const getState = () => state
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export function todayISO(d = new Date()) {
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export function add(kind, item) {
  const withId = { id: uid(), ...item }
  state = { ...state, [kind]: [withId, ...state[kind]] }
  save()
  return withId
}

export function update(kind, id, patch) {
  state = { ...state, [kind]: state[kind].map((x) => (x.id === id ? { ...x, ...patch } : x)) }
  save()
}

export function remove(kind, id) {
  state = { ...state, [kind]: state[kind].filter((x) => x.id !== id) }
  save()
}

export function setName(name) { state = { ...state, name }; save() }

export function setRoom(patch) { state = { ...state, room: { ...state.room, ...patch } }; save() }

export function setDiaryBook(patch) { state = { ...state, diaryBook: { ...state.diaryBook, ...patch } }; save() }

export function markDiaryDay(date, hasContent) {
  const has = state.diaryDays.includes(date)
  if (hasContent === has) return
  state = { ...state, diaryDays: hasContent ? [...state.diaryDays, date].sort() : state.diaryDays.filter((d) => d !== date) }
  save()
}

// Days in a row (ending today or yesterday) with something in the diary. The plant grows with it.
export function streak() {
  const days = new Set(state.diaryDays)
  const d = new Date()
  if (!days.has(todayISO(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (days.has(todayISO(d))) { n++; d.setDate(d.getDate() - 1) }
  return n
}
