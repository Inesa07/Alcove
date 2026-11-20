// Habits: small things you want to do every day. Each day you do one, you tick it.
// The plant in your room grows and blooms when you keep your habits.

import { getState, setField, todayISO, uid } from './store.js'
import { addDays } from './ui.js'

export const HABIT_IDEAS = [
  ['💧', 'Drink water'], ['🌙', 'Sleep 8 hours'], ['🚶', 'Go for a walk'], ['📖', 'Read 20 minutes'],
  ['🧘', 'Stretch'], ['📵', 'No phone before bed'], ['🍎', 'Eat fruit'], ['✍️', 'Write 3 good things'],
]
export const HABIT_ICONS = ['💧', '🌙', '🚶', '📖', '🧘', '📵', '🍎', '✍️', '🎧', '🌿', '🏃', '🦷', '☀️', '💊', '🎨', '🧹']
export const HABIT_COLORS = ['#9FCBB0', '#8FB3D9', '#F2C66D', '#E98AA0', '#B9A3E0', '#E7A27C']

const track = (name, props) => window.dispatchEvent(new CustomEvent('planner:track', { detail: { name, props } }))
export const habits = () => getState().habits || []
const save = (list) => setField({ habits: list })

export function addHabit(name, icon) {
  const list = habits()
  save([...list, { id: uid(), name: name.trim().slice(0, 40), icon, color: HABIT_COLORS[list.length % HABIT_COLORS.length], days: {}, createdOn: todayISO() }])
  track('habit_added', { idea: HABIT_IDEAS.some(([, n]) => n === name) })
}
export function removeHabit(id) { save(habits().filter((h) => h.id !== id)) }
export function renameHabit(id, name, icon) { save(habits().map((h) => (h.id === id ? { ...h, name: name.trim().slice(0, 40) || h.name, icon: icon || h.icon } : h))) }

export function toggleDay(id, day = todayISO()) {
  let on = false
  save(habits().map((h) => {
    if (h.id !== id) return h
    const days = { ...h.days }
    if (days[day]) delete days[day]; else { days[day] = true; on = true }
    return { ...h, days }
  }))
  if (on) track('habit_done', { today: day === todayISO() })
  return on
}

// days in a row up to today (today can still be open)
export function streakOf(h) {
  let d = todayISO(), n = 0
  if (!h.days[d]) d = addDays(d, -1)
  while (h.days[d]) { n++; d = addDays(d, -1) }
  return n
}

// how many ticks in the last 7 days, over all habits
export function weekTicks() {
  const t = todayISO()
  let n = 0
  for (const h of habits()) for (let i = 0; i < 7; i++) if (h.days[addDays(t, -i)]) n++
  return n
}
// what the plant shows: extra leaves and flowers
export function plantGrowth() {
  if (!habits().length) return { leaves: 0, bloom: 0 }
  const n = weekTicks()
  return { leaves: Math.min(5, Math.floor(n / 3)), bloom: Math.min(6, Math.floor(n / 4)) }
}
