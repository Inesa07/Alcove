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

// A little face for each mood (1 sad … 5 great), so you can see the feeling without reading
export function moodFace(v, c) {
  const ink = '#3a3350'
  const eyes = v === 5
    ? `<path d="M12.5 17.5q2.5-3 5 0M26.5 17.5q2.5-3 5 0" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    : `<circle cx="15" cy="17.5" r="2.1" fill="${ink}"/><circle cx="29" cy="17.5" r="2.1" fill="${ink}"/>`
  const mouth = {
    1: '<path d="M14.5 31q7.5-7 15 0" />',
    2: '<path d="M15.5 29.5q6.5-3 13 0" />',
    3: '<path d="M16 28h12" />',
    4: '<path d="M15 26.5q7 6 14 0" />',
    5: `<path d="M13.5 25h17q-1 8.5-8.5 8.5T13.5 25z" fill="${ink}"/><path d="M17.5 30.5q4.5 2.6 9 0" stroke="#F49AA8" stroke-width="2.4"/>`,
  }[v]
  const extra = v === 1 ? '<path d="M30.5 21.5q-1.8 3 0 4.4q1.8-1.4 0-4.4z" fill="#8FC3F0"/>' : v >= 4 ? '<ellipse cx="10.5" cy="24" rx="3" ry="1.8" fill="#F49AA8" opacity=".55"/><ellipse cx="33.5" cy="24" rx="3" ry="1.8" fill="#F49AA8" opacity=".55"/>' : ''
  return `<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" fill="${c}"/>${eyes}<g stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round">${mouth}</g>${extra}</svg>`
}
