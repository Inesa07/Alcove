// Calendar: see the month or the week, pick a day, write what you need
// to remember and when. Things with a time get a reminder.

import { getState, subscribe, add, update, remove, todayISO } from '../store.js'
import { permission, askPermission } from '../reminders.js'
import { findTime } from '../classify.js'
import { $, esc, addDays, isoToDate, dayLabel } from '../ui.js'

const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const byTime = (a, b) => (a.time || '99').localeCompare(b.time || '99')
const mondayOf = (iso) => { const d = isoToDate(iso); return addDays(iso, -((d.getDay() + 6) % 7)) }

export function mount(el) {
  let mode = 'month'
  let selected = todayISO()
  let cursor = selected // any day inside the month or week on screen

  el.innerHTML = `
    <section class="cal-page">
      <header class="page-head">
        <div class="cal-title">
          <button class="icon-btn" data-step="-1" aria-label="Previous">‹</button>
          <h2 id="c-title"></h2>
          <button class="icon-btn" data-step="1" aria-label="Next">›</button>
        </div>
        <div class="seg" role="radiogroup" aria-label="View">
          <button role="radio" data-mode="month">Month</button>
          <button role="radio" data-mode="week">Week</button>
        </div>
      </header>
      <div class="cal-layout">
        <div class="cal-grid-wrap" id="c-grid"></div>
        <aside class="day-card" id="c-day"></aside>
      </div>
    </section>`

  function eventsOn(iso) { return getState().events.filter((e) => e.date === iso).sort(byTime) }

  function renderGrid() {
    const today = todayISO()
    $('#c-title', el).textContent = mode === 'month'
      ? isoToDate(cursor).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      : `Week of ${isoToDate(mondayOf(cursor)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`
    el.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === mode)))

    let days
    if (mode === 'month') {
      const first = cursor.slice(0, 8) + '01'
      const start = mondayOf(first)
      days = Array.from({ length: 42 }, (_, i) => addDays(start, i))
      const lastNeeded = days.findIndex((d, i) => i % 7 === 0 && d.slice(0, 7) > cursor.slice(0, 7))
      if (lastNeeded > 0) days = days.slice(0, lastNeeded)
    } else {
      const start = mondayOf(cursor)
      days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    }

    const cell = (iso) => {
      const evs = eventsOn(iso)
      const out = mode === 'month' && iso.slice(0, 7) !== cursor.slice(0, 7)
      const max = mode === 'month' ? 2 : 8
      return `<button class="day ${iso === today ? 'today' : ''} ${iso === selected ? 'sel' : ''} ${out ? 'out' : ''}" data-date="${iso}"
          aria-label="${esc(dayLabel(iso))}${evs.length ? ', ' + evs.length + ' planned' : ''}" aria-pressed="${iso === selected}">
        <span class="dn">${mode === 'week' ? WD[(isoToDate(iso).getDay() + 6) % 7] + ' ' : ''}${isoToDate(iso).getDate()}</span>
        ${evs.slice(0, max).map((e) => `<span class="ev">${e.time ? `<b>${e.time}</b> ` : ''}${esc(e.title)}</span>`).join('')}
        ${evs.length > max ? `<span class="more">+${evs.length - max} more</span>` : ''}
      </button>`
    }
    $('#c-grid', el).innerHTML = `
      <div class="cal-grid ${mode}">
        ${mode === 'month' ? WD.map((w) => `<span class="wd">${w}</span>`).join('') : ''}
        ${days.map(cell).join('')}
      </div>`
  }

  function renderDay() {
    if (!$('#c-day', el)) return // the page was closed
    const evs = eventsOn(selected)
    const perm = permission()
    const askBanner = perm === 'default'
      ? `<div class="notify-ask"><p>Turn on reminders so I can tell you when it is time.</p><button class="primary small" data-allow>Turn on reminders</button></div>`
      : perm === 'denied'
        ? `<p class="muted small-note">Reminders are blocked in this browser. You can allow them in the site settings.</p>`
        : ''
    $('#c-day', el).innerHTML = `
      <h3>${esc(isoToDate(selected).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }))}</h3>
      <p class="muted">${['Today', 'Tomorrow', 'Yesterday'].includes(dayLabel(selected)) ? dayLabel(selected) : isoToDate(selected).getFullYear()}</p>
      <form class="ev-form" id="c-form" autocomplete="off">
        <label for="c-what" class="sr-only">What to remember</label>
        <input id="c-what" placeholder="What do you need to remember?" required>
        <div class="ev-when">
          <label class="when-field">Date<input id="c-date" type="date" value="${selected}" required></label>
          <label class="when-field">Time<input id="c-time" type="time"></label>
        </div>
        <div class="ev-row">
          <label class="check-field"><input id="c-remind" type="checkbox" checked> Remind me</label>
          <button class="primary small" type="submit">Add</button>
        </div>
      </form>
      ${askBanner}
      <ul class="ev-list">
        ${evs.length ? evs.map((e) => `<li>
          <span class="ev-time">${e.time || 'All day'}</span>
          <span class="ev-title">${esc(e.title)}</span>
          <button class="bell ${e.remind && e.time ? 'on' : ''}" data-bell="${e.id}" aria-pressed="${!!(e.remind && e.time)}" aria-label="${e.remind ? 'Turn off reminder' : 'Turn on reminder'}" title="${e.time ? (e.remind ? 'Reminder on' : 'Reminder off') : 'Add a time to get a reminder'}" ${e.time ? '' : 'disabled'}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <button class="ev-del" data-del="${e.id}" aria-label="Delete ${esc(e.title)}">×</button>
        </li>`).join('') : `<li class="muted empty-day">Nothing on this day yet.</li>`}
      </ul>`
  }

  function render() { renderGrid(); renderDay() }

  el.addEventListener('click', async (e) => {
    const t = e.target
    const step = t.closest('[data-step]')
    if (step) {
      const n = Number(step.dataset.step)
      if (mode === 'month') { const d = isoToDate(cursor); d.setDate(1); d.setMonth(d.getMonth() + n); cursor = todayISO(d) } else cursor = addDays(cursor, 7 * n)
      return renderGrid()
    }
    const m = t.closest('[data-mode]')
    if (m) { mode = m.dataset.mode; cursor = selected; return renderGrid() }
    const day = t.closest('[data-date]')
    if (day) { selected = day.dataset.date; render(); $('#c-what', el)?.focus(); return }
    if (t.closest('[data-allow]')) { await askPermission(); return renderDay() }
    const bell = t.closest('[data-bell]')
    if (bell) { const ev = getState().events.find((x) => x.id === bell.dataset.bell); return update('events', ev.id, { remind: !ev.remind, notified: false }) }
    const del = t.closest('[data-del]')
    if (del) return remove('events', del.dataset.del)
  })

  el.addEventListener('submit', (e) => {
    if (e.target.id !== 'c-form') return
    e.preventDefault()
    const title = $('#c-what', el).value.trim()
    if (!title) return
    const time = $('#c-time', el).value || findTime(title)
    const date = $('#c-date', el).value || selected
    add('events', { title, date, time, remind: !!time && $('#c-remind', el).checked, notified: false })
    if (date !== selected) {
      selected = date
      cursor = date
      render()
    }
    if (time && $('#c-remind', el).checked && permission() === 'default') askPermission().then(renderDay)
  })

  render()
  return subscribe(render)
}
