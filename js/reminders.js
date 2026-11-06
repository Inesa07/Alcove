// Reminders for calendar events that have a time.
// While the app is open (or installed on the home screen and running), a notification
// pops up at the right time. Reminders when the app is fully closed need a server
// (push notifications); that comes later together with sign-in.

import { getState, subscribe, update, todayISO } from './store.js'

let timers = []
let onRemind = () => {}

export const canNotify = () => 'Notification' in window
export const permission = () => (canNotify() ? Notification.permission : 'unsupported')

export async function askPermission() {
  if (!canNotify()) return 'unsupported'
  return Notification.requestPermission()
}

async function show(ev) {
  const body = ev.time ? `${ev.time} · ${ev.title}` : ev.title
  onRemind(ev)
  if (permission() !== 'granted') return
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) reg.showNotification('Alcove', { body, icon: 'icons/icon-192.png', tag: ev.id })
    else new Notification('Alcove', { body, icon: 'icons/icon-192.png' })
  } catch { /* some browsers block notifications from pages */ }
}

function schedule() {
  timers.forEach(clearTimeout)
  timers = []
  const now = Date.now()
  getState().events.forEach((ev) => {
    if (!ev.remind || ev.notified || !ev.time) return
    const at = new Date(`${ev.date}T${ev.time}`).getTime()
    const wait = at - now
    if (wait < -10 * 60 * 1000) return            // more than 10 minutes late: skip
    if (wait > 24 * 60 * 60 * 1000) return        // more than a day away: scheduled later
    timers.push(setTimeout(() => { update('events', ev.id, { notified: true }); show(ev) }, Math.max(0, wait)))
  })
}

export function startReminders(callback) {
  onRemind = callback
  schedule()
  subscribe(schedule)
  setInterval(schedule, 60 * 60 * 1000)
}

export const upcoming = (limit = 3) => {
  const now = new Date()
  const today = todayISO(now)
  const hhmm = now.toTimeString().slice(0, 5)
  return getState().events
    .filter((e) => e.date > today || (e.date === today && (!e.time || e.time >= hhmm)))
    .sort((a, b) => (a.date + (a.time || '99')).localeCompare(b.date + (b.time || '99')))
    .slice(0, limit)
}
