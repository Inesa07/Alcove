// "My room": the room fills the page. Objects open their pages,
// one input sorts what you write, and "Decorate" changes the room.

import { getState, subscribe, setRoom, add, todayISO, streak, pick, NOTE_COLORS, COVER_COLORS } from '../store.js'
import { drawRoom, timeOfDay, WALLS, FLOORS, WOODS, FABRICS, RUGS, STYLES, DEFAULT_ROOM } from '../room.js'
import { classify } from '../classify.js'
import { appendDiaryText } from './diary.js'
import { $, esc, toast } from '../ui.js'

const LABELS = { diary: 'Diary', books: 'Books', notes: 'Notes', calendar: 'Calendar' }
const DONE = { event: 'Added to your calendar', book: 'Added to your bookshelf', diary: 'Written in your diary', note: 'Pinned to your notes' }

export function mount(el) {
  el.innerHTML = `
    <section class="room-page">
      <header class="room-top">
        <p class="room-hint">Tap something in your room</p>
        <button class="decorate-btn" id="decorate-btn" aria-expanded="false">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3l2 2-9 9-3 1 1-3z"/><path d="M5 13c-2 0-3 2-3 4 0 1.5-1 2.5-1 2.5S3 21 5 21c3 0 4-2 4-4 0-2-2-4-4-4z"/></svg>
          Decorate
        </button>
      </header>
      <div class="room-stage">
        <div class="room" id="room"></div>
      </div>
      <form class="capture" id="capture" autocomplete="off">
        <label for="capture-input" class="sr-only">Write anything</label>
        <input id="capture-input" placeholder="Write anything… “dentist Friday 11:00”, “read Dune”" />
        <button type="submit" aria-label="Add to my room">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </form>
      <aside class="decor" id="decor" hidden aria-label="Decorate your room"></aside>
    </section>`

  let flash = ''

  function renderRoom() {
    const s = getState()
    const today = todayISO()
    const { svg, spots } = drawRoom({
      room: s.room,
      tod: timeOfDay(),
      books: s.books.length,
      notes: s.notes.length,
      events: s.events.filter((e) => e.date === today).length,
      diaryToday: s.diaryDays.includes(today),
      leaves: 3 + streak(),
    })
    const counts = { books: s.books.length, notes: s.notes.length, calendar: s.events.filter((e) => e.date === today).length, diary: '' }
    const box = $('#room', el)
    if (!box) return // the page was closed
    box.innerHTML = svg + Object.entries(spots).map(([id, b]) => `
      <a class="spot ${flash === id ? 'flash' : ''}" href="#${id}" aria-label="Open ${LABELS[id]}"
        style="left:${b.l}%;top:${b.t}%;width:${b.w}%;height:${b.h}%">
        <span class="tag">${LABELS[id]}${counts[id] ? `<b>${counts[id]}</b>` : ''}</span>
      </a>`).join('')
  }

  /* ---------- decorate drawer ---------- */

  const decor = $('#decor', el)
  const swatches = (key, list, prop = 'c') => `<div class="swatches" role="radiogroup" aria-label="${key}">${Object.entries(list).map(([id, v]) => {
    const color = v[prop] || v.l?.[0] || v.a
    const sel = getState().room[key] === id
    return `<button role="radio" aria-checked="${sel}" data-set="${key}" data-val="${id}" title="${esc(v.name)}" aria-label="${esc(v.name)}" style="--sw:${color || 'transparent'}" class="sw ${color ? '' : 'none'}"></button>`
  }).join('')}</div>`
  const chips = (key) => `<div class="chips">${Object.entries(STYLES[key]).map(([id, name]) => `<button class="chip ${getState().room[key] === id ? 'on' : ''}" data-set="${key}" data-val="${id}" aria-pressed="${getState().room[key] === id}">${esc(name)}</button>`).join('')}</div>`

  function renderDecor() {
    decor.innerHTML = `
      <div class="decor-head"><h2>Decorate</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
      <div class="decor-body">
        <section><h3>Walls</h3>${swatches('wall', WALLS)}</section>
        <section><h3>Floor</h3>${swatches('floor', FLOORS, 'a')}</section>
        <section><h3>Rug</h3>${swatches('rug', RUGS)}</section>
        <section><h3>Bookshelf</h3>${chips('shelfStyle')}${swatches('shelfWood', WOODS)}</section>
        <section><h3>Desk</h3>${chips('deskStyle')}${swatches('deskWood', WOODS)}</section>
        <section><h3>Bed</h3>${chips('bedStyle')}<p class="sub">Frame</p>${swatches('bedWood', WOODS)}<p class="sub">Blanket and curtains</p>${swatches('blanket', FABRICS)}</section>
        <button class="reset" data-reset>Back to the first look</button>
      </div>`
  }

  function toggleDecor(open) {
    decor.hidden = !open
    $('#decorate-btn', el).setAttribute('aria-expanded', String(open))
    el.querySelector('.room-page').classList.toggle('decorating', open)
    if (open) renderDecor()
  }

  $('#decorate-btn', el).addEventListener('click', () => toggleDecor(decor.hidden))
  decor.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return toggleDecor(false)
    if (e.target.closest('[data-reset]')) { setRoom({ ...DEFAULT_ROOM }); return renderDecor() }
    const b = e.target.closest('[data-set]')
    if (b) { setRoom({ [b.dataset.set]: b.dataset.val }); renderDecor() }
  })

  /* ---------- quick capture ---------- */

  $('#capture', el).addEventListener('submit', async (e) => {
    e.preventDefault()
    const input = $('#capture-input', el)
    const text = input.value.trim()
    if (!text) return
    const r = classify(text)
    if (r.kind === 'event') { add('events', r.item); flash = 'calendar' }
    if (r.kind === 'book') { add('books', { title: r.title, author: '', color: pick(COVER_COLORS), hasCover: false, finishedOn: todayISO(), createdAt: Date.now() }); flash = 'books' }
    if (r.kind === 'note') { add('notes', { text: r.text, color: pick(NOTE_COLORS), createdAt: Date.now() }); flash = 'notes' }
    if (r.kind === 'diary') { await appendDiaryText(todayISO(), r.text); flash = 'diary' }
    input.value = ''
    renderRoom()
    toast(DONE[r.kind])
    setTimeout(() => { flash = ''; renderRoom() }, 2400)
  })

  renderRoom()
  const off = subscribe(renderRoom)
  const tick = setInterval(renderRoom, 5 * 60 * 1000)
  return () => { off(); clearInterval(tick) }
}
