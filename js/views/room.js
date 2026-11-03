// "My room": the room fills the page. Objects open their pages,
// one input sorts what you write, and "Decorate" lets you change the room piece by piece.

import { getState, subscribe, setRoom, add, todayISO, streak, pick, NOTE_COLORS, COVER_COLORS } from '../store.js'
import { drawRoom, timeOfDay, WALLS, FLOORS, WOODS, FABRICS, RUGS, STYLES, PET_COLORS, THEMES, THEME_PRESETS, DEFAULT_ROOM } from '../room.js'
import { classify } from '../classify.js'
import { appendDiaryText } from './diary.js'
import { $, esc, toast } from '../ui.js'

// Normal mode: objects open pages.
const PAGES = { bed: ['diary', 'Diary'], shelf: ['books', 'Books'], board: ['notes', 'Notes'], desk: ['calendar', 'Calendar'] }

// Decorate mode: what you can change on each part of the room.
const PARTS = {
  theme: { name: 'Room style', options: [['Choose a room', 'theme', 'themes']] },
  bed: { name: 'Bed', options: [['Style', 'bedStyle', 'styles'], ['Frame', 'bedWood', WOODS], ['Blanket and curtains', 'blanket', FABRICS], ['Pet on the bed', 'pet', 'styles'], ['Pet colour', 'petColor', PET_COLORS]] },
  shelf: { name: 'Bookshelf', options: [['Style', 'shelfStyle', 'styles'], ['Colour', 'shelfWood', WOODS]] },
  desk: { name: 'Desk', options: [['Style', 'deskStyle', 'styles'], ['Colour', 'deskWood', WOODS]] },
  chair: { name: 'Chair', options: [['Style', 'chairStyle', 'styles'], ['Colour', 'chairColor', FABRICS]] },
  rug: { name: 'Rug', options: [['Colour', 'rug', RUGS]] },
  walls: { name: 'Walls', options: [['Colour', 'wall', WALLS], ['Texture', 'wallStyle', 'styles']] },
  floor: { name: 'Floor', options: [['Colour', 'floor', FLOORS], ['Pattern', 'floorStyle', 'styles']] },
}
// Order matters: later ones sit on top, so furniture wins over walls and floor.
const DECOR_ORDER = ['rug', 'desk', 'chair', 'shelf', 'bed']

const DONE = { event: 'Added to your calendar', book: 'Added to your bookshelf', diary: 'Written in your diary', note: 'Pinned to your notes' }
const swatchColor = (v) => v.c ?? v.l?.[0] ?? v.a ?? v.base ?? null

export function mount(el) {
  el.innerHTML = `
    <section class="room-page">
      <header class="room-top">
        <p class="room-hint" id="room-hint">Tap something in your room</p>
        <div class="room-actions" id="room-actions"></div>
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
      <aside class="decor" id="decor" hidden aria-live="polite"></aside>
    </section>`

  const page = $('.room-page', el)
  let flash = ''
  let decorating = false
  let draft = null      // room settings while decorating; saved only with "Save"
  let part = null       // the part being changed

  const room = () => (decorating ? draft : getState().room)

  /* ---------- the room ---------- */

  function renderRoom() {
    const box = $('#room', el)
    if (!box) return // the page was closed
    const s = getState()
    const today = todayISO()
    const { svg, spots, shapes } = drawRoom({
      room: room(),
      tod: timeOfDay(),
      books: s.books.length,
      notes: s.notes.length,
      events: s.events.filter((e) => e.date === today).length,
      diaryToday: s.diaryDays.includes(today),
      leaves: 3 + streak(),
      selected: decorating ? part : null,
    })

    let overlay
    if (decorating) {
      const shape = (id, poly) => `<button class="spot shape ${part === id ? 'on' : ''}" data-part="${id}" aria-label="Change the ${PARTS[id].name.toLowerCase()}" style="clip-path:polygon(${poly})"></button>`
      overlay =
        shapes.floor.map((p) => shape('floor', p)).join('') +
        shapes.walls.map((p) => shape('walls', p)).join('') +
        DECOR_ORDER.map((id) => {
          const b = spots[id]
          return `<button class="spot decor-spot ${part === id ? 'on' : ''}" data-part="${id}" aria-label="Change the ${PARTS[id].name.toLowerCase()}"
            style="left:${b.l}%;top:${b.t}%;width:${b.w}%;height:${b.h}%"><span class="tag">${PARTS[id].name}</span></button>`
        }).join('')
    } else {
      const counts = { shelf: s.books.length, board: s.notes.length, desk: s.events.filter((e) => e.date === today).length, bed: '' }
      overlay = Object.entries(PAGES).map(([id, [view, label]]) => {
        const b = spots[id]
        return `<a class="spot ${flash === id ? 'flash' : ''}" href="#${view}" aria-label="Open ${label}"
          style="left:${b.l}%;top:${b.t}%;width:${b.w}%;height:${b.h}%">
          <span class="tag">${label}${counts[id] ? `<b>${counts[id]}</b>` : ''}</span>
        </a>`
      }).join('')
    }
    box.innerHTML = svg + overlay
  }

  /* ---------- top bar ---------- */

  function renderTop() {
    $('#room-hint', el).textContent = decorating ? 'Tap the bed, bookshelf, desk, chair, rug, walls or floor to change it' : 'Tap something in your room'
    $('#room-actions', el).innerHTML = decorating
      ? `<button class="ghost-dark theme-btn" data-part="theme">Room style</button><button class="ghost-dark" data-cancel>Cancel</button><button class="primary" data-save>Save</button>`
      : `<button class="decorate-btn" data-decorate>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3l2 2-9 9-3 1 1-3z"/><path d="M5 13c-2 0-3 2-3 4 0 1.5-1 2.5-1 2.5S3 21 5 21c3 0 4-2 4-4 0-2-2-4-4-4z"/></svg>
          Decorate
        </button>`
    page.classList.toggle('decorating', decorating)
    document.body.classList.toggle('decorating', decorating)
    $('#capture', el).hidden = decorating
  }

  /* ---------- options for one part ---------- */

  function renderPanel() {
    const panel = $('#decor', el)
    page.classList.toggle('has-part', !!(decorating && part))
    if (!decorating || !part) { panel.hidden = true; return }
    const r = draft
    const rows = PARTS[part].options.map(([label, key, list]) => {
      if (list === 'themes') {
        return `<section><div class="themes">${Object.entries(THEMES).map(([id, t]) => {
          const look = drawRoom({ room: { ...DEFAULT_ROOM, ...THEME_PRESETS[id], theme: id }, tod: 'day', books: 7, notes: 3, leaves: 6 }).svg
          const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(look.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))
          return `<button class="theme-card ${(r.theme || 'cozy') === id ? 'on' : ''}" data-theme="${id}" aria-pressed="${(r.theme || 'cozy') === id}">
            <img src="${src}" alt=""><b>${esc(t.name)}</b><span>${esc(t.note)}</span></button>`
        }).join('')}</div></section>`
      }
      if (list === 'styles') {
        return `<section><h3>${label}</h3><div class="chips">${Object.entries(STYLES[key]).map(([id, name]) =>
          `<button class="chip ${r[key] === id ? 'on' : ''}" data-set="${key}" data-val="${id}" aria-pressed="${r[key] === id}">${esc(name)}</button>`).join('')}</div></section>`
      }
      return `<section><h3>${label}</h3><div class="swatches" role="radiogroup" aria-label="${label}">${Object.entries(list).map(([id, v]) => {
        const c = swatchColor(v)
        return `<button role="radio" aria-checked="${r[key] === id}" data-set="${key}" data-val="${id}" title="${esc(v.name)}" aria-label="${esc(v.name)}" class="sw ${c ? '' : 'none'}" style="--sw:${c || 'transparent'}"></button>`
      }).join('')}</div></section>`
    }).join('')
    panel.innerHTML = `
      <div class="decor-head"><h2>${PARTS[part].name}</h2><button class="icon-btn" data-done aria-label="Done with the ${PARTS[part].name.toLowerCase()}">×</button></div>
      <div class="decor-body">${rows}</div>`
    panel.hidden = false
  }

  function render() { renderTop(); renderRoom(); renderPanel() }

  /* ---------- clicks ---------- */

  el.addEventListener('click', (e) => {
    const t = e.target
    if (t.closest('[data-decorate]')) { decorating = true; draft = { ...getState().room }; part = null; return render() }
    if (t.closest('[data-cancel]')) { decorating = false; draft = null; part = null; return render() }
    if (t.closest('[data-save]')) {
      setRoom(draft)
      decorating = false; draft = null; part = null
      render()
      return toast('Your room is saved')
    }
    const p = t.closest('[data-part]')
    if (p) { part = p.dataset.part; return render() }
    if (t.closest('[data-done]')) { part = null; return render() }
    const th = t.closest('[data-theme]')
    if (th && decorating) { draft = { ...draft, ...THEME_PRESETS[th.dataset.theme], theme: th.dataset.theme }; renderRoom(); renderPanel(); return }
    const opt = t.closest('[data-set]')
    if (opt && decorating) { draft = { ...draft, [opt.dataset.set]: opt.dataset.val }; renderRoom(); renderPanel() }
  })

  /* ---------- quick capture ---------- */

  $('#capture', el).addEventListener('submit', async (e) => {
    e.preventDefault()
    const input = $('#capture-input', el)
    const text = input.value.trim()
    if (!text) return
    const r = classify(text)
    if (r.kind === 'event') { add('events', r.item); flash = 'desk' }
    if (r.kind === 'book') { add('books', { title: r.title, author: '', color: pick(COVER_COLORS), hasCover: false, finishedOn: todayISO(), createdAt: Date.now() }); flash = 'shelf' }
    if (r.kind === 'note') { add('notes', { text: r.text, color: pick(NOTE_COLORS), createdAt: Date.now() }); flash = 'board' }
    if (r.kind === 'diary') { await appendDiaryText(todayISO(), r.text); flash = 'bed' }
    input.value = ''
    renderRoom()
    toast(DONE[r.kind])
    setTimeout(() => { flash = ''; renderRoom() }, 2400)
  })

  render()
  const off = subscribe(renderRoom)
  const tick = setInterval(renderRoom, 5 * 60 * 1000)
  return () => { off(); clearInterval(tick); document.body.classList.remove('decorating') }
}
