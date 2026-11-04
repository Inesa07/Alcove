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
// A short message at the top. With an action (like Undo) it stays a little longer and has a button.
export function toast(text, action) {
  const el = $('#toast')
  el.innerHTML = ''
  const span = document.createElement('span')
  span.textContent = text
  el.appendChild(span)
  if (action) {
    const b = document.createElement('button')
    b.className = 'toast-action'
    b.type = 'button'
    b.textContent = action.label
    b.addEventListener('click', () => { el.hidden = true; clearTimeout(toastTimer); action.run() }, { once: true })
    el.appendChild(b)
  }
  el.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { el.hidden = true; action?.expire?.() }, action ? 6000 : 3000)
}

export function debounce(fn, ms) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

// Light or dark look. 'auto' follows the device.
export const themeMode = () => { try { return localStorage.getItem('planner.theme') || 'dark' } catch { return 'dark' } }
export function setTheme(mode) {
  try { localStorage.setItem('planner.theme', mode) } catch {}
  const t = mode === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : mode
  document.documentElement.dataset.theme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'light' ? '#F4EFE8' : '#1D1A30')
}
