import * as db from '../db.js'
// "My room": the room fills the page. Objects open their pages,
// one input sorts what you write, and "Decorate" lets you change the room piece by piece.

import { getState, subscribe, setRoom, add, todayISO, streak, pick, NOTE_COLORS, COVER_COLORS, setMood, MOODS } from '../store.js'
import { drawRoom, seasonOf, timeOfDay, WALLS, FLOORS, WOODS, FABRICS, RUGS, STYLES, PET_COLORS, THEMES, THEME_PRESETS, DEFAULT_ROOM } from '../room.js'
import { $, esc, toast, moodFace } from '../ui.js'
import { weatherOn, turnOnWeather, turnOffWeather, currentWeather } from '../weather.js'
import { SOUNDS, play, stop, playing, getVolume, setVolume } from '../sounds.js'

// Normal mode: objects open pages.
const PAGES = { bed: ['diary', 'Diary'], shelf: ['books', 'Books'], board: ['notes', 'Notes'], desk: ['calendar', 'Calendar'] }

// Decorate mode: what you can change on each part of the room.
const PARTS = {
  bed: { name: 'Bed', options: [['Style', 'bedStyle', 'styles'], ['Frame', 'bedWood', WOODS], ['Blanket and curtains', 'blanket', FABRICS], ['Pet', 'pet', 'styles'], ['Pet colour', 'petColor', PET_COLORS], ['Pet name', 'petName', 'text']] },
  shelf: { name: 'Bookshelf', options: [['Style', 'shelfStyle', 'styles'], ['Colour', 'shelfWood', WOODS]] },
  desk: { name: 'Desk', options: [['Style', 'deskStyle', 'styles'], ['Colour', 'deskWood', WOODS]] },
  chair: { name: 'Chair', options: [['Style', 'chairStyle', 'styles'], ['Colour', 'chairColor', FABRICS]] },
  rug: { name: 'Rug', options: [['Colour', 'rug', RUGS]] },
  art: { name: 'Picture', options: [['Picture on the wall', 'art', 'styles']] },
  window: { name: 'Window', options: [['Your own view', 'windowPhoto', 'photo']] },
  walls: { name: 'Walls', options: [['Colour', 'wall', WALLS], ['Texture', 'wallStyle', 'styles']] },
  floor: { name: 'Floor', options: [['Colour', 'floor', FLOORS], ['Pattern', 'floorStyle', 'styles']] },
}
// Order matters: later ones sit on top, so furniture wins over walls and floor.
const DECOR_ORDER = ['window', 'art', 'rug', 'desk', 'chair', 'shelf', 'bed']

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
      <aside class="decor" id="decor" hidden aria-live="polite"></aside>
      <div class="amb" id="amb" hidden></div>
      <dialog class="gallery" id="gallery" aria-labelledby="gallery-title"></dialog>
    </section>`

  const page = $('.room-page', el)
  let flash = ''
  let decorating = false
  let draft = null      // room settings while decorating; saved only with "Save"
  let part = null       // the part being changed

  const room = () => (decorating ? draft : getState().room)

  // the weather outside, when you turned it on
  let weather = null
  const getWeather = () => currentWeather().then((w) => { weather = w; renderRoom(); renderTop() })
  getWeather()

  /* ---------- the room ---------- */

  // your own window view, kept in IndexedDB
  let windowPhoto = null
  db.get('dream:window').then((v) => { if (v) { windowPhoto = v; renderRoom() } })
  el.addEventListener('change', async (e) => {
    if (!e.target.matches('[data-window-photo]')) return
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    try {
      const { src } = await db.shrinkImage(f, 1200)
      windowPhoto = src
      await db.set('dream:window', src)
      renderRoom(); renderPanel()
      toast('Your view is in the window')
    } catch (err) { toast(err.message) }
  })

  // book covers live in IndexedDB; read the ones the shelf shows, then draw again
  const covers = new Map()
  ;(async () => {
    const ids = getState().books.map((b) => b.id)
    for (const id of ids) covers.set(id, (await db.get('cover:' + id)) || null)
    if (ids.some((id) => covers.get(id))) renderRoom()
  })()

  function renderRoom() {
    const box = $('#room', el)
    if (!box) return // the page was closed
    const s = getState()
    const today = todayISO()
    // books you are reading now come first, so they stand with their covers out on the shelf
    const list = [...s.books].sort((a, b) => ((b.status === 'reading') - (a.status === 'reading')) || (b.createdAt || 0) - (a.createdAt || 0))
    const { svg, spots, shapes, bookSpots } = drawRoom({
      windowPhoto,
      memories: (s.diaryBook.hearts || []).length,
      moods: Object.entries(s.moods || {}).filter(([d]) => d.slice(0, 7) === today.slice(0, 7)).sort().map(([, v]) => MOODS[v - 1].c),
      bookList: list.map((b) => ({ id: b.id, title: b.title, author: b.author, color: b.color, cover: covers.get(b.id)?.src })),
      room: room(),
      tod: timeOfDay(),
      weather,
      season: room().seasonal === 'off' ? null : seasonOf(),
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
          if (!b) return '' // this room has no such part (no window in the Japanese room)
          return `<button class="spot decor-spot ${part === id ? 'on' : ''}" data-part="${id}" aria-label="Change the ${PARTS[id].name.toLowerCase()}"
            style="left:${b.l}%;top:${b.t}%;width:${b.w}%;height:${b.h}%"><span class="tag">${PARTS[id].name}</span></button>`
        }).join('')
    } else {
      const counts = { shelf: s.books.length, board: s.notes.length, desk: s.events.filter((e) => e.date === today).length, bed: '' }
      overlay = Object.entries(PAGES).map(([id, [view, label]]) => {
        const b = spots[id]
        if (!b) return ''
        return `<a class="spot ${flash === id ? 'flash' : ''}" href="#${view}" aria-label="Open ${label}"
          style="left:${b.l}%;top:${b.t}%;width:${b.w}%;height:${b.h}%">
          <span class="tag" style="${b.tx != null ? `left:${b.tx}%;top:${b.ty}%` : ''}">${label}${counts[id] ? `<b>${counts[id]}</b>` : ''}</span>
        </a>`
      }).join('')
    }
    if (!decorating && spots.jar) overlay += `<button class="pet-spot jar-spot" data-jar style="left:${spots.jar.l}%;top:${spots.jar.t}%;width:${spots.jar.w}%;height:${spots.jar.h}%" aria-label="Mood jar: how are you today?"></button>`
    if (!decorating && spots.pet) {
      const pn = room().petName || (room().pet === 'dog' ? 'your dog' : 'your cat')
      overlay += `<button class="pet-spot" data-pet style="left:${spots.pet.l}%;top:${spots.pet.t}%;width:${spots.pet.w}%;height:${spots.pet.h}%" aria-label="Pet ${esc(pn)}"></button>`
    }
    if (!decorating) {
      // every book on the shelf shows its title and author when you point at it
      const byId = new Map(s.books.map((b) => [b.id, b]))
      overlay += bookSpots.map((b) => {
        const bk = byId.get(b.id)
        if (!bk) return ''
        const cv = covers.get(b.id)?.src
        return `<a class="book-spot" href="#books" style="left:${b.l}%;top:${b.t}%;width:${Math.max(b.w, 1.2)}%;height:${b.h}%" aria-label="${esc(bk.title)}${bk.author ? ' by ' + esc(bk.author) : ''}">
          <span class="book-tip">${cv ? `<img src="${cv}" alt="">` : `<i style="background:${bk.color || '#8E7CC3'}"></i>`}<span><b>${esc(bk.title)}</b>${bk.author ? `<em>${esc(bk.author)}</em>` : ''}${bk.status === 'reading' ? `<em class="tip-reading">Reading now${bk.pages ? ` · ${Math.round(((bk.page || 0) / bk.pages) * 100)}%` : ''}</em>` : bk.rating ? `<em class="tip-stars">${'★'.repeat(bk.rating)}</em>` : ''}</span></span></a>`
      }).join('')
    }
    box.innerHTML = svg + overlay
  }

  /* ---------- top bar ---------- */

  function renderTop() {
    $('#room-hint', el).textContent = decorating ? 'Tap the bed, shelf, desk, chair, picture, window, rug, walls or floor to change it' : 'Tap something in your room'
    $('#room-actions', el).innerHTML = decorating
      ? `<button class="ghost-dark" data-gallery>Change room</button><button class="ghost-dark" data-cancel>Cancel</button><button class="primary" data-save>Save</button>`
      : `<button class="decorate-btn" data-amb aria-expanded="${!$('#amb', el).hidden}" aria-label="Weather and sounds">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1-.6-8A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 .5 7"/>${playing() ? '<path d="M12 13v7M12 13l3-1"/>' : ''}</svg>
          <span class="amb-label">${weather ? `${weather.temp}°` : playing() ? SOUNDS[playing()] : 'Ambience'}</span>
        </button>
        <button class="decorate-btn" data-gallery>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 10l9-6 9 6v10H3z"/><path d="M9 20v-6h6v6"/></svg>
          Rooms
        </button>
        <button class="decorate-btn" data-decorate>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3l2 2-9 9-3 1 1-3z"/><path d="M5 13c-2 0-3 2-3 4 0 1.5-1 2.5-1 2.5S3 21 5 21c3 0 4-2 4-4 0-2-2-4-4-4z"/></svg>
          Decorate
        </button>`
    page.classList.toggle('decorating', decorating)
    document.body.classList.toggle('decorating', decorating)
  }

  /* ---------- options for one part ---------- */

  function renderPanel() {
    const panel = $('#decor', el)
    page.classList.toggle('has-part', !!(decorating && part))
    if (!decorating || !part) { panel.hidden = true; return }
    const r = draft
    const own = (draft.theme || 'cozy') !== 'cozy' // furniture in the other rooms has its own design
    const rows = PARTS[part].options.filter(([, key]) => !(own && /Style$/.test(key) && key !== 'wallStyle' && key !== 'floorStyle')).map(([label, key, list]) => {
      if (list === 'photo') {
        return `<section><p class="sub">Put a photo of a place you love outside the window: the sea, your city, mountains…</p>
          <div class="photo-row"><label class="primary small photo-pick">Choose a photo<input type="file" accept="image/*" class="sr-only" data-window-photo></label>
          ${windowPhoto ? '<button class="ghost-dark small" data-window-clear>Remove</button>' : ''}</div></section>`
      }
      if (list === 'text') {
        return `<section><h3>${label}</h3><input class="decor-input" data-set-text="${key}" maxlength="20" placeholder="Mochi" value="${esc(r[key] || '')}"></section>`
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

  /* ---------- weather and sounds ---------- */

  function renderAmb() {
    const box = $('#amb', el)
    box.innerHTML = `
      <section>
        <h3>Weather in the window</h3>
        <p class="sub">${weatherOn() ? (weather ? `Now: ${weather.name.toLowerCase()}, ${weather.temp}°C` : 'Looking at the sky…') : 'Show the real weather where you are: rain, snow, clouds or sun.'}</p>
        <button class="${weatherOn() ? 'ghost-dark' : 'primary'} small" data-weather>${weatherOn() ? 'Turn off' : 'Show my weather'}</button>
      </section>
      ${seasonOf() ? `<section>
        <h3>Seasonal decoration</h3>
        <p class="sub">${{ winter: 'A little Christmas tree with gifts', love: 'Heart balloons for Valentine’s', spring: 'A cherry blossom branch', summer: 'Sunflowers in a vase', autumn: 'Pumpkins and autumn leaves' }[seasonOf()]} in your room.</p>
        <button class="ghost-dark small" data-seasonal>${getState().room.seasonal === 'off' ? 'Show it' : 'Hide it'}</button>
      </section>` : ''}
      <section>
        <h3>Sounds</h3>
        <div class="chips">
          <button class="chip ${!playing() ? 'on' : ''}" data-sound="">Quiet</button>
          ${Object.entries(SOUNDS).map(([id, n]) => `<button class="chip ${playing() === id ? 'on' : ''}" data-sound="${id}" aria-pressed="${playing() === id}">${n}</button>`).join('')}
        </div>
        <label class="vol"><span>Volume</span><input type="range" min="0" max="1" step="0.05" value="${getVolume()}" data-volume></label>
      </section>`
  }
  function toggleAmb(open = $('#amb', el).hidden) {
    $('#amb', el).hidden = !open
    if (open) renderAmb()
    renderTop()
  }
  document.addEventListener('pointerdown', function away(e) {
    if (!el.isConnected) return document.removeEventListener('pointerdown', away)
    const box = $('#amb', el)
    if (!box.hidden && !e.target.closest('#amb') && !e.target.closest('[data-amb]')) toggleAmb(false)
  })

  /* ---------- the mood jar ---------- */

  const jarDlg = document.createElement('dialog')
  jarDlg.className = 'sheet-dialog mood-dialog'
  el.appendChild(jarDlg)
  function openMoodJar() {
    const s = getState(), today = todayISO(), moods = s.moods || {}
    const d0 = new Date(); d0.setDate(1)
    const days = new Date(d0.getFullYear(), d0.getMonth() + 1, 0).getDate()
    const lead = (d0.getDay() + 6) % 7
    const cells = Array.from({ length: lead }, () => '<i class="mm-empty"></i>').join('') + Array.from({ length: days }, (_, i) => {
      const iso = today.slice(0, 8) + String(i + 1).padStart(2, '0'), v = moods[iso]
      return `<i class="mm-day ${iso === today ? 'today' : ''}" style="${v ? `--m:${MOODS[v - 1].c}` : ''}" title="${i + 1}${v ? ' · ' + MOODS[v - 1].name : ''}">${i + 1}</i>`
    }).join('')
    const mood = moods[today]
    jarDlg.innerHTML = `<div class="book-form">
      <h3>How are you today?</h3>
      <div class="mood-big">${MOODS.map((m) => `<button data-jar-mood="${m.v}" class="${mood === m.v ? 'on' : ''}" style="--m:${m.c}">${moodFace(m.v, m.c)}<span>${m.name}</span></button>`).join('')}</div>
      <p class="acc-label">${d0.toLocaleDateString('en-GB', { month: 'long' })}</p>
      <div class="mood-month"><b>M</b><b>T</b><b>W</b><b>T</b><b>F</b><b>S</b><b>S</b>${cells}</div>
      <div class="bf-actions"><span class="grow"></span><button class="primary" data-jar-close>Done</button></div></div>`
    if (!jarDlg.open) jarDlg.showModal()
  }
  jarDlg.addEventListener('click', (e) => {
    if (e.target === jarDlg || e.target.closest('[data-jar-close]')) return jarDlg.close()
    const m = e.target.closest('[data-jar-mood]')
    if (m) { setMood(todayISO(), Number(m.dataset.jarMood)); openMoodJar() }
  })

  /* ---------- choosing a whole room ---------- */

  const looks = {}
  const lookOf = (id) => looks[id] || (looks[id] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    drawRoom({ room: { ...DEFAULT_ROOM, ...THEME_PRESETS[id], theme: id }, tod: 'day', books: 8, notes: 3, events: 1, leaves: 7 }).svg
      .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')))

  function openGallery() {
    const g = $('#gallery', el)
    const t0 = (decorating ? draft : getState().room).theme || 'cozy'
    const now = THEMES[t0] ? t0 : 'cozy'
    g.innerHTML = `
      <div class="gallery-head">
        <div><h2 id="gallery-title">Choose your room</h2><p>Every room can still be decorated the way you like.</p></div>
        <button class="icon-btn" data-close-gallery aria-label="Close">×</button>
      </div>
      <div class="gallery-list">${Object.entries(THEMES).map(([id, t]) => `
        <button class="room-card ${now === id ? 'on' : ''}" data-pick-room="${id}" aria-pressed="${now === id}">
          <span class="room-card-img"><img src="${lookOf(id)}" alt=""></span>
          <span class="room-card-text"><b>${esc(t.name)}</b><span>${esc(t.note)}</span></span>
          <span class="room-card-use">${now === id ? 'Your room now' : 'Move in'}</span>
        </button>`).join('')}
      </div>`
    g.showModal()
  }

  $('#gallery', el).addEventListener('click', (e) => {
    const g = $('#gallery', el)
    if (e.target === g || e.target.closest('[data-close-gallery]')) return g.close()
    const pick = e.target.closest('[data-pick-room]')
    if (!pick) return
    const id = pick.dataset.pickRoom
    if (decorating) { draft = { ...draft, ...THEME_PRESETS[id], theme: id }; renderRoom(); renderPanel() }
    else { setRoom({ ...THEME_PRESETS[id], theme: id }); renderRoom(); toast(`Welcome to your ${THEMES[id].name.toLowerCase()}`) }
    window.dispatchEvent(new CustomEvent('planner:track', { detail: { name: 'room', props: { theme: id } } }))
    g.close()
  })

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
    if (t.closest('[data-gallery]')) return openGallery()
    if (t.closest('[data-window-clear]')) { windowPhoto = null; db.del('dream:window'); renderRoom(); renderPanel(); return }
    if (t.closest('[data-jar]')) return openMoodJar()
    if (t.closest('[data-amb]')) return toggleAmb()
    if (t.closest('[data-seasonal]')) { setRoom({ seasonal: getState().room.seasonal === 'off' ? 'on' : 'off' }); renderRoom(); renderAmb(); return }
    const snd = t.closest('[data-sound]')
    if (snd) { if (snd.dataset.sound) play(snd.dataset.sound); else stop(); renderAmb(); renderTop(); return }
    if (t.closest('[data-weather]')) {
      if (weatherOn()) { turnOffWeather(); weather = null; renderRoom(); renderAmb(); renderTop(); return }
      $('#amb .sub', el).textContent = 'Asking your browser where you are…'
      turnOnWeather().then((w) => { weather = w; renderRoom(); renderAmb(); renderTop(); window.dispatchEvent(new CustomEvent('planner:track', { detail: { name: 'weather_on' } })) })
        .catch((err) => { turnOffWeather(); toast(err.message); renderAmb() })
      return
    }
    const pt = t.closest('[data-pet]')
    if (pt) {
      // the pet is happy: a little hop, hearts, and a word
      const r = room(), name = r.petName || (r.pet === 'dog' ? 'Your dog' : 'Your cat')
      $('.room svg .pet-g', el)?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }], { duration: 700, easing: 'ease-out' })
      for (let i = 0; i < 3; i++) {
        const h = document.createElement('span')
        h.className = 'pet-heart'
        h.textContent = '♥'
        h.style.left = 30 + i * 20 + '%'
        h.style.animationDelay = i * 0.15 + 's'
        pt.appendChild(h)
        setTimeout(() => h.remove(), 1600)
      }
      toast(r.pet === 'dog' ? `${name} wags happily` : `${name} purrs`)
      return
    }
    const opt = t.closest('[data-set]')
    if (opt && decorating) { draft = { ...draft, [opt.dataset.set]: opt.dataset.val }; renderRoom(); renderPanel() }
  })

  el.addEventListener('input', (e) => {
    if (e.target.matches('[data-volume]')) return setVolume(Number(e.target.value))
    const k = e.target.dataset?.setText
    if (k && decorating) { draft = { ...draft, [k]: e.target.value.trim() }; renderRoom() }
  })

  render()
  const off = subscribe(renderRoom)
  const tick = setInterval(() => { renderRoom(); getWeather() }, 5 * 60 * 1000)
  return () => { off(); clearInterval(tick); document.body.classList.remove('decorating') }
}
