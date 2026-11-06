// "Your year": a few cards that tell the story of your year in Planner, like a yearly wrap-up.
// Everything is counted here on your device from your own data.

import { getState, MOODS, todayISO } from '../store.js'
import { drawRoom, THEMES, DEFAULT_ROOM, roomTheme } from '../room.js'
import { $, esc, moodFace, toast } from '../ui.js'

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
  list.push({ id: 'intro', cls: 'c0', art: 'stars', html: `<p class="yr-kicker">Planner · your year</p><div class="yr-big">${t.year}</div><h2>${name ? esc(name) + ', this' : 'This'} was your year</h2><p>Sit back. Here is your year, one card at a time.</p>` })
  list.push({ id: 'diary', cls: 'c1', art: 'pen', html: `<p class="yr-kicker">Your diary</p>${count(t.days)}<h2>${t.days === 1 ? 'day' : 'days'} you wrote or drew</h2>
    ${t.run > 1 ? `<p>Your longest streak: <b>${t.run} days</b> in a row.</p>` : '<p>Every page is a small piece of your year.</p>'}
    <div class="yr-bars">${t.writeMonth.map((n, i) => `<i style="--h:${(n / Math.max(1, ...t.writeMonth)) * 100}%;--d:${i * 50}ms" title="${MONTHS[i]}: ${n}"><span>${MONTHS[i][0]}</span></i>`).join('')}</div>
    ${t.favDay ? `<p class="yr-small">You wrote most on <b>${t.favDay}</b>${t.kept ? ` · ♥ ${plural(t.kept, 'page', 'pages')} in Memories` : ''}</p>` : ''}` })
  list.push({ id: 'books', cls: 'c2', art: 'books', html: `<p class="yr-kicker">Your books</p>${count(t.books)}<h2>${t.books === 1 ? 'book' : 'books'} finished</h2>
    <div class="yr-spines">${getState().books.filter((b) => (b.status || 'done') === 'done' && (b.finishedOn || '').startsWith(String(t.year))).slice(0, 14).map((b, i) => `<i style="background:${esc(b.color || '#8E7CC3')};height:${70 + ((i * 37) % 30)}px;--d:${i * 70}ms" title="${esc(b.title)}"></i>`).join('')}</div>
    ${t.pagesRead ? `<p>About <b>${t.pagesRead.toLocaleString('en-GB')} pages</b>${t.minutes ? ` and <b>${hours(t.minutes)}</b> with the reading timer` : ''}.</p>` : t.minutes ? `<p><b>${hours(t.minutes)}</b> with the reading timer.</p>` : ''}
    ${t.topAuthor && t.topAuthor[1] > 1 ? `<p class="yr-small">Your author of the year: <b>${esc(t.topAuthor[0])}</b></p>` : ''}` })
  if (t.best) list.push({ id: 'best', cls: 'c3', art: 'star', html: `<p class="yr-kicker">Book of the year</p><div class="yr-book" style="--c:${esc(t.best.color || '#8E7CC3')}"><b>${esc(t.best.title)}</b>${t.best.author ? `<span>${esc(t.best.author)}</span>` : ''}</div>
    ${t.best.rating ? `<p class="yr-stars">${'★'.repeat(t.best.rating)}</p>` : ''}${t.best.review ? `<p class="yr-quote">“${esc(t.best.review.slice(0, 160))}”</p>` : '<p>The one you loved most.</p>'}` })
  if (t.quote) list.push({ id: 'quote', cls: 'c0', art: 'quote', html: `<p class="yr-kicker">A line you kept</p><p class="yr-bigquote">“${esc(t.quote.text.slice(0, 220))}”</p><p class="yr-small">from <b>${esc(t.quote.book)}</b>${t.quotes > 1 ? ` · one of ${t.quotes} quotes you saved` : ''}</p>` })
  if (t.topMood) {
    const start = new Date(t.year, 0, 1)
    const n = (t.year % 4 === 0 ? 366 : 365)
    const cells = Array.from({ length: n }, (_, i) => { const d = new Date(start); d.setDate(i + 1); const v = t.moods[todayISO(d)]; return `<i style="${v ? `background:${MOODS[v - 1].c};` : ''}--d:${Math.round(i * 3)}ms"></i>` }).join('')
    list.push({ id: 'mood', cls: 'c4', art: 'hearts', html: `<p class="yr-kicker">How you felt</p><div class="yr-face">${moodFace(t.topMood.v, t.topMood.c)}</div><h2>Most days you felt <b>${t.topMood.name.toLowerCase()}</b></h2>
      <div class="yr-mosaic">${cells}</div>
      <div class="yr-legend">${MOODS.map((m, i) => t.moodCount[i] ? `<span><i style="background:${m.c}"></i>${m.name} ${t.moodCount[i]}</span>` : '').join('')}</div>` })
    const happiest = t.moodMonth.indexOf(Math.max(...t.moodMonth))
    list.push({ id: 'colour', cls: 'c2', art: 'sun', html: `<p class="yr-kicker">Your year in colour</p><h2>Your happiest month was <b>${MONTHS[happiest]}</b></h2>
      <div class="yr-moodline">${t.moodMonth.map((v, i) => `<span><i style="${v ? `background:${moodOf(v).c};height:${20 + v * 14}%` : ''};--d:${i * 60}ms"></i><small>${MONTHS[i][0]}</small></span>`).join('')}</div>` })
  }
  list.push({ id: 'plans', cls: 'c1', art: 'cal', html: `<p class="yr-kicker">Your plans</p>${count(t.events)}<h2>${t.events === 1 ? 'thing' : 'things'} in your calendar</h2>
    ${t.busiest >= 0 ? `<p>Your busiest month was <b>${MONTHS[t.busiest]}</b>.</p>` : ''}
    <p>${plural(t.notes, 'note', 'notes')} on your board${t.fromFriends ? `, <b>${t.fromFriends} from friends</b> ♥` : ''}.</p>` })
  list.push({ id: 'word', cls: 'c3', art: 'stars', html: `<p class="yr-kicker">Your year in one word</p><div class="yr-emoji">${p[2]}</div><h2>${p[0]}</h2><p>${p[1]}</p>` })
  const room = drawRoom({ room: { ...DEFAULT_ROOM, ...t.room }, tod: 'evening', books: Math.max(t.books, 4), notes: 3, events: 1, leaves: 3 + Math.min(t.run, 12) }).svg
  list.push({ id: 'summary', cls: 'c0', art: 'stars', summary: true, html: `<p class="yr-kicker">${t.year} · ${name ? esc(name) : 'your year'}</p><div class="yr-room">${room}</div>
    <div class="yr-sum"><span><b>${t.days}</b>diary days</span><span><b>${t.books}</b>books</span><span><b>${t.events}</b>plans</span><span><b>${t.topMood ? t.topMood.name : '–'}</b>mood</span></div>
    <h2 class="yr-h-small">${p[0]} ${p[2]}</h2><p>See you in ${t.year + 1} in your ${THEMES[roomTheme(t.room.theme)].name.toLowerCase()}.</p>
    <div class="yr-share-row"><button class="yr-save" data-share-all>Share all my cards</button><button class="yr-save ghosty" data-save-img>Save the summary</button></div>` })
  return list
}

// little shapes floating behind each card
const ART = {
  stars: '✦ ✧ ✦ · ✧', pen: '✎ · ✦ ✧', books: '❘❘ ✦ ❘ ·', star: '★ ✦ ★ ✧', quote: '❝ ✧ ❞ ·', hearts: '♥ ✧ ♥ · ♡', sun: '☀ ✧ ✦ ·', cal: '▦ ✦ · ✧',
}

// the whole year as one picture, saved on the device
async function saveImage(t) {
  const c = await storyCanvas('summary', t)
  const a = document.createElement('a')
  a.download = `my-${t.year}-in-planner.png`
  a.href = c.toDataURL('image/png')
  a.click()
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath() }

/* ---------- sharing a card as a story picture (1080 × 1920), like a yearly wrap-up ---------- */

const GRADS = { c0: ['#9b82d1', '#4a3d78'], c1: ['#e899ac', '#8c4f7c'], c2: ['#78b394', '#35594e'], c3: ['#5a78b8', '#28305e'], c4: ['#f1c27d', '#b5603f'] }
const CARD_GRAD = { intro: 'c0', diary: 'c1', books: 'c2', best: 'c3', quote: 'c0', mood: 'c4', colour: 'c2', plans: 'c1', word: 'c3', summary: 'c0' }

function wrapText(g, text, x, y, maxW, lh, maxLines = 4) {
  const words = String(text).split(' ')
  let line = '', n = 0
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); y += lh; line = w; if (++n >= maxLines - 1) { line = words.slice(words.indexOf(w)).join(' '); break } }
    else line = test
  }
  if (g.measureText(line).width > maxW) { while (g.measureText(line + '…').width > maxW) line = line.slice(0, -1); line += '…' }
  g.fillText(line, x, y)
  return y + lh
}
const roomImage = (t) => new Promise((ok) => {
  const svg = drawRoom({ room: { ...DEFAULT_ROOM, ...t.room }, tod: 'evening', books: Math.max(t.books, 4), notes: 3, events: 1, leaves: 3 + Math.min(t.run, 12) }).svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="780" height="760" ')
  const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null)
  im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
})
const faceImage = (v) => new Promise((ok) => {
  const m = MOODS[v - 1], im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null)
  im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(moodFace(m.v, m.c).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" '))
})

async function storyCanvas(id, t) {
  const W = 1080, H = 1920, c = document.createElement('canvas')
  c.width = W; c.height = H
  const g = c.getContext('2d')
  const [a, b] = GRADS[CARD_GRAD[id]]
  const grd = g.createLinearGradient(0, 0, W * 0.6, H); grd.addColorStop(0, a); grd.addColorStop(1, b)
  g.fillStyle = grd; g.fillRect(0, 0, W, H)
  // soft round shapes in the background
  g.globalAlpha = 0.12; g.fillStyle = '#fff'
  ;[[880, 260, 260], [140, 1500, 320], [960, 1700, 160]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill() })
  g.globalAlpha = 1
  await document.fonts?.ready
  const serif = getComputedStyle(document.documentElement).getPropertyValue('--serif') || 'Georgia, serif'
  const sans = getComputedStyle(document.body).fontFamily
  const name = getState().name
  g.fillStyle = '#fff'; g.textAlign = 'center'
  const kicker = (txt, y = 250) => { g.globalAlpha = 0.8; g.font = `700 34px ${sans}`; g.fillText(txt.toUpperCase().split('').join(String.fromCharCode(8202)), W / 2, y); g.globalAlpha = 1 }
  const big = (txt, y, size = 300) => { g.font = `${size}px ${serif}`; g.fillText(String(txt), W / 2, y) }
  const title = (txt, y, size = 76) => { g.font = `italic ${size}px ${serif}`; return wrapText(g, txt, W / 2, y, W - 160, size * 1.15, 3) }
  const line = (txt, y, size = 40, alpha = 0.9) => { g.globalAlpha = alpha; g.font = `${size}px ${sans}`; const ny = wrapText(g, txt, W / 2, y, W - 180, size * 1.35, 3); g.globalAlpha = 1; return ny }
  const doneYear = t.books

  if (id === 'intro') { kicker(`Planner · ${t.year}`, 520); big(t.year, 900, 260); title(name ? `${name}, this was your year` : 'This was your year', 1100) }
  if (id === 'diary') {
    kicker('My diary'); big(t.days, 640); title(t.days === 1 ? 'day I wrote or drew' : 'days I wrote or drew', 780)
    const max = Math.max(1, ...t.writeMonth), bw = 52, gap = 18, x0 = (W - 12 * bw - 11 * gap) / 2
    t.writeMonth.forEach((n, i) => { const h = 20 + (n / max) * 360; g.fillStyle = 'rgba(255,255,255,.85)'; roundRect(g, x0 + i * (bw + gap), 1380 - h, bw, h, 12); g.fill(); g.globalAlpha = 0.75; g.font = `30px ${sans}`; g.fillText(MONTHS[i][0], x0 + i * (bw + gap) + bw / 2, 1430); g.globalAlpha = 1 })
    g.fillStyle = '#fff'
    if (t.run > 1) line(`Longest streak: ${t.run} days in a row`, 1560, 42)
    if (t.favDay) line(`I wrote most on ${t.favDay}`, 1630, 36, 0.8)
  }
  if (id === 'books') {
    kicker('My books'); big(doneYear, 640); title(doneYear === 1 ? 'book finished' : 'books finished', 780)
    const done = getState().books.filter((x) => (x.status || 'done') === 'done' && (x.finishedOn || '').startsWith(String(t.year))).slice(0, 16)
    const sw = 46, x0 = W / 2 - (done.length * (sw + 8)) / 2
    done.forEach((bk, i) => { const h = 220 + ((i * 37) % 80); g.fillStyle = bk.color || '#8E7CC3'; roundRect(g, x0 + i * (sw + 8), 1340 - h, sw, h, 8); g.fill(); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x0 + i * (sw + 8) + sw - 8, 1340 - h + 6, 6, h - 12) })
    g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(W / 2 - 400, 1340, 800, 8); g.fillStyle = '#fff'
    let y = 1480
    if (t.pagesRead) y = line(`About ${t.pagesRead.toLocaleString('en-GB')} pages`, y, 42)
    if (t.minutes) y = line(`${hours(t.minutes)} with the reading timer`, y, 38, 0.8)
    if (t.topAuthor && t.topAuthor[1] > 1) line(`Author of the year: ${t.topAuthor[0]}`, y, 38, 0.8)
  }
  if (id === 'best' && t.best) {
    kicker('My book of the year')
    g.save(); g.translate(W / 2, 900); g.rotate(-0.07)
    g.fillStyle = 'rgba(0,0,0,.25)'; roundRect(g, -230, -310, 480, 660, 30); g.fill()
    g.fillStyle = t.best.color || '#8E7CC3'; roundRect(g, -250, -330, 480, 660, 24); g.fill()
    g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(-250, -330, 34, 660)
    g.fillStyle = '#fff'; g.font = `italic 64px ${serif}`; wrapText(g, t.best.title, 0, -80, 400, 74, 4)
    if (t.best.author) { g.globalAlpha = 0.85; g.font = `34px ${sans}`; g.fillText(t.best.author, 0, 220); g.globalAlpha = 1 }
    g.restore()
    if (t.best.rating) { g.fillStyle = '#FBE3A0'; g.font = `70px ${sans}`; g.fillText('★'.repeat(t.best.rating), W / 2, 1400) }
    g.fillStyle = '#fff'
    if (t.best.review) line(`“${t.best.review}”`, 1520, 40)
  }
  if (id === 'quote' && t.quote) {
    kicker('A line I kept', 420); g.font = `italic 230px ${serif}`; g.globalAlpha = 0.3; g.fillText('“', W / 2, 700); g.globalAlpha = 1
    g.font = `italic 66px ${serif}`; const y = wrapText(g, t.quote.text, W / 2, 820, W - 180, 84, 7)
    line(`from ${t.quote.book}`, y + 60, 38, 0.8)
  }
  if (id === 'mood' && t.topMood) {
    kicker('How I felt'); const face = await faceImage(t.topMood.v); if (face) g.drawImage(face, W / 2 - 150, 330, 300, 300)
    title(`Most days I felt ${t.topMood.name.toLowerCase()}`, 760, 70)
    const cols = 21, cell = 36, gap = 6, x0 = (W - cols * (cell + gap)) / 2, start = new Date(t.year, 0, 1), n = t.year % 4 === 0 ? 366 : 365
    for (let i = 0; i < n; i++) {
      const d = new Date(start); d.setDate(i + 1); const v = t.moods[todayISO(d)]
      g.fillStyle = v ? MOODS[v - 1].c : 'rgba(255,255,255,.16)'; roundRect(g, x0 + (i % cols) * (cell + gap), 900 + Math.floor(i / cols) * (cell + gap), cell, cell, 8); g.fill()
    }
  }
  if (id === 'colour') {
    const happiest = t.moodMonth.indexOf(Math.max(...t.moodMonth))
    kicker('My year in colour'); title(`My happiest month was ${MONTHS[happiest]}`, 520, 80)
    const bw = 58, gap = 16, x0 = (W - 12 * bw - 11 * gap) / 2
    t.moodMonth.forEach((v, i) => { const h = v ? 100 + v * 130 : 30; g.fillStyle = v ? moodOf(v).c : 'rgba(255,255,255,.2)'; roundRect(g, x0 + i * (bw + gap), 1500 - h, bw, h, 29); g.fill(); g.fillStyle = '#fff'; g.globalAlpha = 0.75; g.font = `30px ${sans}`; g.fillText(MONTHS[i][0], x0 + i * (bw + gap) + bw / 2, 1560); g.globalAlpha = 1 })
  }
  if (id === 'plans') {
    kicker('My plans'); big(t.events, 640); title(t.events === 1 ? 'thing in my calendar' : 'things in my calendar', 780)
    let y = 1000
    if (t.busiest >= 0) y = line(`Busiest month: ${MONTHS[t.busiest]}`, y, 44)
    y = line(`${plural(t.notes, 'note', 'notes')} on my board`, y + 20, 40, 0.85)
    if (t.fromFriends) line(`${t.fromFriends} from friends ♥`, y + 10, 40, 0.85)
  }
  if (id === 'word') {
    const p = persona(t); kicker('My year in one word', 520); g.font = `220px ${sans}`; g.fillText(p[2], W / 2, 860); title(p[0], 1060, 100); line(p[1], 1200, 44)
  }
  if (id === 'summary') {
    const p = persona(t); kicker(`Planner · ${t.year}`, 200); g.font = `italic 96px ${serif}`; g.fillText(name ? `${name}’s year` : 'My year', W / 2, 330)
    const room = await roomImage(t); if (room) g.drawImage(room, (W - 780) / 2, 380, 780, 760)
    const stats = [[t.days, 'diary days'], [t.books, 'books'], [t.events, 'plans'], [t.topMood ? t.topMood.name : '–', 'mood']]
    stats.forEach(([v, l], i) => {
      const x = 150 + i * 260
      g.fillStyle = 'rgba(255,255,255,.15)'; roundRect(g, x - 115, 1190, 230, 190, 34); g.fill()
      g.fillStyle = '#fff'; g.font = `${typeof v === 'number' ? 84 : 58}px ${serif}`; g.fillText(String(v), x, typeof v === 'number' ? 1295 : 1285)
      g.globalAlpha = 0.8; g.font = `30px ${sans}`; g.fillText(l, x, 1345); g.globalAlpha = 1
    })
    g.font = `italic 74px ${serif}`; g.fillText(`${p[0]} ${p[2]}`, W / 2, 1530)
    line(p[1], 1610, 40, 0.85)
  }
  // a small signature at the bottom of every picture
  g.globalAlpha = 0.75; g.font = `italic 40px ${serif}`; g.fillText('Planner', W / 2, H - 110)
  g.font = `28px ${sans}`; g.fillText('my year · ' + t.year, W / 2, H - 66); g.globalAlpha = 1
  return c
}

// share with the phone's share sheet (Instagram, WhatsApp…); on a computer it downloads the picture
async function shareCard(id, t) {
  const c = await storyCanvas(id, t)
  const blob = await new Promise((ok) => c.toBlob(ok, 'image/png'))
  const file = new File([blob], `my-${t.year}-${id}.png`, { type: 'image/png' })
  window.dispatchEvent(new CustomEvent('planner:track', { detail: { name: 'year_shared', props: { card: id } } }))
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: `My ${t.year} in Planner` }); return } catch (e) { if (e?.name === 'AbortError') return }
  }
  const a = document.createElement('a')
  a.download = file.name
  a.href = URL.createObjectURL(blob)
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  toast('Saved the picture. Share it from your photos or downloads')
}

// all the cards at once: the phone's share sheet gets every picture (like posting a whole story);
// where that is not possible, one picture with all the cards side by side is saved
async function shareAll(ids, t) {
  toast('Making your pictures…')
  const canvases = []
  for (const id of ids) canvases.push(await storyCanvas(id, t))
  const files = await Promise.all(canvases.map((c, i) => new Promise((ok) => c.toBlob((b) => ok(new File([b], `my-${t.year}-${i + 1}-${ids[i]}.png`, { type: 'image/png' })), 'image/png'))))
  window.dispatchEvent(new CustomEvent('planner:track', { detail: { name: 'year_shared', props: { card: 'all' } } }))
  if (navigator.canShare?.({ files })) {
    try { await navigator.share({ files, title: `My ${t.year} in Planner` }); return } catch (e) { if (e?.name === 'AbortError') return }
  }
  const cols = Math.min(5, canvases.length), rows = Math.ceil(canvases.length / cols), w = 432, h = 768, gap = 24
  const sheet = document.createElement('canvas')
  sheet.width = cols * w + (cols + 1) * gap; sheet.height = rows * h + (rows + 1) * gap
  const g = sheet.getContext('2d')
  g.fillStyle = '#1d1934'; g.fillRect(0, 0, sheet.width, sheet.height)
  canvases.forEach((c, i) => { const x = gap + (i % cols) * (w + gap), y = gap + Math.floor(i / cols) * (h + gap); g.save(); roundRect(g, x, y, w, h, 28); g.clip(); g.drawImage(c, x, y, w, h); g.restore() })
  const a = document.createElement('a')
  a.download = `my-${t.year}-in-planner-all.jpg`
  a.href = sheet.toDataURL('image/jpeg', 0.9)
  a.click()
  toast('Saved one picture with all your cards')
}

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
    if (e.target.closest('[data-share-all]')) { pause(true); shareAll(list.map((c) => c.id), t).finally(() => pause(false)); return }
    if (e.target.closest('[data-share-card]')) { pause(true); shareCard(list[i].id, t).finally(() => pause(false)); return }
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
