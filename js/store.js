// All data lives in the browser (localStorage) for now.
// Later this file is the only place that changes when we move to Supabase.

const KEY = 'planner.v1'

const empty = () => ({
  name: '',
  tasks: [],  // { id, text, date: 'YYYY-MM-DD', time: 'HH:MM' | '', done: false, doneOn: 'YYYY-MM-DD' | null }
  notes: [],  // { id, text, tag, createdAt }
  books: [],  // { id, title, status: 'want' | 'reading' | 'read', createdAt }
  diary: [],  // { id, text, date, createdAt }
})

let state = load()
const listeners = new Set()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty()
  } catch {
    return empty()
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage full or blocked */ }
  listeners.forEach((fn) => fn(state))
}

export const getState = () => state
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export function todayISO(d = new Date()) {
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export function add(kind, item) {
  state = { ...state, [kind]: [{ id: uid(), ...item }, ...state[kind]] }
  save()
}

export function update(kind, id, patch) {
  state = { ...state, [kind]: state[kind].map((x) => (x.id === id ? { ...x, ...patch } : x)) }
  save()
}

export function remove(kind, id) {
  state = { ...state, [kind]: state[kind].filter((x) => x.id !== id) }
  save()
}

export function setName(name) {
  state = { ...state, name }
  save()
}

export function toggleTask(id) {
  const t = state.tasks.find((x) => x.id === id)
  if (!t) return
  update('tasks', id, { done: !t.done, doneOn: t.done ? null : todayISO() })
}

// Days in a row (ending today or yesterday) with at least one finished task.
export function streak() {
  const days = new Set(state.tasks.filter((t) => t.done && t.doneOn).map((t) => t.doneOn))
  const d = new Date()
  if (!days.has(todayISO(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (days.has(todayISO(d))) { n++; d.setDate(d.getDate() - 1) }
  return n
}
