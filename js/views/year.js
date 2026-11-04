// "Your year": a few cards that tell the story of your year in Planner, like a yearly wrap-up.
// Everything is counted here on your device from your own data.

import { getState, MOODS, todayISO } from '../store.js'
import { drawRoom, THEMES, DEFAULT_ROOM } from '../room.js'
import { $, esc } from '../ui.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function longestRun(days) {
  const set = new Set(days)
  let best = 0
  days.forEach((d) => {
    const prev = new Date(d + 'T12:00'); prev.setDate(prev.getDate() - 1)
    if (set.has(todayISO(prev))) return // not the start of a run
    let n = 0
    const c = new Date(d + 'T12:00')
    while (set.has(todayISO(c))) { n++; c.setDate(c.getDate() + 1) }
    best = Math.max(best, n)
  })
  return best
}

export function stats(year = new Date().getFullYear()) {
  const s = getState(), y = String(year)
  const days = s.diaryDays.filter((d) => d.startsWith(y))
  const books = s.books.filter((b) => (b.status || 'done') === 'done' && (b.finishedOn || '').startsWith(y))
  const minutes = s.books.reduce((m, b) => m + (b.minutes || 0), 0)
  const pagesRead = books.reduce((m, b) => m + (b.pages || 0), 0)
  const best = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]
  const authors = {}
  books.forEach((b) => b.author && (authors[b.author] = (authors[b.author] || 0) + 1))
  const topAuthor = Object.entries(authors).sort((a, b) => b[1] - a[1])[0]
  const moods = Object.entries(s.moods || {}).filter(([d]) => d.startsWith(y))
  const moodCount = MOODS.map((m) => moods.filter(([, v]) => v === m.v).length)
  const topMood = moodCount.some(Boolean) ? MOODS[moodCount.indexOf(Math.max(...moodCount))] : null
  const events = s.events.filter((e) => e.date.startsWith(y))
  const perMonth = Array.from({ length: 12 }, (_, i) => events.filter((e) => Number(e.date.slice(5, 7)) === i + 1).length)
  const busiest = Math.max(...perMonth) ? perMonth.indexOf(Math.max(...perMonth)) : -1
  const writeMonth = Array.from({ length: 12 }, (_, i) => days.filter((d) => Number(d.slice(5, 7)) === i + 1).length)
  return {
    year, days: days.length, run: longestRun(days), writeMonth, kept: (s.diaryBook.hearts || []).length,
    books: books.length, minutes, pagesRead, best, topAuthor, reading: s.books.filter((b) => b.status === 'reading'),
    moods: Object.fromEntries(moods), moodCount, topMood,
    events: events.length, busiest, notes: s.notes.length, fromFriends: s.notes.filter((n) => n.from).length,
    room: s.room,
  }
}

const hours = (m) => m >= 60 ? `${Math.round(m / 60)} hours` : `${m} minutes`

function cards(t) {
  const name = getState().name
  const list = []
  list.push(`<div class="yr-big">${t.year}</div><h2>${name ? esc(name) + ', this' : 'This'} was your year</h2><p>Tap to see it, one little card at a time.</p>`)
  list.push(`<p class="yr-kicker">Your diary</p><div class="yr-num">${t.days}</div><h2>${t.days === 1 ? 'day' : 'days'} you wrote or drew</h2>
    ${t.run > 1 ? `<p>Your longest streak was <b>${t.run} days</b> in a row. Your plant loved it.</p>` : '<p>Every page is a small piece of your year.</p>'}
    <div class="yr-bars">${t.writeMonth.map((n, i) => `<i style="--h:${(n / Math.max(1, ...t.writeMonth)) * 100}%" title="${MONTHS[i]}: ${n}"><span>${MONTHS[i][0]}</span></i>`).join('')}</div>
    ${t.kept ? `<p class="yr-small">♥ ${t.kept} ${t.kept === 1 ? 'page' : 'pages'} in your memory chest</p>` : ''}`)
  list.push(`<p class="yr-kicker">Your books</p><div class="yr-num">${t.books}</div><h2>${t.books === 1 ? 'book' : 'books'} finished</h2>
    ${t.pagesRead ? `<p>That is about <b>${t.pagesRead.toLocaleString('en-GB')} pages</b>.</p>` : ''}
    ${t.minutes ? `<p>You spent <b>${hours(t.minutes)}</b> reading with the timer.</p>` : ''}
    ${t.best ? `<p class="yr-quote">Your favourite: <b>${esc(t.best.title)}</b>${t.best.author ? ` by ${esc(t.best.author)}` : ''}${t.best.rating ? ` <span class="yr-stars">${'★'.repeat(t.best.rating)}</span>` : ''}</p>` : ''}
    ${t.topAuthor && t.topAuthor[1] > 1 ? `<p class="yr-small">You read ${esc(t.topAuthor[0])} the most</p>` : ''}`)
  if (t.topMood) {
    const start = new Date(t.year, 0, 1)
    const n = (t.year % 4 === 0 ? 366 : 365)
    const cells = Array.from({ length: n }, (_, i) => { const d = new Date(start); d.setDate(i + 1); const v = t.moods[todayISO(d)]; return `<i style="${v ? `background:${MOODS[v - 1].c}` : ''}"></i>` }).join('')
    list.push(`<p class="yr-kicker">How you felt</p><h2>Most days you felt <span class="yr-pill" style="background:${t.topMood.c}">${t.topMood.name.toLowerCase()}</span></h2>
      <div class="yr-mosaic">${cells}</div>
      <div class="yr-legend">${MOODS.map((m, i) => t.moodCount[i] ? `<span><i style="background:${m.c}"></i>${m.name} ${t.moodCount[i]}</span>` : '').join('')}</div>`)
  }
  list.push(`<p class="yr-kicker">Your plans</p><div class="yr-num">${t.events}</div><h2>things in your calendar</h2>
    ${t.busiest >= 0 ? `<p>Your busiest month was <b>${MONTHS[t.busiest]}</b>.</p>` : ''}
    <p>${t.notes} ${t.notes === 1 ? 'note' : 'notes'} on your board${t.fromFriends ? `, ${t.fromFriends} from friends ♥` : ''}.</p>`)
  const room = drawRoom({ room: { ...DEFAULT_ROOM, ...t.room }, tod: 'evening', books: Math.max(t.books, 4), notes: 3, events: 1, leaves: 3 + Math.min(t.run, 12) }).svg
  list.push(`<p class="yr-kicker">Your room</p><div class="yr-room">${room}</div><h2>Thank you for this year</h2><p>See you in ${t.year + 1} in your ${(THEMES[t.room.theme] || THEMES.cozy).name.toLowerCase()}.</p>`)
  return list
}

export function mount(el) {
  const t = stats()
  const list = cards(t)
  let i = 0
  el.innerHTML = `<section class="year-page">
    <div class="yr-progress">${list.map(() => '<i><b></b></i>').join('')}</div>
    <a class="yr-close" href="#room" aria-label="Close">×</a>
    <div class="yr-card" id="yr-card" aria-live="polite"></div>
    <div class="yr-nav"><button class="yr-prev" data-step="-1" aria-label="Back">‹</button><button class="yr-next" data-step="1" aria-label="Next">›</button></div>
  </section>`
  const paint = () => {
    $('#yr-card', el).innerHTML = `<div class="yr-in yr-c${i % 4}">${list[i]}</div>`
    el.querySelectorAll('.yr-progress i').forEach((b, k) => b.classList.toggle('done', k <= i))
    $('.yr-prev', el).hidden = i === 0
    $('.yr-next', el).textContent = i === list.length - 1 ? '↺' : '›'
  }
  const step = (d) => { i = (i + d + list.length) % list.length; paint() }
  el.addEventListener('click', (e) => {
    const s = e.target.closest('[data-step]')
    if (s) return step(Number(s.dataset.step))
    if (e.target.closest('.yr-card')) step(1)
  })
  const key = (e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) }
  document.addEventListener('keydown', key)
  window.dispatchEvent(new CustomEvent('planner:track', { detail: { name: 'year_opened' } }))
  paint()
  return () => document.removeEventListener('keydown', key)
}
