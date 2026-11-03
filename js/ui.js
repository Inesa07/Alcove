// Small helpers shared by the pages.
import { todayISO } from './store.js'

export const $ = (sel, root = document) => root.querySelector(sel)
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export const isoToDate = (iso) => new Date(iso + 'T12:00')
export const addDays = (iso, n) => { const d = isoToDate(iso); d.setDate(d.getDate() + n); return todayISO(d) }

export function dayLabel(iso) {
  const today = todayISO()
  if (iso === today) return 'Today'
  if (iso === addDays(today, 1)) return 'Tomorrow'
  if (iso === addDays(today, -1)) return 'Yesterday'
  return isoToDate(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

export const longDate = (iso) => isoToDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
export const weekday = (iso) => isoToDate(iso).toLocaleDateString('en-GB', { weekday: 'long' })

let toastTimer
export function toast(text) {
  const el = $('#toast')
  el.textContent = text
  el.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { el.hidden = true }, 3000)
}

export function debounce(fn, ms) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}
