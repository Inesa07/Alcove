// The diary is one book: page 1, 2, 3… to the last page, two pages open at a time.
// Turn a page by clicking its outer edge. Each page can be lined, dotted, grid, plain
// or a ready-made layout (daily planner, lists, habit tracker, good things).
// On top you can write, draw, add stickers and photos. Pages are saved in IndexedDB.

import { getState, setDiaryBook, markDiaryDay, todayISO, uid } from '../store.js'
import * as db from '../db.js'
import { STICKERS, sticker } from '../stickers.js'
import { LAYOUTS, blockHTML } from '../templates.js'
import { $, $$, esc, debounce, toast } from '../ui.js'

const INKS = [['Ink', '#3B3450'], ['Rose', '#D9637F'], ['Blue', '#4F79AC'], ['Green', '#4F8A6D'], ['Honey', '#C9902F'], ['Lilac', '#8E74C4']]
const SIZES = [['Thin', 3], ['Medium', 6], ['Thick', 12]]
const TINTS = { cream: '#FFFCF4', white: '#FFFFFF', pink: '#FFF2F4', blue: '#F2F6FD', sage: '#F3F8F0', lilac: '#F6F2FD' }
const CANVAS_W = 1000, CANVAS_H = 1300

const blankPage = () => ({ paper: 'lined', tint: 'cream', layout: 'lined', items: [], ink: null })
const key = (n) => 'bp:' + n
const hasContent = (p) => p.items.some((i) => i.type !== 'title') || !!p.ink
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const MIN_PAGES = 10 // a new diary starts with 10 pages and grows without a limit

export async function loadPage(n) {
  return { ...blankPage(), ...((await db.get(key(n))) || {}) }
}

async function savePage(n, page) {
  try {
    await db.set(key(n), page)
  } catch {
    toast('Could not save this page. Your browser storage may be full.')
  }
}

// Makes sure the book exists. Diary pages from the first version (one spread per day) become pages of the book.
export async function ensureBook() {
  const { count } = getState().diaryBook
  if (count >= MIN_PAGES) return count
  if (count > 0) { setDiaryBook({ count: MIN_PAGES }); return MIN_PAGES }
  const old = (await db.keys('page:')).sort()
  let n = 0
  for (const k of old) {
    const p = await db.get(k)
    if (!p) continue
    const date = String(k).slice(5)
    const dateLabel = new Date(date + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    for (const side of [0, 1]) {
      const items = (p.items || []).filter((i) => i.page === side).map(({ page, ...rest }) => rest)
      if (side === 0) items.unshift({ id: uid(), type: 'text', x: 8, y: 4, w: 84, rot: 0, text: dateLabel, color: '#8E74C4', fs: 4.6 })
      await savePage(n++, { ...blankPage(), paper: p.paper || 'lined', layout: p.paper || 'lined', tint: p.tint || 'cream', items, ink: (p.ink || [])[side] || null })
    }
  }
  const last = n
  if (n % 2) n++
  n = Math.max(n, MIN_PAGES)
  setDiaryBook({ count: n, spread: last ? Math.floor((last - 1) / 2) : 0 })
  return n
}

// Used by the quick input in "My room": writes a line on the last written page (or the next free one).
export async function appendDiaryText(_date, text) {
  let count = await ensureBook()
  let n = count - 1
  while (n > 0 && !hasContent(await loadPage(n))) n--
  let page = await loadPage(n)
  const texts = page.items.filter((i) => i.type === 'text').length
  if (page.layout in { daily: 1, lists: 1, habits: 1, thankful: 1 } || texts >= 6) {
    n++
    if (n >= count) { count += 2; setDiaryBook({ count }) }
    page = await loadPage(n)
  }
  const used = page.items.filter((i) => i.type === 'text').length
  page.items.push({ id: uid(), type: 'text', x: 8, y: 8 + used * 13, w: 84, rot: 0, text, color: INKS[0][1], fs: 5.6 })
  await savePage(n, page)
  markDiaryDay(todayISO(), true)
}

export function mount(el) {
  let spread = 0
  let pages = [blankPage(), blankPage()]
  let tool = 'hand'
  let color = INKS[0][1]
  let size = SIZES[1][1]
  let selected = null
  let popover = null
  let busy = false
  let layoutSide = 0 // which page the "Page" menu changes

  el.innerHTML = `
    <section class="diary-page">
      <header class="diary-head">
        <div class="day-title"><h2>My diary</h2><p id="d-pages"></p></div>
      </header>

      <div class="toolbar" role="toolbar" aria-label="Diary tools">
        <div class="tool-group">
          <button class="tool" data-tool="hand" aria-pressed="true" title="Move and write">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12"/><path d="M11 11.5v-7a1.5 1.5 0 0 1 3 0V12"/><path d="M14 11.5v-5a1.5 1.5 0 0 1 3 0V13"/><path d="M17 12v-2.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L4 15.5a1.6 1.6 0 0 1 2.5-2L8 15"/></svg><span>Move</span></button>
          <button class="tool" data-add="text" title="Add text">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 6h14M12 6v13M9 19h6"/></svg><span>Text</span></button>
          <button class="tool" data-tool="pen" aria-pressed="false" title="Draw">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></svg><span>Pen</span></button>
          <button class="tool" data-tool="eraser" aria-pressed="false" title="Erase drawing">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M16 4l5 5-10 10H6l-3-3z"/><path d="M11 9l5 5M6 19h14"/></svg><span>Eraser</span></button>
        </div>
        <div class="tool-group inks" aria-label="Colour">
          ${INKS.map(([n, c], i) => `<button class="ink ${i === 0 ? 'on' : ''}" data-ink="${c}" aria-label="${n}" title="${n}" style="--ink:${c}"></button>`).join('')}
          <span class="sep"></span>
          ${SIZES.map(([n, s], i) => `<button class="size ${i === 1 ? 'on' : ''}" data-size="${s}" aria-label="${n} line" title="${n}"><span style="--s:${Math.max(3, s * 0.9)}px"></span></button>`).join('')}
        </div>
        <div class="tool-group">
          <button class="tool" data-pop="stickers" title="Stickers">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 21a9 9 0 1 1 9-9c0 1-1 2-2 2h-3a4 4 0 0 0-4 4v3"/><path d="M12 21c0-5 4-9 9-9"/></svg><span>Stickers</span></button>
          <label class="tool" title="Add a photo">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/></svg><span>Photo</span>
            <input type="file" accept="image/*" id="d-photo" class="sr-only">
          </label>
          <button class="tool" data-pop="layout" title="How the pages look">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="4" width="8" height="16" rx="1.5"/><rect x="13" y="4" width="8" height="16" rx="1.5"/><path d="M5.5 8h3M5.5 11h3M15.5 8h3M15.5 11h3"/></svg><span>Page</span></button>
        </div>
        <div class="popover" id="d-pop" hidden></div>
      </div>

      <div class="book" id="book">
        <div class="page" data-side="0"></div>
        <div class="spine" aria-hidden="true"></div>
        <div class="page" data-side="1"></div>
      </div>
      <p class="diary-tip" id="d-tip"></p>
    </section>`

  const book = $('#book', el)
  const pageEls = $$('.page', book)
  const count = () => getState().diaryBook.count
  const num = (side) => spread * 2 + side // page index in the book (0-based)

  const saveSoon = debounce(() => {
    savePage(num(0), pages[0])
    savePage(num(1), pages[1])
    if (hasContent(pages[0]) || hasContent(pages[1])) markDiaryDay(todayISO(), true)
  }, 400)

  /* ---------- drawing the pages ---------- */

  function itemHTML(it) {
    if (it.type === 'block' || it.type === 'title') return blockHTML(it.type === 'title' ? { ...it, kind: 'title' } : it)
    const style = `left:${it.x}%;top:${it.y}%;width:${it.w}%;--rot:${it.rot || 0}deg`
    const sel = selected === it.id ? ' selected' : ''
    let inner = ''
    if (it.type === 'text') inner = `<span class="grip" data-grip aria-hidden="true"></span><div class="text" contenteditable="true" spellcheck="true" role="textbox" aria-multiline="true" aria-label="Text on page" style="color:${it.color};--fs:${it.fs || 5.6}"></div>`
    if (it.type === 'sticker') inner = sticker(it.sticker)
    if (it.type === 'photo') inner = `<figure class="polaroid"><img src="${it.src}" alt="Photo" style="aspect-ratio:${1 / (it.ratio || 1)}"><span class="tape" aria-hidden="true"></span></figure>`
    return `<div class="item item-${it.type}${sel}" data-id="${it.id}" style="${style}">
      ${inner}
      <button class="item-del" data-del aria-label="Remove">×</button>
      <span class="item-size" data-resize aria-hidden="true"></span>
    </div>`
  }

  function renderPage(side) {
    const p = pageEls[side]
    const page = pages[side]
    const n = num(side)
    p.className = `page paper-${page.paper}`
    p.setAttribute('style', `--tint:${TINTS[page.tint] || TINTS.cream}`)
    const blocks = page.items.filter((i) => i.type === 'block' || i.type === 'title')
    const free = page.items.filter((i) => i.type !== 'block' && i.type !== 'title')
    const lastSpread = num(1) >= count() - 1
    p.innerHTML = `
      <div class="paper" aria-hidden="true"></div>
      <div class="blocks">${blocks.map(itemHTML).join('')}</div>
      <div class="items">${free.map(itemHTML).join('')}</div>
      <canvas class="ink-layer" width="${CANVAS_W}" height="${CANVAS_H}" aria-label="Drawing on page ${n + 1}"></canvas>
      <footer class="page-foot"><span class="page-num">${n + 1}</span></footer>
      ${side === 0
        ? (spread > 0 ? `<button class="edge edge-prev" data-turn="-1" aria-label="Previous page"><span class="curl" aria-hidden="true"></span></button>` : '')
        : `<button class="edge edge-next" data-turn="1" aria-label="${lastSpread ? 'New page' : 'Next page'}"><span class="curl" aria-hidden="true"></span></button>`}`
    free.filter((it) => it.type === 'text').forEach((it) => { $(`[data-id="${it.id}"] .text`, p).innerText = it.text || '' })
    if (page.ink) {
      const img = new Image()
      img.onload = () => $('canvas', p)?.getContext('2d').drawImage(img, 0, 0)
      img.src = page.ink
    }
  }

  function render() {
    $('#d-pages', el).textContent = `Pages ${num(0) + 1}–${num(1) + 1}`
    renderPage(0)
    renderPage(1)
    book.dataset.using = tool
    $('#d-tip', el).textContent = {
      hand: 'Click the edge of a page to turn it. Drag stickers and photos, pull the little corner to resize.',
      pen: 'Draw anywhere on the pages.',
      eraser: 'Rub over your drawing to erase it.',
    }[tool]
  }

  // Neighbouring pages are read ahead of time, so a page turn can start the moment you click.
  const ahead = new Map()
  const readSpread = (s) => {
    if (!ahead.has(s)) ahead.set(s, Promise.all([loadPage(s * 2), loadPage(s * 2 + 1)]))
    return ahead.get(s)
  }

  async function openSpread(s, loaded) {
    spread = s
    selected = null
    pages = loaded || await readSpread(s)
    ahead.clear()
    setDiaryBook({ spread })
    render()
    if (s > 0) readSpread(s - 1)
    readSpread(s + 1)
  }

  // A picture of a page at this moment: a copy of its HTML, with typed text and drawings carried over.
  function snapshot(pageEl) {
    pageEl.querySelectorAll('input').forEach((i) => i.setAttribute('value', i.value))
    pageEl.querySelectorAll('textarea').forEach((t) => { t.textContent = t.value })
    const copy = pageEl.cloneNode(true)
    const from = pageEl.querySelectorAll('canvas'), to = copy.querySelectorAll('canvas')
    from.forEach((c, i) => to[i].getContext('2d').drawImage(c, 0, 0))
    copy.querySelectorAll('.edge').forEach((e) => e.remove())
    copy.removeAttribute('data-side')
    copy.classList.add('page-copy')
    copy.inert = true
    return copy
  }

  // Pictures inside a copy need a moment to be ready; wait so they do not blink.
  const imagesReady = (...els) => Promise.all(els.flatMap((el) => [...el.querySelectorAll('img')].map((i) => i.decode?.().catch(() => {}))))

  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const stacked = () => getComputedStyle(book).gridTemplateColumns.split(' ').length < 3

  // Turning a page: the leaf lifts, curves through the spine with a soft shadow and lands on the other side.
  async function turn(dir) {
    if (busy) return
    const target = spread + dir
    if (target < 0) return
    if (dir > 0 && target * 2 >= count()) setDiaryBook({ count: count() + 2 })
    busy = true
    closePop()

    if (reduceMotion() || stacked()) {
      book.classList.add('fade-out')
      await wait(reduceMotion() ? 0 : 180)
      await openSpread(target)
      book.classList.remove('fade-out')
      busy = false
      return
    }

    const goingOn = dir > 0
    const turning = pageEls[goingOn ? 1 : 0]   // the page that lifts
    const staying = pageEls[goingOn ? 0 : 1]   // the other side, where the leaf lands

    const bookBox = book.getBoundingClientRect()
    const place = (el, ref) => {
      const r = ref.getBoundingClientRect()
      Object.assign(el.style, { left: r.left - bookBox.left + 'px', top: r.top - bookBox.top + 'px', width: r.width + 'px', height: r.height + 'px' })
    }
    const gap = pageEls[1].getBoundingClientRect().left - pageEls[0].getBoundingClientRect().right

    const next = await readSpread(target) // usually ready already

    // A real two-sided leaf, like paper: the front is the page you are turning,
    // the back is the page that lands on the other side. It turns around the spine in 3D,
    // and only its transform moves, so the browser can do it on the graphics card.
    const stage = document.createElement('div')
    stage.className = 'flip-stage'
    const cover = document.createElement('div')       // keeps the old page on the landing side until the leaf covers it
    cover.className = 'flip-cover'
    cover.appendChild(snapshot(staying))
    place(cover, staying)
    const leaf = document.createElement('div')
    leaf.className = 'flip-leaf ' + (goingOn ? 'from-right' : 'from-left')
    const front = document.createElement('div')
    front.className = 'flip-face front'
    front.appendChild(snapshot(turning))
    leaf.appendChild(front)
    place(leaf, turning)
    leaf.style.transformOrigin = goingOn ? `${-gap / 2}px 50%` : `calc(100% + ${gap / 2}px) 50%`
    stage.append(cover, leaf)
    book.append(stage)

    // The new pages go in place underneath; the leaf and cover hide the change.
    await openSpread(target, next)
    const back = document.createElement('div')
    back.className = 'flip-face back'
    back.appendChild(snapshot(pageEls[goingOn ? 0 : 1]))
    leaf.appendChild(back)
    await imagesReady(stage)

    // Let the browser prepare the layers before moving, so the first frame is not late.
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)

    const end = goingOn ? -180 : 180
    const anim = leaf.animate(
      [{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${end}deg)` }],
      { duration: 1000, easing: 'cubic-bezier(.45, .05, .25, 1)', fill: 'forwards' }
    )
    await anim.finished.catch(() => {})
    stage.remove()
    busy = false
  }

  /* ---------- adding things ---------- */

  const emptierSide = () => (pages[0].items.length <= pages[1].items.length ? 0 : 1)
  const tilt = () => Math.round((Math.random() * 10 - 5) * 10) / 10

  function addItem(side, it) {
    const item = { id: uid(), rot: 0, ...it }
    pages[side].items.push(item)
    selected = item.id
    setTool('hand')
    saveSoon()
    if (it.type === 'text') $(`[data-id="${item.id}"] .text`, book)?.focus()
  }

  function addText() {
    const side = pages[0].items.filter((i) => i.type === 'text').length < 5 ? 0 : 1
    const used = pages[side].items.filter((i) => i.type === 'text').length
    addItem(side, { type: 'text', x: 8, y: Math.min(8 + used * 13, 84), w: 84, text: '', color, fs: 5.6 })
  }

  const addSticker = (name) => addItem(emptierSide(), { type: 'sticker', sticker: name, x: 20 + Math.random() * 50, y: 20 + Math.random() * 55, w: 18, rot: tilt() * 2 })

  async function addPhoto(file) {
    try {
      const { src, ratio } = await db.shrinkImage(file, 900)
      addItem(emptierSide(), { type: 'photo', src, ratio, x: 14 + Math.random() * 20, y: 16 + Math.random() * 20, w: 56, rot: tilt() })
    } catch (err) { toast(err.message) }
  }

  function setLayout(side, id) {
    const L = LAYOUTS[id]
    const page = pages[side]
    page.layout = id
    page.paper = L.paper
    page.items = page.items.filter((i) => i.type !== 'block' && i.type !== 'title')
    if (L.blocks) {
      page.items.unshift(...L.blocks.map((b) => (b.kind === 'title'
        ? { id: uid(), type: 'title', x: b.x, y: b.y, w: b.w, h: b.h, text: b.text }
        : { id: uid(), type: 'block', ...b, data: {} })))
    }
    saveSoon()
    render()
  }

  /* ---------- toolbar and popovers ---------- */

  function setTool(t) {
    tool = t
    $$('[data-tool]', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === t)))
    render()
  }

  function closePop() { $('#d-pop', el).hidden = true; popover = null }

  function openPop(kind, side) {
    const pop = $('#d-pop', el)
    const id = kind + (side ?? '')
    if (popover === id) return closePop()
    popover = id
    if (kind === 'layout' && side !== undefined) layoutSide = side
    if (kind === 'stickers') {
      pop.innerHTML = `<p class="pop-title">Stickers</p><div class="sticker-grid">${Object.keys(STICKERS).map((n) => `<button data-sticker="${n}" aria-label="${n} sticker" title="${n}">${sticker(n)}</button>`).join('')}</div>`
    } else {
      side = layoutSide
      const page = pages[side]
      pop.innerHTML = `<div class="seg page-pick" role="radiogroup" aria-label="Which page">
          <button role="radio" aria-checked="${side === 0}" data-pick-side="0">Left page · ${num(0) + 1}</button>
          <button role="radio" aria-checked="${side === 1}" data-pick-side="1">Right page · ${num(1) + 1}</button>
        </div>
        <p class="pop-title">Look</p>
        <div class="layout-grid">${Object.entries(LAYOUTS).map(([lid, L]) => `<button class="layout-card ${page.layout === lid ? 'on' : ''}" data-layout="${lid}" data-side="${side}">
          <span class="lc-thumb lc-${lid}" aria-hidden="true"></span><span>${L.name}</span></button>`).join('')}</div>
        <p class="pop-title">Paper colour</p>
        <div class="paper-row">${Object.entries(TINTS).map(([tid, c]) => `<button class="tint ${page.tint === tid ? 'on' : ''}" data-tint="${tid}" data-side="${side}" aria-label="${tid} paper" title="${tid}" style="--t:${c}"></button>`).join('')}</div>
        ${page.items.some((i) => i.type === 'block') ? '<p class="pop-note">Choosing another look replaces the boxes on this page. Your text, stickers and drawings stay.</p>' : ''}`
    }
    pop.hidden = false
  }

  el.addEventListener('click', (e) => {
    const t = e.target
    const turnBtn = t.closest('[data-turn]')
    if (turnBtn) return turn(Number(turnBtn.dataset.turn))
    const toolBtn = t.closest('[data-tool]')
    if (toolBtn) return setTool(toolBtn.dataset.tool)
    if (t.closest('[data-add="text"]')) return addText()
    const pop = t.closest('[data-pop]')
    if (pop) return openPop(pop.dataset.pop)
    const ps = t.closest('[data-pick-side]')
    if (ps) { popover = null; return openPop('layout', Number(ps.dataset.pickSide)) }
    const st = t.closest('[data-sticker]')
    if (st) { closePop(); return addSticker(st.dataset.sticker) }
    const lay = t.closest('[data-layout]')
    if (lay) { const side = Number(lay.dataset.side); setLayout(side, lay.dataset.layout); popover = null; return openPop('layout', side) }
    const tint = t.closest('[data-tint]')
    if (tint) { const side = Number(tint.dataset.side); pages[side].tint = tint.dataset.tint; saveSoon(); render(); popover = null; return openPop('layout', side) }
    const ink = t.closest('[data-ink]')
    if (ink) {
      color = ink.dataset.ink
      $$('[data-ink]', el).forEach((b) => b.classList.toggle('on', b === ink))
      const it = findItem(selected)
      if (it?.type === 'text') { it.color = color; saveSoon(); render() } else if (tool !== 'pen') setTool('pen')
      return
    }
    const sz = t.closest('[data-size]')
    if (sz) {
      size = Number(sz.dataset.size)
      $$('[data-size]', el).forEach((b) => b.classList.toggle('on', b === sz))
      const it = findItem(selected)
      if (it?.type === 'text') { it.fs = { 3: 4.4, 6: 5.6, 12: 7.6 }[size]; saveSoon(); render() } else if (tool === 'hand') setTool('pen')
      return
    }
    const tk = t.closest('[data-tick]')
    if (tk) {
      const it = findItem(tk.closest('[data-id]').dataset.id)
      it.data = { ...it.data, [tk.dataset.tick]: !it.data?.[tk.dataset.tick] }
      tk.setAttribute('aria-pressed', String(!!it.data[tk.dataset.tick]))
      return saveSoon()
    }
    const cyc = t.closest('[data-cycle]')
    if (cyc) {
      const it = findItem(cyc.closest('[data-id]').dataset.id)
      const k = cyc.dataset.cycle
      it.data = { ...it.data, [k]: (Number(it.data?.[k] || 0) + 1) % 6 }
      saveSoon()
      return render()
    }
    const rate = t.closest('[data-rate]')
    if (rate) {
      const it = findItem(rate.closest('[data-id]').dataset.id)
      const k = rate.dataset.rate, v = Number(rate.dataset.val)
      it.data = { ...it.data, [k]: Number(it.data?.[k] || 0) === v ? 0 : v }
      saveSoon()
      return render()
    }
    const del = t.closest('[data-del]')
    if (del) {
      const id = del.closest('.item').dataset.id
      pages.forEach((p) => { p.items = p.items.filter((i) => i.id !== id) })
      selected = null
      saveSoon()
      return render()
    }
    if (popover && !t.closest('#d-pop')) closePop()
  })

  const findItem = (id) => pages[0].items.find((i) => i.id === id) || pages[1].items.find((i) => i.id === id)

  $('#d-photo', el).addEventListener('change', (e) => {
    const f = e.target.files[0]
    if (f) addPhoto(f)
    e.target.value = ''
  })

  /* ---------- typing in text and in the boxes of a layout ---------- */

  book.addEventListener('input', (e) => {
    const box = e.target.closest('.text')
    if (box) {
      const it = findItem(box.closest('.item').dataset.id)
      if (it) { it.text = box.innerText; saveSoon() }
      return
    }
    const f = e.target.closest('[data-k]')
    if (f) {
      const it = findItem(f.closest('[data-id]').dataset.id)
      if (it) { it.data = { ...it.data, [f.dataset.k]: f.value }; saveSoon() }
    }
  })
  book.addEventListener('focusout', (e) => {
    const box = e.target.closest?.('.text')
    if (!box) return
    const id = box.closest('.item').dataset.id
    const it = findItem(id)
    if (it && !it.text.trim()) { pages.forEach((p) => { p.items = p.items.filter((i) => i.id !== id) }); saveSoon(); setTimeout(render, 0) }
  })

  /* ---------- moving, resizing and drawing ---------- */

  let action = null

  book.addEventListener('pointerdown', (e) => {
    const pageEl = e.target.closest('.page')
    if (!pageEl || e.target.closest('.edge')) return
    const side = Number(pageEl.dataset.side)
    const rect = pageEl.getBoundingClientRect()

    if (tool === 'pen' || tool === 'eraser') {
      const cv = $('canvas', pageEl)
      const ctx = cv.getContext('2d')
      const at = (ev) => [((ev.clientX - rect.left) / rect.width) * CANVAS_W, ((ev.clientY - rect.top) / rect.height) * CANVAS_H]
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = tool === 'eraser' ? size * 4 : size
      const [x, y] = at(e)
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y + 0.1); ctx.stroke()
      action = { kind: 'draw', ctx, at, cv, side }
      cv.setPointerCapture(e.pointerId)
      e.preventDefault()
      return
    }

    const itemEl = e.target.closest('.item')
    if (!itemEl) {
      if (selected) { selected = null; $$('.item.selected', book).forEach((n) => n.classList.remove('selected')) }
      return
    }
    const it = findItem(itemEl.dataset.id)
    if (selected !== it.id) {
      selected = it.id
      $$('.item.selected', book).forEach((n) => n.classList.remove('selected'))
      itemEl.classList.add('selected')
    }
    if (e.target.closest('[data-del]')) return
    if (e.target.closest('.text') && !e.target.closest('[data-grip]')) return
    action = { kind: e.target.closest('[data-resize]') ? 'resize' : 'move', it, itemEl, rect, sx: e.clientX, sy: e.clientY, x: it.x, y: it.y, w: it.w }
    itemEl.setPointerCapture(e.pointerId)
    itemEl.classList.add('dragging')
    e.preventDefault()
  })

  book.addEventListener('pointermove', (e) => {
    if (!action) return
    if (action.kind === 'draw') {
      const [x, y] = action.at(e)
      action.ctx.lineTo(x, y); action.ctx.stroke(); action.ctx.beginPath(); action.ctx.moveTo(x, y)
      return
    }
    const dx = ((e.clientX - action.sx) / action.rect.width) * 100
    const dy = ((e.clientY - action.sy) / action.rect.height) * 100
    if (action.kind === 'move') {
      action.it.x = Math.max(-4, Math.min(100 - action.it.w + 4, action.x + dx))
      action.it.y = Math.max(-2, Math.min(96, action.y + dy))
      action.itemEl.style.left = action.it.x + '%'
      action.itemEl.style.top = action.it.y + '%'
    } else {
      action.it.w = Math.max(8, Math.min(100, action.w + dx))
      action.itemEl.style.width = action.it.w + '%'
    }
  })

  const finish = () => {
    if (!action) return
    if (action.kind === 'draw') {
      action.ctx.globalCompositeOperation = 'source-over'
      pages[action.side].ink = isBlank(action.cv) ? null : action.cv.toDataURL('image/png')
    } else action.itemEl.classList.remove('dragging')
    action = null
    saveSoon()
  }
  book.addEventListener('pointerup', finish)
  book.addEventListener('pointercancel', finish)

  function isBlank(cv) {
    const data = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data
    for (let i = 3; i < data.length; i += 64) if (data[i]) return false
    return true
  }

  const onKey = (e) => {
    const typing = e.target.closest?.('.text, input, textarea')
    if (typing) return
    if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
      pages.forEach((p) => { p.items = p.items.filter((i) => i.id !== selected) })
      selected = null; saveSoon(); render()
    }
    if (e.key === 'ArrowRight') turn(1)
    if (e.key === 'ArrowLeft') turn(-1)
    if (e.key === 'Escape') closePop()
  }
  // Trailing empty pages are not kept: the book ends after the last page you used.
  async function trimEnd() {
    let c = count()
    while (c > MIN_PAGES && num(1) < c - 2 && !hasContent(await loadPage(c - 1)) && !hasContent(await loadPage(c - 2)) && (await loadPage(c - 1)).layout === 'lined' && (await loadPage(c - 2)).layout === 'lined') c -= 2
    if (c !== count()) setDiaryBook({ count: c })
  }
  document.addEventListener('keydown', onKey)

  ensureBook().then(() => {
    const { count: c, spread: s } = getState().diaryBook
    openSpread(Math.min(s, Math.max(0, c / 2 - 1)))
  })
  return () => { document.removeEventListener('keydown', onKey); trimEnd() }
}
