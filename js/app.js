import { getState, subscribe, setName, todayISO } from './store.js'
import { timeOfDay } from './room.js'
import { startReminders, upcoming } from './reminders.js'
import { $, $$, esc, dayLabel, toast } from './ui.js'
import * as roomView from './views/room.js'
import * as diaryView from './views/diary.js'
import * as booksView from './views/books.js'
import * as notesView from './views/notes.js'
import * as calendarView from './views/calendar.js'
import { setupAccount } from './account.js'

const VIEWS = { room: roomView, diary: diaryView, books: booksView, notes: notesView, calendar: calendarView }
const GREETING = { morning: 'Good morning', day: 'Good afternoon', evening: 'Good evening', night: 'Good night' }

let current = null
let unmount = null

/* ---------- menu side ---------- */

function renderSide() {
  const s = getState()
  const now = new Date()
  $('#date').textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  $('#greeting').textContent = GREETING[timeOfDay(now)] + (s.name ? ', ' + s.name : '')
  $('#name-form').hidden = !!s.name
  $('#count-books').textContent = s.books.length || ''
  $('#count-notes').textContent = s.notes.length || ''
  const today = todayISO()
  const todays = s.events.filter((e) => e.date === today).length
  $('#count-events').textContent = todays ? todays + ' today' : ''

  const next = upcoming(3)
  $('#side-foot').innerHTML = next.length
    ? `<h3>Coming up</h3><ul>${next.map((e) => `<li><span>${esc(e.title)}</span><em>${esc(dayLabel(e.date))}${e.time ? ', ' + e.time : ''}</em></li>`).join('')}</ul>`
    : `<h3>Coming up</h3><p>Nothing planned. Add something in the calendar and I will remind you.</p>`
}

$('#name-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const name = $('#name-input').value.trim()
  if (name) setName(name)
})

/* ---------- pages ---------- */

function show() {
  const name = location.hash.slice(1).split('/')[0] || 'room'
  const view = VIEWS[name] ? name : 'room'
  if (view === current) return
  if (unmount) unmount()
  current = view
  const el = $('#view')
  el.className = 'view view-' + view
  el.innerHTML = ''
  unmount = VIEWS[view].mount(el) || null
  $$('#nav a').forEach((a) => {
    if (a.dataset.view === view) a.setAttribute('aria-current', 'page')
    else a.removeAttribute('aria-current')
  })
  el.focus?.()
  window.scrollTo(0, 0)
}

window.addEventListener('hashchange', show)
subscribe(renderSide)
setInterval(renderSide, 60 * 1000)

startReminders((ev) => toast(`Reminder: ${ev.title}${ev.time ? ' at ' + ev.time : ''}`))

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {})
}

// New things arrived from another device: draw the page again (unless you are typing right now).
window.addEventListener('planner:synced', () => {
  renderSide()
  const a = document.activeElement
  if (a && $('#view').contains(a) && (a.isContentEditable || /INPUT|TEXTAREA/.test(a.tagName))) return
  current = null
  show()
})

renderSide()
setupAccount()
show()
