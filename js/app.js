import { getState, subscribe, add, remove, update, toggleTask, streak, todayISO, setName } from './store.js'
import { classify } from './classify.js'
import { roomSVG, SPOTS, timeOfDay } from './room.js'

const $ = (sel) => document.querySelector(sel)
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const ui = { spot: 'desk', view: 'room', flash: '', query: '' }

const GREETING = { morning: 'Good morning', day: 'Good afternoon', evening: 'Good evening', night: 'Good night' }
const PLACED = { desk: 'Put on your desk', board: 'Pinned to your corkboard', shelf: 'Added to your bookshelf', bed: 'Written in your diary' }

/* ---------- small helpers ---------- */

function dayLabel(iso) {
  const today = todayISO()
  const d = new Date()
  d.setDate(d.getDate() + 1)
  if (iso === today) return 'Today'
  if (iso === todayISO(d)) return 'Tomorrow'
  return new Date(iso + 'T12:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

const byTime = (a, b) => (a.date + (a.time || '99')).localeCompare(b.date + (b.time || '99'))

function taskRow(t, meta) {
  return `<li class="row ${t.done ? 'done' : ''}">
    <button class="check" data-toggle="${t.id}" aria-label="${t.done ? 'Mark not done' : 'Mark done'}: ${esc(t.text)}"><span></span></button>
    <span class="row-text">${esc(t.text)}</span>
    <span class="row-meta">${esc(meta)}</span>
    <button class="remove" data-remove="tasks:${t.id}" aria-label="Delete: ${esc(t.text)}">×</button>
  </li>`
}

function plainRow(kind, item, text, meta = '', cls = '') {
  return `<li class="row">
    <span class="row-text ${cls}">${esc(text)}</span>
    ${meta ? `<span class="row-meta">${esc(meta)}</span>` : ''}
    <button class="remove" data-remove="${kind}:${item.id}" aria-label="Delete: ${esc(text)}">×</button>
  </li>`
}

const head = (title, sub) => `<div class="sheet-head"><h2>${esc(title)}</h2><span>${esc(sub)}</span></div>`
const empty = (text) => `<p class="empty">${text}</p>`

/* ---------- panels for each object in the room ---------- */

const PANELS = {
  desk(s) {
    const today = todayISO()
    const todays = s.tasks.filter((t) => t.date === today).sort(byTime)
    const late = s.tasks.filter((t) => t.date < today && !t.done).sort(byTime)
    const next = s.tasks.filter((t) => t.date > today).sort(byTime).slice(0, 5)
    const left = todays.filter((t) => !t.done).length
    let html = head('Desk', todays.length ? `${left} of ${todays.length} left today` : 'Sticky notes for today')
    if (!todays.length && !late.length && !next.length) {
      return html + empty('Your desk is clear. Write a task above, for example “call grandma tomorrow 18:00”.')
    }
    if (late.length) html += `<p class="group-title">From earlier</p><ul class="rows">${late.map((t) => taskRow(t, dayLabel(t.date))).join('')}</ul>`
    if (todays.length) html += `<p class="group-title">Today</p><ul class="rows">${todays.map((t) => taskRow(t, t.time)).join('')}</ul>`
    if (next.length) html += `<p class="group-title">Coming up</p><ul class="rows">${next.map((t) => taskRow(t, dayLabel(t.date) + (t.time ? ', ' + t.time : ''))).join('')}</ul>`
    return html
  },

  board(s) {
    let html = head('Corkboard', s.notes.length ? `${s.notes.length} ideas and notes` : 'Ideas and notes')
    if (!s.notes.length) return html + empty('Pin your first idea. Start with “idea:” and it lands here, sorted by topic.')
    const tags = [...new Set(s.notes.map((n) => n.tag))]
    tags.forEach((tag) => {
      html += `<p class="group-title">${esc(tag)}</p><ul class="rows">${s.notes.filter((n) => n.tag === tag).map((n) => plainRow('notes', n, n.text)).join('')}</ul>`
    })
    return html
  },

  shelf(s) {
    const read = s.books.filter((b) => b.status === 'read').length
    let html = head('Bookshelf', s.books.length ? `${read} of ${s.books.length} read` : 'Your books')
    if (!s.books.length) return html + empty('Add a book with “read” and its title, for example “read The Little Prince”.')
    const label = { want: 'Want to read', reading: 'Reading', read: 'Read' }
    html += `<ul class="rows">${s.books.map((b) => `<li class="row">
      <span class="row-text">${esc(b.title)}</span>
      <button class="chip" data-book="${b.id}" aria-label="Change status of ${esc(b.title)}, now ${label[b.status]}">${label[b.status]}</button>
      <button class="remove" data-remove="books:${b.id}" aria-label="Delete: ${esc(b.title)}">×</button>
    </li>`).join('')}</ul>`
    return html
  },

  bed(s) {
    let html = head('Diary', 'Your thoughts, day by day')
    if (!s.diary.length) return html + empty('Write how your day felt, or one thought you want to keep. Anything that is not a task, idea or book goes here.')
    const dates = [...new Set(s.diary.map((d) => d.date))]
    dates.forEach((date) => {
      html += `<p class="group-title">${esc(dayLabel(date))}</p><ul class="rows">${s.diary.filter((d) => d.date === date).map((d) => plainRow('diary', d, d.text, '', 'diary')).join('')}</ul>`
    })
    return html
  },

  window() {
    const tod = timeOfDay()
    const words = { morning: 'Morning light', day: 'Bright day', evening: 'Sunset', night: 'Starry night' }
    return head('Window', words[tod]) +
      empty('The light in your room follows the real time of day. In the morning the sun rises, in the evening the lamp and string lights turn on.') +
      empty('Soon the window will also show the real weather where you are.')
  },

  plant() {
    const n = streak()
    const sub = n === 1 ? '1 day in a row' : `${n} days in a row`
    return head('Plant', sub) +
      empty(n ? 'Your plant grows a new leaf for every day in a row that you finish at least one task.' : 'Finish one task today and your plant grows its first new leaf.')
  },
}

/* ---------- other views from the menu ---------- */

const VIEWS = {
  week(s) {
    const today = new Date()
    let html = head('Week', 'The next 7 days')
    let any = false
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const iso = todayISO(d)
      const list = s.tasks.filter((t) => t.date === iso).sort(byTime)
      if (!list.length) continue
      any = true
      html += `<p class="group-title">${esc(dayLabel(iso))}</p><ul class="rows">${list.map((t) => taskRow(t, t.time)).join('')}</ul>`
    }
    return any ? html : html + empty('Nothing planned this week yet. Try “dentist Wednesday 11:00”.')
  },

  notes(s) {
    return PANELS.board(s).replace('<h2>Corkboard</h2>', '<h2>Notes</h2>')
  },

  search(s) {
    const q = ui.query.trim().toLowerCase()
    let html = head('Search', 'Everything you wrote') +
      `<label for="search" class="sr-only">Search</label><input id="search" class="search-box" type="search" placeholder="Search tasks, notes, books, diary" value="${esc(ui.query)}">`
    if (!q) return html + empty('Type a word, for example “math” or “gift”.')
    const hit = (t) => t.toLowerCase().includes(q)
    const rows = [
      ...s.tasks.filter((t) => hit(t.text)).map((t) => taskRow(t, dayLabel(t.date))),
      ...s.notes.filter((n) => hit(n.text)).map((n) => plainRow('notes', n, n.text, n.tag)),
      ...s.books.filter((b) => hit(b.title)).map((b) => plainRow('books', b, b.title, 'Book')),
      ...s.diary.filter((d) => hit(d.text)).map((d) => plainRow('diary', d, d.text, dayLabel(d.date), 'diary')),
    ]
    return html + (rows.length ? `<ul class="rows">${rows.join('')}</ul>` : empty('Nothing found. Try another word.'))
  },
}

/* ---------- render ---------- */

function renderHeader() {
  const now = new Date()
  const s = getState()
  $('#date').textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) +
    ' · ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  $('#greeting').textContent = GREETING[timeOfDay(now)] + (s.name ? ', ' + s.name : '')
  $('#name-form').hidden = !!s.name
}

function renderRoom() {
  const s = getState()
  const today = todayISO()
  $('#room').innerHTML = roomSVG({
    tod: timeOfDay(),
    pendingTasks: s.tasks.filter((t) => !t.done && t.date >= today).length,
    books: s.books.length,
    notes: s.notes.length,
    diaryToday: s.diary.some((d) => d.date === today),
    leaves: 2 + streak(),
  }) + SPOTS.map((sp) => `<button class="spot ${ui.flash === sp.id ? 'flash' : ''}" data-spot="${sp.id}"
      aria-label="Open ${sp.name}" aria-pressed="${ui.view === 'room' && ui.spot === sp.id}"
      style="left:${sp.l}%;top:${sp.t}%;width:${sp.w}%;height:${sp.h}%"></button>`).join('')
}

function renderSheet() {
  const s = getState()
  $('#sheet').innerHTML = ui.view === 'room' ? PANELS[ui.spot](s) : VIEWS[ui.view](s)
  document.querySelectorAll('#nav button').forEach((b) => {
    if (b.dataset.view === ui.view) b.setAttribute('aria-current', 'page')
    else b.removeAttribute('aria-current')
  })
}

function render() {
  renderHeader()
  renderRoom()
  renderSheet()
}

let toastTimer
function toast(text) {
  const el = $('#toast')
  el.textContent = text
  el.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { el.hidden = true; ui.flash = ''; renderRoom() }, 2600)
}

/* ---------- events ---------- */

$('#capture').addEventListener('submit', (e) => {
  e.preventDefault()
  const input = $('#capture-input')
  const text = input.value.trim()
  if (!text) return
  const { place, kind, item } = classify(text)
  add(kind, item)
  input.value = ''
  ui.view = 'room'
  ui.spot = place
  ui.flash = place
  render()
  toast(PLACED[place])
})

$('#name-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const name = $('#name-input').value.trim()
  if (name) { setName(name); renderHeader() }
})

$('#room').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-spot]')
  if (!btn) return
  ui.spot = btn.dataset.spot
  ui.view = 'room'
  ui.flash = ''
  render()
})

$('#nav').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-view]')
  if (!btn) return
  ui.view = btn.dataset.view
  render()
  if (ui.view === 'search') $('#search')?.focus()
})

$('#sheet').addEventListener('click', (e) => {
  const t = e.target.closest('[data-toggle]')
  if (t) return toggleTask(t.dataset.toggle)
  const r = e.target.closest('[data-remove]')
  if (r) {
    const [kind, id] = r.dataset.remove.split(':')
    return remove(kind, id)
  }
  const b = e.target.closest('[data-book]')
  if (b) {
    const book = getState().books.find((x) => x.id === b.dataset.book)
    const next = { want: 'reading', reading: 'read', read: 'want' }[book.status]
    update('books', book.id, { status: next })
  }
})

$('#sheet').addEventListener('input', (e) => {
  if (e.target.id !== 'search') return
  ui.query = e.target.value
  const pos = e.target.selectionStart
  renderSheet()
  const box = $('#search')
  box.focus()
  box.setSelectionRange(pos, pos)
})

subscribe(() => { renderRoom(); renderSheet() })

// Keep the clock, greeting and sky in step with real time.
setInterval(renderHeader, 30 * 1000)
let lastTod = timeOfDay()
setInterval(() => {
  if (timeOfDay() !== lastTod) { lastTod = timeOfDay(); renderRoom() }
}, 60 * 1000)

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {})
}

render()
