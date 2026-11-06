// The owner's page: how people use the app. Only the owner's account can read these numbers
// (the database itself refuses everyone else), and they never include anything people write.

import * as sync from '../sync.js'
import { OWNER_EMAIL } from '../config.js'
import { THEMES, roomTheme } from '../room.js'
import { $, esc } from '../ui.js'

const day = (t) => new Date(t).toISOString().slice(0, 10)
const addD = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }

function bars(rows, total) {
  const max = Math.max(1, ...rows.map(([, n]) => n))
  return `<ul class="ad-bars">${rows.map(([label, n]) => `<li><span>${esc(label)}</span><i style="width:${(n / max) * 100}%"></i><b>${n}${total ? ` · ${Math.round((n / total) * 100)}%` : ''}</b></li>`).join('')}</ul>`
}

export function mount(el) {
  el.innerHTML = `<section class="admin"><header class="page-head"><div><h2>Your app</h2><p>How people use Alcove. Only you can see this page.</p></div></header><div id="ad-body"><p class="muted">Loading…</p></div></section>`
  const body = $('#ad-body', el)
  const me = sync.currentUser()
  if (!me || me.email !== OWNER_EMAIL) { body.innerHTML = '<p class="muted">This page is only for the owner of the app.</p>'; return }

  ;(async () => {
    try {
      const c = await sync.getClient()
      const since = new Date(Date.now() - 90 * 864e5).toISOString()
      const { data, error } = await c.from('app_events').select('user_id, name, props, created_at').gte('created_at', since).order('created_at').limit(20000)
      if (error) throw error
      if (!body.isConnected) return
      const today = day(Date.now())
      const users = new Map() // user -> { first, days:Set }
      data.forEach((e) => {
        const u = users.get(e.user_id) || { first: day(e.created_at), days: new Set() }
        u.days.add(day(e.created_at))
        users.set(e.user_id, u)
      })
      const active = (from) => [...users.values()].filter((u) => [...u.days].some((d) => d >= from)).length
      const dau = active(today), wau = active(addD(today, -6)), mau = active(addD(today, -29))
      const ret = (n) => {
        const cohort = [...users.values()].filter((u) => u.first <= addD(today, -n))
        const back = cohort.filter((u) => [...u.days].some((d) => d >= addD(u.first, n)))
        return cohort.length ? `${Math.round((back.length / cohort.length) * 100)}%` : '—'
      }
      const count = (name, key) => { const m = new Map(); data.filter((e) => e.name === name).forEach((e) => { const k = e.props?.[key] || '—'; m.set(k, (m.get(k) || 0) + 1) }); return [...m].sort((a, b) => b[1] - a[1]) }
      const usersWith = (pred) => new Set(data.filter(pred).map((e) => e.user_id)).size
      const lastRoom = new Map(); data.filter((e) => e.name === 'room' || e.name === 'onboarding_done').forEach((e) => e.props?.theme && lastRoom.set(e.user_id, e.props.theme))
      const rooms = [...Object.keys(THEMES)].map((t) => [THEMES[t].name, [...lastRoom.values()].filter((x) => roomTheme(x) === t).length])
      const newPerDay = Array.from({ length: 14 }, (_, i) => { const d = addD(today, i - 13); return [d.slice(5), [...users.values()].filter((u) => u.first === d).length] })
      const funnel = [['Started', usersWith((e) => e.name === 'onboarding_step' && e.props?.step === 1)], ['Chose a name', usersWith((e) => e.name === 'onboarding_step' && e.props?.step === 2)], ['Chose a room', usersWith((e) => e.name === 'onboarding_step' && e.props?.step === 3)], ['Finished', usersWith((e) => e.name === 'onboarding_done')]]
      body.innerHTML = `
        <div class="ad-cards">
          <div><b>${users.size}</b><span>people (last 90 days)</span></div>
          <div><b>${dau}</b><span>active today</span></div>
          <div><b>${wau}</b><span>active this week</span></div>
          <div><b>${mau}</b><span>active this month</span></div>
          <div><b>${ret(1)}</b><span>came back the next day</span></div>
          <div><b>${ret(7)}</b><span>came back after a week</span></div>
        </div>
        <div class="ad-grid">
          <section><h3>New people per day</h3>${bars(newPerDay)}</section>
          <section><h3>Pages people open</h3>${bars(count('view', 'page'))}</section>
          <section><h3>Rooms people live in</h3>${bars(rooms, lastRoom.size)}</section>
          <section><h3>Things people add</h3>${bars(count('added', 'kind'))}</section>
          <section><h3>Welcome steps</h3>${bars(funnel)}</section>
          <section><h3>Diary days written</h3><p class="ad-big">${data.filter((e) => e.name === 'diary_day').length}</p></section>
        </div>`
    } catch (err) {
      if (body.isConnected) body.innerHTML = `<p class="muted">Could not load the numbers: ${esc(err.message || '')}. Did you run <code>supabase/analytics.sql</code> in Supabase?</p>`
    }
  })()
}
