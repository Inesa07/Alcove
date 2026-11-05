// "Your year": a few cards that tell the story of your year in Planner, like a yearly wrap-up.
// Everything is counted here on your device from your own data.

import { getState, MOODS, todayISO } from '../store.js'
import { drawRoom, THEMES, DEFAULT_ROOM, roomTheme } from '../room.js'
import { $, esc, moodFace } from '../ui.js'

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
  const wd = [0, 0, 0, 0, 0, 0, 0]
  days.forEach((d) => wd[(new Date(d + 'T12:00').getDay() + 6) % 7]++)
  const favDay = Math.max(...wd) ? ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'][wd.indexOf(Math.max(...wd))] : ''
  // the average mood of each month, to see how the year felt
  const moodMonth = Array.from({ length: 12 }, (_, i) => {
    const v = moods.filter(([d]) => Number(d.slice(5, 7)) === i + 1).map(([, x]) => x)
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0
  })
  const quotes = s.books.flatMap((b) => (b.quotes || []).filter((q) => new Date(q.at).getFullYear() === year).map((q) => ({ ...q, book: b.title })))
  return {
    year, days: days.length, run: longestRun(days), writeMonth, kept: (s.diaryBook.hearts || []).length,
    books: books.length, minutes, pagesRead, best, topAuthor, reading: s.books.filter((b) => b.status === 'reading'),
    moods: Object.fromEntries(moods), moodCount, topMood,
    events: events.length, busiest, notes: s.notes.length, fromFriends: s.notes.filter((n) => n.from).length,
    room: s.room, favDay, moodMonth, quote: quotes[0], quotes: quotes.length,
  }
}

const hours = (m) => m >= 120 ? `${Math.round(m / 60)} hours` : `${m} minutes`
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`
const count = (n, cls = 'yr-num') => `<div class="${cls}" data-count="${n}">0</div>`
const moodOf = (avg) => MOODS[Math.max(0, Math.round(avg) - 1)]

// a small title for the year, from what you did most
function persona(t) {
  const score = [
    ['The Bookworm', 'You lived in stories this year.', '📚', t.books * 3 + t.minutes / 60],
    ['The Storyteller', 'Your diary kept every chapter of your days.', '✍️', t.days],
    ['The Planner', 'You always knew what came next.', '🗓️', t.events * 0.8],
    ['The Sunshine', 'Most of your days were good ones.', '☀️', t.topMood && t.topMood.v >= 4 ? t.moodCount[3] + t.moodCount[4] : 0],
  ].sort((a, b) => b[3] - a[3])[0]
  return score[3] > 0 ? score : ['The Beginner', 'Every great year starts with a first page.', '🌱', 0]
}

function cards(t) {
  const name = getState().name
  const list = []
  const p = persona(t)
  list.push({ cls: 'c0', art: 'stars', html: `<p class="yr-kicker">Planner · your year</p><div class="yr-big">${t.year}</div><h2>${name ? esc(name) + ', this' : 'This'} was your year</h2><p>Sit back. Here is your year, one card at a time.</p>` })
  list.push({ cls: 'c1', art: 'pen', html: `<p class="yr-kicker">Your diary</p>${count(t.days)}<h2>${t.days === 1 ? 'day' : 'days'} you wrote or drew</h2>
    ${t.run > 1 ? `<p>Your longest streak: <b>${t.run} days</b> in a row.</p>` : '<p>Every page is a small piece of your year.</p>'}
    <div class="yr-bars">${t.writeMonth.map((n, i) => `<i style="--h:${(n / Math.max(1, ...t.writeMonth)) * 100}%;--d:${i * 50}ms" title="${MONTHS[i]}: ${n}"><span>${MONTHS[i][0]}</span></i>`).join('')}</div>
    ${t.favDay ? `<p class="yr-small">You wrote most on <b>${t.favDay}</b>${t.kept ? ` · ♥ ${plural(t.kept, 'page', 'pages')} in Memories` : ''}</p>` : ''}` })
  list.push({ cls: 'c2', art: 'books', html: `<p class="yr-kicker">Your books</p>${count(t.books)}<h2>${t.books === 1 ? 'book' : 'books'} finished</h2>
    <div class="yr-spines">${getState().books.filter((b) => (b.status || 'done') === 'done' && (b.finishedOn || '').startsWith(String(t.year))).slice(0, 14).map((b, i) => `<i style="background:${esc(b.color || '#8E7CC3')};height:${70 + ((i * 37) % 30)}px;--d:${i * 70}ms" title="${esc(b.title)}"></i>`).join('')}</div>
    ${t.pagesRead ? `<p>About <b>${t.pagesRead.toLocaleString('en-GB')} pages</b>${t.minutes ? ` and <b>${hours(t.minutes)}</b> with the reading timer` : ''}.</p>` : t.minutes ? `<p><b>${hours(t.minutes)}</b> with the reading timer.</p>` : ''}
    ${t.topAuthor && t.topAuthor[1] > 1 ? `<p class="yr-small">Your author of the year: <b>${esc(t.topAuthor[0])}</b></p>` : ''}` })
  if (t.best) list.push({ cls: 'c3', art: 'star', html: `<p class="yr-kicker">Book of the year</p><div class="yr-book" style="--c:${esc(t.best.color || '#8E7CC3')}"><b>${esc(t.best.title)}</b>${t.best.author ? `<span>${esc(t.best.author)}</span>` : ''}</div>
    ${t.best.rating ? `<p class="yr-stars">${'★'.repeat(t.best.rating)}</p>` : ''}${t.best.review ? `<p class="yr-quote">“${esc(t.best.review.slice(0, 160))}”</p>` : '<p>The one you loved most.</p>'}` })
  if (t.quote) list.push({ cls: 'c0', art: 'quote', html: `<p class="yr-kicker">A line you kept</p><p class="yr-bigquote">“${esc(t.quote.text.slice(0, 220))}”</p><p class="yr-small">from <b>${esc(t.quote.book)}</b>${t.quotes > 1 ? ` · one of ${t.quotes} quotes you saved` : ''}</p>` })
  if (t.topMood) {
    const start = new Date(t.year, 0, 1)
    const n = (t.year % 4 === 0 ? 366 : 365)
    const cells = Array.from({ length: n }, (_, i) => { const d = new Date(start); d.setDate(i + 1); const v = t.moods[todayISO(d)]; return `<i style="${v ? `background:${MOODS[v - 1].c};` : ''}--d:${Math.round(i * 3)}ms"></i>` }).join('')
    list.push({ cls: 'c4', art: 'hearts', html: `<p class="yr-kicker">How you felt</p><div class="yr-face">${moodFace(t.topMood.v, t.topMood.c)}</div><h2>Most days you felt <b>${t.topMood.name.toLowerCase()}</b></h2>
      <div class="yr-mosaic">${cells}</div>
      <div class="yr-legend">${MOODS.map((m, i) => t.moodCount[i] ? `<span><i style="background:${m.c}"></i>${m.name} ${t.moodCount[i]}</span>` : '').join('')}</div>` })
    const happiest = t.moodMonth.indexOf(Math.max(...t.moodMonth))
    list.push({ cls: 'c2', art: 'sun', html: `<p class="yr-kicker">Your year in colour</p><h2>Your happiest month was <b>${MONTHS[happiest]}</b></h2>
      <div class="yr-moodline">${t.moodMonth.map((v, i) => `<span><i style="${v ? `background:${moodOf(v).c};height:${20 + v * 14}%` : ''};--d:${i * 60}ms"></i><small>${MONTHS[i][0]}</small></span>`).join('')}</div>` })
  }
  list.push({ cls: 'c1', art: 'cal', html: `<p class="yr-kicker">Your plans</p>${count(t.events)}<h2>${t.events === 1 ? 'thing' : 'things'} in your calendar</h2>
    ${t.busiest >= 0 ? `<p>Your busiest month was <b>${MONTHS[t.busiest]}</b>.</p>` : ''}
    <p>${plural(t.notes, 'note', 'notes')} on your board${t.fromFriends ? `, <b>${t.fromFriends} from friends</b> ♥` : ''}.</p>` })
  list.push({ cls: 'c3', art: 'stars', html: `<p class="yr-kicker">Your year in one word</p><div class="yr-emoji">${p[2]}</div><h2>${p[0]}</h2><p>${p[1]}</p>` })
  const room = drawRoom({ room: { ...DEFAULT_ROOM, ...t.room }, tod: 'evening', books: Math.max(t.books, 4), notes: 3, events: 1, leaves: 3 + Math.min(t.run, 12) }).svg
  list.push({ cls: 'c0', art: 'stars', summary: true, html: `<p class="yr-kicker">${t.year} · ${name ? esc(name) : 'your year'}</p><div class="yr-room">${room}</div>
    <div class="yr-sum"><span><b>${t.days}</b>diary days</span><span><b>${t.books}</b>books</span><span><b>${t.events}</b>plans</span><span><b>${t.topMood ? t.topMood.name : '–'}</b>mood</span></div>
    <h2 class="yr-h-small">${p[0]} ${p[2]}</h2><p>See you in ${t.year + 1} in your ${THEMES[roomTheme(t.room.theme)].name.toLowerCase()}.</p>
    <button class="yr-save" data-save-img>Save as a picture</button>` })
  return list
}

// little shapes floating behind each card
const ART = {
  stars: '✦ ✧ ✦ · ✧', pen: '✎ · ✦ ✧', books: '❘❘ ✦ ❘ ·', star: '★ ✦ ★ ✧', quote: '❝ ✧ ❞ ·', hearts: '♥ ✧ ♥ · ♡', sun: '☀ ✧ ✦ ·', cal: '▦ ✦ · ✧',
}

// the last card as a picture you can keep or share
async function saveImage(t) {
  const name = getState().name, p = persona(t)
  const W = 1080, H = 1350, c = document.createElement('canvas')
  c.width = W; c.height = H
  const g = c.getContext('2d')
  const grd = g.createLinearGradient(0, 0, W, H); grd.addColorStop(0, '#8e74c4'); grd.addColorStop(1, '#3a2f6e')
  g.fillStyle = grd; g.fillRect(0, 0, W, H)
  await document.fonts?.ready
  const serif = getComputedStyle(document.documentElement).getPropertyValue('--serif') || 'Georgia, serif'
  const sans = getComputedStyle(document.body).fontFamily
  g.fillStyle = '#fff'; g.textAlign = 'center'
  g.globalAlpha = 0.75; g.font = `700 30px ${sans}`; g.fillText(`PLANNER · ${t.year}`, W / 2, 130); g.globalAlpha = 1
  g.font = `italic 92px ${serif}`; g.fillText(name ? `${name}’s year` : 'My year', W / 2, 250)
  // the room
  const svg = drawRoom({ room: { ...DEFAULT_ROOM, ...t.room }, tod: 'evening', books: Math.max(t.books, 4), notes: 3, events: 1, leaves: 3 + Math.min(t.run, 12) }).svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="560" height="546" ')
  await new Promise((ok) => { const im = new Image(); im.onload = () => { g.drawImage(im, (W - 560) / 2, 290, 560, 546); ok() }; im.onerror = ok; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) })
  const stats = [[t.days, 'diary days'], [t.books, 'books'], [t.events, 'plans'], [t.topMood ? t.topMood.name : '–', 'mood']]
  stats.forEach(([v, l], i) => {
    const x = 150 + i * 260
    g.fillStyle = 'rgba(255,255,255,.14)'; roundRect(g, x - 115, 880, 230, 170, 30); g.fill()
    g.fillStyle = '#fff'; g.font = `${typeof v === 'number' ? '' : 'italic '}${typeof v === 'number' ? 76 : 56}px ${serif}`; g.fillText(String(v), x, typeof v === 'number' ? 975 : 965)
    g.globalAlpha = 0.8; g.font = `28px ${sans}`; g.fillText(l, x, 1020); g.globalAlpha = 1
  })
  g.font = `italic 60px ${serif}`; g.fillText(p[0], W / 2, 1150)
  g.globalAlpha = 0.8; g.font = `30px ${sans}`; g.fillText(p[1], W / 2, 1205); g.globalAlpha = 1
  const a = document.createElement('a')
  a.download = `my-${t.year}-in-planner.png`
  a.href = c.toDataURL('image/png')
  a.click()
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath() }

const STAY = 6500 // how long a card stays before the next one

export function mount(el) {
  const t = stats()
  const list = cards(t)
  let i = 0, timer = null, started = 0, paused = false, left = STAY
  el.innerHTML = `<section class="year-page">
    <div class="yr-progress">${list.map(() => '<i><b></b></i>').join('')}</div>
    <a class="yr-close" href="#room" aria-label="Close">×</a>
    <div class="yr-card" id="yr-card" aria-live="polite"></div>
    <div class="yr-nav"><button class="yr-prev" data-step="-1" aria-label="Back">‹</button><button class="yr-next" data-step="1" aria-label="Next">›</button></div>
    <p class="yr-hint">Tap the right side for the next card, the left side to go back. Hold to pause.</p>
  </section>`
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  function countUp(root) {
    root.querySelectorAll('[data-count]').forEach((n) => {
      const end = Number(n.dataset.count), t0 = performance.now(), dur = reduce ? 0 : 1100
      const tick = (now) => {
        const k = dur ? Math.min(1, (now - t0) / dur) : 1
        n.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString('en-GB')
        if (k < 1 && n.isConnected) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
  }
  function bars() {
    el.querySelectorAll('.yr-progress i').forEach((b, k) => {
      const fill = b.firstChild
      fill.style.transition = 'none'
      fill.style.width = k < i ? '100%' : '0%'
      if (k === i) {
        fill.getBoundingClientRect()
        const done = 1 - left / STAY
        fill.style.width = done * 100 + '%'
        if (!paused && !list[i].summary) { fill.getBoundingClientRect(); fill.style.transition = `width ${left}ms linear`; fill.style.width = '100%' }
        if (list[i].summary) fill.style.width = '100%'
      }
    })
  }
  function schedule() {
    clearTimeout(timer)
    if (paused || list[i].summary) return
    started = Date.now()
    timer = setTimeout(() => step(1), left)
  }
  function paint() {
    const c = list[i]
    $('#yr-card', el).innerHTML = `<div class="yr-in yr-${c.cls}"><span class="yr-art" aria-hidden="true">${ART[c.art] || ''}</span>${c.html}</div>`
    $('.yr-prev', el).hidden = i === 0
    $('.yr-next', el).textContent = i === list.length - 1 ? '↺' : '›'
    left = STAY
    countUp(el)
    bars()
    schedule()
  }
  const step = (d) => { i = (i + d + list.length) % list.length; paint() }
  function pause(on) {
    if (on === paused) return
    paused = on
    if (on) { clearTimeout(timer); left = Math.max(300, left - (Date.now() - started)) }
    el.querySelector('.year-page').classList.toggle('paused', on)
    bars(); schedule()
  }

  let downAt = 0, heldUntil = 0
  el.addEventListener('pointerdown', (e) => { if (e.target.closest('.yr-card')) { const me = downAt = Date.now(); setTimeout(() => { if (downAt === me) pause(true) }, 280) } })
  el.addEventListener('pointerup', () => { downAt = 0; if (paused) { heldUntil = Date.now() + 80; pause(false) } })
  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-save-img]')) { saveImage(t); return }
    const s = e.target.closest('[data-step]')
    if (s) return step(Number(s.dataset.step))
    const card = e.target.closest('.yr-card')
    if (card) {
      if (Date.now() < heldUntil) return // that was a hold, not a tap
      const r = card.getBoundingClientRect()
      step(e.clientX < r.left + r.width * 0.3 ? -1 : 1)
    }
  })
  const key = (e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); if (e.key === ' ') { e.preventDefault(); pause(!paused) } }
  document.addEventListener('keydown', key)
  window.dispatchEvent(new CustomEvent('planner:track', { detail: { name: 'year_opened' } }))
  paint()
  return () => { clearTimeout(timer); document.removeEventListener('keydown', key) }
}
