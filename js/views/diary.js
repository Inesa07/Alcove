// The diary is one book: page 1, 2, 3… to the last page, two pages open at a time.
// Turn a page by clicking its outer edge. Each page can be lined, dotted, grid, plain
// or a ready-made layout (daily planner, lists, habit tracker, good things).
// On top you can write, draw, add stickers and photos. Pages are saved in IndexedDB.

import { getState, setDiaryBook, markDiaryDay, todayISO, uid } from '../store.js'
import * as db from '../db.js'
import { BIN_SVG, binKeys, throwAway, getBinned, forget, crumpleInto } from '../bin.js'
import { STICKERS, sticker } from '../stickers.js'
import { LAYOUTS, blockHTML, rowsOf, maxRows } from '../templates.js'
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
        <div class="diary-actions">
          <button class="decorate-btn" data-memories><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg><span>Memories</span><b class="mem-count" id="d-mem-count"></b></button>
          <button class="decorate-btn" data-search><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><span>Search</span></button>
          <button class="decorate-btn" data-pdf><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 14l2.5 2.5L15 14M12.5 10v6.5"/></svg><span>Save as PDF</span></button>
        </div>
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
          <button class="tool" data-pop="keep" title="Keep a page in your Memories">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg><span>Keep</span></button>
          <button class="tool" data-pop="trash" title="Throw a page away">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg><span>Delete</span></button>
        </div>
        <div class="popover" id="d-pop" hidden></div>
      </div>

      <div class="book" id="book">
        <div class="page" data-side="0"></div>
        <div class="spine" aria-hidden="true"></div>
        <div class="page" data-side="1"></div>
      </div>
      <div class="page-nav" id="d-nav">
        <nav aria-label="Pages">
          <button class="pn-btn" data-jump="first" title="Go to the first page">« First</button>
          <button class="pn-btn pn-arrow" data-turn="-1" aria-label="Previous pages">‹</button>
          <label class="pn-go">Page <input id="d-goto" type="number" min="1" inputmode="numeric" aria-label="Go to page"> <span>of <b id="d-total"></b></span></label>
          <button class="pn-btn pn-arrow" data-turn="1" aria-label="Next pages">›</button>
          <button class="pn-btn" data-jump="last" title="Go to the last page you wrote on">Last »</button>
        </nav>
        <button class="bin" id="d-bin" aria-label="Recycle bin" title="Recycle bin: pages you threw away">${BIN_SVG}<b class="bin-count" id="d-bin-count" hidden></b></button>
      </div>
      <p class="sr-only" id="d-tip" aria-live="polite"></p>
      <dialog class="sheet-dialog bin-dialog" id="d-bin-dialog" aria-labelledby="bin-title"></dialog>
    </section>`

  const book = $('#book', el)
  const pageEls = $$('.page', book)

  // the open book always fits on the screen, so you never scroll to see it
  function fitBook() {
    if (!book.isConnected) return window.removeEventListener('resize', fitBook)
    const nav = $('#d-nav', el)
    book.style.maxWidth = nav.style.maxWidth = ''
    if (window.innerWidth <= 720) return
    const pad = parseFloat(getComputedStyle(book.parentElement).paddingBottom) || 0
    const h = window.innerHeight - (book.getBoundingClientRect().top + window.scrollY) - pad - nav.offsetHeight - 14
    const w = Math.max(520, ((h - 28) / 1.3) * 2 + 46) + 'px' // the width that gives a book of height h
    book.style.maxWidth = nav.style.maxWidth = w
  }
  window.addEventListener('resize', fitBook)
  requestAnimationFrame(fitBook)
  setTimeout(fitBook, 400) // again once the fonts are in
  const count = () => getState().diaryBook.count
  const num = (side) => spread * 2 + side // page index in the book (0-based)

  // remembers which pages changed at the moment of the change, so turning the page quickly cannot lose them
  const pendingSave = new Map()
  const flushSave = debounce(() => {
    const list = [...pendingSave]
    pendingSave.clear()
    // a neighbour read ahead of time may now be old
    list.forEach(([n, p]) => savePage(n, p).then(() => ahead.delete(Math.floor(n / 2))))
    if (list.some(([, p]) => hasContent(p))) markDiaryDay(todayISO(), true)
  }, 400)
  const saveSoon = () => { ahead.delete(spread); pendingSave.set(num(0), pages[0]); pendingSave.set(num(1), pages[1]); flushSave() }

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
      <span class="item-rot" data-rotate title="Turn" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/></svg></span>
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
      ${page.heart ? '<span class="page-ribbon" aria-label="Kept in your Memories">♥</span>' : ''}

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
    $('#d-total', el).textContent = count()
    const go = $('#d-goto', el)
    if (document.activeElement !== go) go.value = num(0) + 1
    go.max = count()
    $('#d-mem-count', el).textContent = (getState().diaryBook.hearts || []).filter((n) => n < count()).length || ''
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

    // On a phone the two pages sit one above the other: each page lifts away to the left like a notebook sheet
    // (going on), or the earlier sheets come back from the left over the current ones (going back).
    if (!reduceMotion() && stacked()) {
      const bookBox = book.getBoundingClientRect()
      const next = await readSpread(target)
      const goingOn = dir > 0
      const make = (pageEl) => {
        const r = pageEl.getBoundingClientRect()
        const el = document.createElement('div')
        el.className = 'flip-sheet'
        el.appendChild(snapshot(pageEl))
        Object.assign(el.style, { left: r.left - bookBox.left + 'px', top: r.top - bookBox.top + 'px', width: r.width + 'px', height: r.height + 'px' })
        return el
      }
      const olds = [...pageEls].map(make)          // pictures of the pages you are leaving
      book.append(...olds)
      await openSpread(target, next)
      let sheets = olds
      if (!goingOn) {                          // the earlier pages come back from the left, over the old ones
        sheets = [...pageEls].map((pe) => { const el = make(pe); el.style.transform = 'rotateY(-90deg)'; return el })
        book.append(...sheets)
      }
      await imagesReady(...olds, ...sheets)
      await new Promise(requestAnimationFrame)
      await new Promise(requestAnimationFrame)
      const frames = goingOn ? [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-90deg)' }] : [{ transform: 'rotateY(-90deg)' }, { transform: 'rotateY(0deg)' }]
      const easing = goingOn ? 'cubic-bezier(.5, 0, .75, .4)' : 'cubic-bezier(.25, .6, .5, 1)'
      await Promise.all(sheets.map((el, i) => el.animate(frames, { duration: 900, delay: i * 110, easing, fill: 'forwards' }).finished)).catch(() => {})
      olds.concat(sheets).forEach((el) => el.remove())
      busy = false
      return
    }

    if (reduceMotion()) {
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
    const duration = 1400
    const anim = leaf.animate(
      [{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${end}deg)` }],
      { duration, easing: 'cubic-bezier(.42, 0, .22, 1)', fill: 'forwards' }
    )
    // The old page on the landing side fades away as the leaf comes over it, so its text never lingers.
    const fade = cover.animate(
      [{ opacity: 1 }, { opacity: 1, offset: 0.12 }, { opacity: 0, offset: 0.55 }, { opacity: 0 }],
      { duration, easing: 'ease-in-out', fill: 'forwards' }
    )
    await Promise.all([anim.finished, fade.finished]).catch(() => {})
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
    pop.classList.remove('pop-trash')
    if (kind === 'keep') {
      const card = (side) => {
        const pg = pages[side]
        const on = !!pg.heart
        return `<button class="trash-card keep-card ${on ? 'on' : ''}" data-keep="${side}" aria-pressed="${on}">
          <span class="tc-paper" style="--tint:${TINTS[pg.tint] || TINTS.cream}">${pg.items.length || pg.ink ? `<span class="tc-text">${esc(preview(pg))}</span>` : '<span class="tc-empty">Empty page</span>'}<span class="tc-num">${num(side) + 1}</span>${on ? '<span class="tc-heart">♥</span>' : ''}</span>
          <span class="tc-label">${side ? 'Right page' : 'Left page'}</span>
          <span class="tc-go keep-go">${on ? '♥ Kept' : '♡ Keep'}</span>
        </button>`
      }
      pop.classList.add('pop-trash')
      pop.innerHTML = `<p class="tc-title">Keep a page in your Memories</p>
        <div class="trash-cards">${card(0)}${card(1)}</div>
        <p class="tc-note">Special days are kept together in Memories, at the top of your diary. <button class="link-btn" data-open-memories>Open Memories</button></p>`
    } else if (kind === 'trash') {
      const card = (side) => {
        const pg = pages[side]
        const empty = !pg.items.length && !pg.ink
        const text = empty ? '' : preview(pg)
        return `<button class="trash-card ${empty ? 'empty' : ''}" data-trash="${side}" ${empty ? 'aria-disabled="true"' : ''} aria-label="Throw away page ${num(side) + 1}">
          <span class="tc-paper" style="--tint:${TINTS[pg.tint] || TINTS.cream}">
            ${empty ? '<span class="tc-empty">Empty page</span>' : `<span class="tc-text">${esc(text)}</span>`}
            <span class="tc-num">${num(side) + 1}</span>
          </span>
          <span class="tc-label">${side ? 'Right page' : 'Left page'}</span>
          <span class="tc-go"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>Throw away</span>
        </button>`
      }
      pop.classList.add('pop-trash')
      pop.innerHTML = `<p class="tc-title">Which page should go in the bin?</p>
        <div class="trash-cards">${card(0)}${card(1)}</div>
        <p class="tc-note">Changed your mind later? Open the bin under the book and put the page back.</p>`
    } else if (kind === 'stickers') {
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

  /* ---------- search, and the whole diary as a PDF ---------- */

  const allText = (p) => {
    const words = []
    p.items.forEach((i) => {
      if (i.type === 'text' && i.text) words.push(i.text)
      if ((i.type === 'block' || i.type === 'title') && i.data) Object.values(i.data).forEach((v) => typeof v === 'string' && v.trim() && words.push(v))
      if (i.type === 'title' && i.text) words.push(i.text)
    })
    return words.join(' · ').replace(/\s+/g, ' ').trim()
  }
  async function everyPage() {
    // the pages on screen may have changes that are not saved yet
    const list = await Promise.all(Array.from({ length: count() }, (_, n) => loadPage(n)))
    list[num(0)] = pages[0]; list[num(1)] = pages[1]
    return list
  }

  const searchDlg = document.createElement('dialog')
  searchDlg.className = 'sheet-dialog bin-dialog search-dialog'
  el.appendChild(searchDlg)
  let searchPages = []
  async function openSearch() {
    searchDlg.innerHTML = `<div class="book-form">
      <h3>Search your diary</h3>
      <input class="search-input" type="search" placeholder="A word, a name, a place…" aria-label="Search your diary" data-search-q>
      <ul class="mem-list search-list" aria-live="polite"></ul>
      <div class="bf-actions"><span class="grow"></span><button type="button" class="primary" data-close-search>Done</button></div></div>`
    searchDlg.showModal()
    searchPages = (await everyPage()).map((p, n) => ({ n, t: allText(p) }))
    showResults('')
  }
  function showResults(q) {
    const ul = $('.search-list', searchDlg)
    if (!ul) return
    q = q.trim().toLowerCase()
    if (!q) { ul.innerHTML = `<li class="search-hint">${searchPages.filter((p) => p.t).length} pages with writing. Type to find a word on any page.</li>`; return }
    const hits = searchPages.filter((p) => p.t.toLowerCase().includes(q))
    ul.innerHTML = hits.length ? hits.map(({ n, t }) => {
      const i = t.toLowerCase().indexOf(q), a = Math.max(0, i - 50)
      const snip = (a ? '…' : '') + esc(t.slice(a, i)) + '<mark>' + esc(t.slice(i, i + q.length)) + '</mark>' + esc(t.slice(i + q.length, i + q.length + 80)) + (i + q.length + 80 < t.length ? '…' : '')
      return `<li><button data-go-page="${n}"><span class="mem-heart">${n + 1}</span><span><b>Page ${n + 1}</b><span>${snip}</span></span></button></li>`
    }).join('') : `<li class="search-hint">Nothing found for “${esc(q)}”.</li>`
  }
  searchDlg.addEventListener('input', (e) => { if (e.target.matches('[data-search-q]')) showResults(e.target.value) })
  searchDlg.addEventListener('click', async (e) => {
    if (e.target === searchDlg || e.target.closest('[data-close-search]')) return searchDlg.close()
    const go = e.target.closest('[data-go-page]')
    if (go) { searchDlg.close(); await openSpread(Math.floor(Number(go.dataset.goPage) / 2)) }
  })

  async function savePDF() {
    const list = (await everyPage()).map((p, n) => ({ p, n })).filter(({ p }) => hasContent(p))
    if (!list.length) return toast('Your diary is empty. Write something first')
    document.getElementById('print-book')?.remove()
    const out = document.createElement('div')
    out.id = 'print-book'
    const name = getState().name
    out.innerHTML = `<section class="print-cover"><h1>${name ? esc(name) + '’s diary' : 'My diary'}</h1><p>${list.length} ${list.length === 1 ? 'page' : 'pages'} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p></section>` +
      list.map(({ p, n }) => {
        const blocks = p.items.filter((i) => i.type === 'block' || i.type === 'title')
        const free = p.items.filter((i) => i.type !== 'block' && i.type !== 'title')
        return `<div class="page print-page paper-${p.paper}" style="--tint:${TINTS[p.tint] || TINTS.cream}" data-print="${n}">
          <div class="paper"></div><div class="blocks">${blocks.map(itemHTML).join('')}</div><div class="items">${free.map(itemHTML).join('')}</div>
          ${p.ink ? `<img class="ink-layer" src="${p.ink}" alt="">` : ''}<footer class="page-foot"><span class="page-num">${n + 1}</span></footer></div>`
      }).join('')
    document.body.appendChild(out)
    list.forEach(({ p, n }) => p.items.filter((it) => it.type === 'text').forEach((it) => {
      const t = out.querySelector(`[data-print="${n}"] [data-id="${it.id}"] .text`)
      if (t) { t.innerText = it.text || ''; t.removeAttribute('contenteditable') }
    }))
    out.querySelectorAll('[contenteditable]').forEach((x) => x.removeAttribute('contenteditable'))
    await Promise.all([...out.querySelectorAll('img')].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r })))
    document.body.classList.add('printing')
    const done = () => { document.body.classList.remove('printing'); out.remove(); window.removeEventListener('afterprint', done) }
    window.addEventListener('afterprint', done)
    window.dispatchEvent(new CustomEvent('planner:track', { detail: { name: 'diary_pdf' } }))
    toast('Choose “Save as PDF” in the print window')
    setTimeout(() => window.print(), 50)
  }

  /* ---------- the memory chest: pages you kept ---------- */

  const memDlg = document.createElement('dialog')
  memDlg.className = 'sheet-dialog bin-dialog memories'
  el.appendChild(memDlg)
  async function openMemories() {
    const list = (getState().diaryBook.hearts || []).filter((n) => n < count())
    const rows = await Promise.all(list.map(async (n) => ({ n, p: await loadPage(n) })))
    memDlg.innerHTML = `<div class="book-form">
      <h3>Memories</h3>
      ${rows.length ? `<ul class="mem-list">${rows.map(({ n, p }) => `<li><button data-go-page="${n}"><span class="mem-heart">♥</span><span><b>Page ${n + 1}</b><span>${esc(preview(p))}</span></span></button></li>`).join('')}</ul>`
        : '<p class="bin-empty">No memories yet. On a page you want to remember, press <b>Keep</b> in the toolbar.</p>'}
      <div class="bf-actions"><span class="grow"></span><button type="button" class="primary" data-close-mem>Done</button></div></div>`
    if (!memDlg.open) memDlg.showModal()
  }
  memDlg.addEventListener('click', async (e) => {
    if (e.target === memDlg || e.target.closest('[data-close-mem]')) return memDlg.close()
    const go = e.target.closest('[data-go-page]')
    if (go) { memDlg.close(); await openSpread(Math.floor(Number(go.dataset.goPage) / 2)) }
  })

  /* ---------- the recycle bin ---------- */

  const binBtn = $('#d-bin', el)
  const binDlg = $('#d-bin-dialog', el)
  async function paintBinCount() {
    const k = (await binKeys()).length
    const c = $('#d-bin-count', el)
    if (!c) return
    c.hidden = !k
    c.textContent = k
  }
  paintBinCount()

  async function trashPage(side) {
    if (busy) return
    const empty = !pages[side].items.length && !pages[side].ink
    if (empty) { closePop(); return toast('This page is already empty') }
    busy = true
    closePop()
    const n = num(side)
    const copy = snapshot(pageEls[side])
    copy.querySelector('.page-trash')?.remove()
    const old = pages[side]
    await throwAway(n, old)
    pages[side] = { ...blankPage(), paper: old.paper === 'plain' && old.layout !== 'plain' ? 'lined' : old.paper, layout: old.paper === 'plain' && old.layout !== 'plain' ? 'lined' : old.paper, tint: old.tint }
    selected = null
    const anim = crumpleInto(copy, pageEls[side], binBtn)
    await new Promise((r) => setTimeout(r, 60))
    render()
    await savePage(n, pages[side])
    await anim
    paintBinCount()
    busy = false
  }

  const preview = (p) => {
    const words = []
    p.items.forEach((i) => {
      if (i.type === 'text' && i.text) words.push(i.text)
      if (i.type === 'block' && i.data) Object.values(i.data).forEach((v) => typeof v === 'string' && v.length > 1 && words.push(v))
    })
    const txt = words.join(' · ').replace(/\s+/g, ' ').trim()
    const extras = [p.ink ? 'a drawing' : '', p.items.some((i) => i.type === 'photo') ? 'photos' : '', p.items.some((i) => i.type === 'sticker') ? 'stickers' : ''].filter(Boolean)
    return (txt ? txt.slice(0, 140) + (txt.length > 140 ? '…' : '') : '') + (extras.length ? `${txt ? ' — ' : ''}with ${extras.join(', ')}` : '') || 'An empty page'
  }

  async function openBin() {
    const ks = await binKeys()
    const list = await Promise.all(ks.map(async (k) => ({ k, v: await getBinned(k) })))
    const when = (t) => new Date(t).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    binDlg.innerHTML = `<div class="book-form">
      <h3 id="bin-title">Recycle bin</h3>
      ${list.length ? `<ul class="bin-list">${list.map(({ k, v }) => v ? `<li>
          <div><b>Page ${v.n + 1}</b><span>Thrown away ${esc(when(v.at))}</span><p>${esc(preview(v.page))}</p></div>
          <div class="bin-actions"><button class="ghost" data-restore="${k}">Put back</button><button class="ghost danger" data-forget="${k}" aria-label="Delete forever">Delete forever</button></div>
        </li>` : '').join('')}</ul>` : '<p class="bin-empty">The bin is empty. Pages you throw away wait here, so you can put them back.</p>'}
      <div class="bf-actions">${list.length ? '<button type="button" class="ghost danger" data-empty-bin>Empty the bin</button>' : ''}<span class="grow"></span><button type="button" class="primary" data-close-bin>Done</button></div>
    </div>`
    if (!binDlg.open) binDlg.showModal()
  }

  async function restore(k) {
    const v = await getBinned(k)
    if (!v) return
    let n = v.n
    if (n >= count() || hasContent(await loadPage(n))) {
      // the old place is used now: the page goes after the last page of the book
      n = count()
      setDiaryBook({ count: count() + 2 })
    }
    await savePage(n, v.page)
    await forget(k)
    binDlg.close()
    paintBinCount()
    ahead.clear()
    await openSpread(Math.floor(n / 2))
    toast(`Page ${n + 1} is back`)
  }

  binBtn.addEventListener('click', openBin)
  binDlg.addEventListener('click', async (e) => {
    const t = e.target
    if (t === binDlg || t.closest('[data-close-bin]')) return binDlg.close()
    const r = t.closest('[data-restore]')
    if (r) return restore(r.dataset.restore)
    const f = t.closest('[data-forget]')
    if (f) { await forget(f.dataset.forget); paintBinCount(); return openBin() }
    if (t.closest('[data-empty-bin]')) { for (const k of await binKeys()) await forget(k); paintBinCount(); return openBin() }
  })

  el.addEventListener('click', async (e) => {
    const t = e.target
    const keep = t.closest('[data-keep]')
    if (keep) {
      const side = Number(keep.dataset.keep)
      const pg = pages[side]
      if (!pg.items.length && !pg.ink) return toast('Write something on this page first')
      pg.heart = !pg.heart
      const hearts = new Set(getState().diaryBook.hearts || [])
      pg.heart ? hearts.add(num(side)) : hearts.delete(num(side))
      setDiaryBook({ hearts: [...hearts].sort((a, b) => a - b) })
      saveSoon(); render(); popover = null; openPop('keep')
      if (pg.heart) toast('Kept in your Memories ♥')
      return
    }
    if (t.closest('[data-open-memories]')) { closePop(); return openMemories() }
    const trash = t.closest('[data-trash]')
    if (trash) return trashPage(Number(trash.dataset.trash))
    const jump = t.closest('[data-jump]')
    if (jump) {
      if (jump.dataset.jump === 'first') return spread === 0 ? toast('This is the first page') : openSpread(0)
      // the last page you wrote on (or the end of the book when it is all empty)
      const list = await everyPage()
      let n = list.length - 1
      while (n > 0 && !hasContent(list[n])) n--
      const s2 = Math.floor(n / 2)
      return s2 === spread ? toast(n ? 'This is the last page you wrote on' : 'Nothing is written yet') : openSpread(s2)
    }
    if (t.closest('[data-search]')) return openSearch()
    if (t.closest('[data-memories]')) return openMemories()
    if (t.closest('[data-pdf]')) return savePDF()
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
    const rows = t.closest('[data-rows]')
    if (rows) {
      // a box on a ready-made page gets one more line (or one less)
      const it = findItem(rows.closest('[data-id]').dataset.id)
      it.n = Math.max(1, Math.min(maxRows(it), rowsOf(it) + Number(rows.dataset.rows)))
      saveSoon()
      return render()
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

  // type a page number and press Enter
  const goTo = () => {
    const n = Math.round(Number($('#d-goto', el).value))
    if (!n) return
    const p = Math.max(1, Math.min(count(), n))
    $('#d-goto', el).blur()
    if (Math.floor((p - 1) / 2) !== spread) openSpread(Math.floor((p - 1) / 2))
    else render()
  }
  $('#d-goto', el).addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); goTo() } })
  $('#d-goto', el).addEventListener('change', goTo)

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
    if (e.target.closest('[data-rotate]')) {
      // turning: the angle follows the finger around the middle of the item
      const ir0 = itemEl.getBoundingClientRect()
      const cx = ir0.left + ir0.width / 2, cy = ir0.top + ir0.height / 2
      action = { kind: 'rotate', it, itemEl, cx, cy, start: Math.atan2(e.clientY - cy, e.clientX - cx), rot: it.rot || 0 }
      itemEl.classList.add('dragging')
      e.preventDefault()
      return
    }
    if (e.target.closest('.text') && !e.target.closest('[data-grip]')) return
    const ir = itemEl.getBoundingClientRect()
    action = { kind: e.target.closest('[data-resize]') ? 'resize' : 'move', it, itemEl, rect, side, sx: e.clientX, sy: e.clientY + window.scrollY, x: it.x, y: it.y, w: it.w, ox: e.clientX - ir.left, oy: e.clientY - ir.top }
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
    if (action.kind === 'rotate') {
      let deg = action.rot + ((Math.atan2(e.clientY - action.cy, e.clientX - action.cx) - action.start) * 180) / Math.PI
      deg = ((deg + 540) % 360) - 180
      if (Math.abs(deg) < 4) deg = 0 // a little pull towards straight
      action.it.rot = Math.round(deg * 10) / 10
      action.itemEl.style.setProperty('--rot', action.it.rot + 'deg')
      return
    }
    const dx = ((e.clientX - action.sx) / action.rect.width) * 100
    const dy = ((e.clientY + window.scrollY - action.sy) / action.rect.height) * 100
    if (action.kind === 'move') {
      // on a phone the pages are one under the other: near the top or bottom of the screen, scroll along
      if (stacked()) {
        if (e.clientY > window.innerHeight - 80) window.scrollBy(0, 14)
        else if (e.clientY < 80) window.scrollBy(0, -14)
      }
      // leaving the page: the item lifts off and floats with the pointer, so it can go to the other page
      if (action.ghost) { moveGhost(e); return }
      const pr = pageEls[action.side].getBoundingClientRect()
      if (e.clientX < pr.left - 4 || e.clientX > pr.right + 4 || e.clientY < pr.top - 4 || e.clientY > pr.bottom + 4) { startGhost(e, pr); return }
      action.it.x = Math.max(-4, Math.min(100 - action.it.w + 4, action.x + dx))
      action.it.y = Math.max(-2, Math.min(96, action.y + dy))
      action.itemEl.style.left = action.it.x + '%'
      action.itemEl.style.top = action.it.y + '%'
    } else {
      action.it.w = Math.max(8, Math.min(100, action.w + dx))
      action.itemEl.style.width = action.it.w + '%'
    }
  })

  function startGhost(e, pr) {
    const el0 = action.itemEl
    const layer = document.createElement('div')
    layer.className = 'drag-layer'
    Object.assign(layer.style, { left: pr.left + 'px', top: pr.top + 'px', width: pr.width + 'px', height: pr.height + 'px' })
    const clone = el0.cloneNode(true)
    clone.classList.add('ghosting')
    clone.classList.remove('selected')
    Object.assign(clone.style, { left: el0.offsetLeft + 'px', top: el0.offsetTop + 'px', width: el0.offsetWidth + 'px' })
    layer.appendChild(clone)
    document.body.appendChild(layer)
    el0.style.visibility = 'hidden'
    action.ghost = { layer, clone, x0: el0.offsetLeft, y0: el0.offsetTop, px: e.clientX, py: e.clientY }
    moveGhost(e)
  }
  function moveGhost(e) {
    const g = action.ghost
    g.clone.style.left = g.x0 + (e.clientX - g.px) + 'px'
    g.clone.style.top = g.y0 + (e.clientY - g.py) + 'px'
    // show which page it will land on
    const r = pageEls.map((pe) => pe.getBoundingClientRect())
    const over = r.findIndex((q) => e.clientX >= q.left && e.clientX <= q.right && e.clientY >= q.top && e.clientY <= q.bottom)
    pageEls.forEach((pe, i) => pe.classList.toggle('drop-here', i === over && i !== action.side))
  }
  function dropGhost(e) {
    const g = action.ghost
    const it = action.itemEl
    const r = pageEls.map((pe) => pe.getBoundingClientRect())
    const dist = (q) => Math.hypot(Math.max(q.left - e.clientX, 0, e.clientX - q.right), Math.max(q.top - e.clientY, 0, e.clientY - q.bottom))
    const to = dist(r[0]) <= dist(r[1]) ? 0 : 1
    const lr = g.layer.getBoundingClientRect()
    const left = lr.left + parseFloat(g.clone.style.left), top = lr.top + parseFloat(g.clone.style.top)
    const q = r[to]
    const item = action.it
    if (to !== action.side) {
      pages[action.side].items = pages[action.side].items.filter((i) => i !== item)
      pages[to].items.push(item)
      $('.items', pageEls[to]).appendChild(it)
    }
    item.x = Math.max(-4, Math.min(100 - item.w + 4, ((left - q.left) / q.width) * 100))
    item.y = Math.max(-2, Math.min(96, ((top - q.top) / q.height) * 100))
    it.style.left = item.x + '%'
    it.style.top = item.y + '%'
    it.style.visibility = ''
    pageEls.forEach((pe) => pe.classList.remove('drop-here'))
    // the floating copy glides into the exact spot, then the real one takes over
    const end = it.getBoundingClientRect(), now = g.clone.getBoundingClientRect()
    it.style.visibility = 'hidden'
    g.clone.animate([{ transform: `translate(0, 0) rotate(${item.rot || 0}deg) scale(1.06)` }, { transform: `translate(${end.left - now.left}px, ${end.top - now.top}px) rotate(${item.rot || 0}deg) scale(1)` }], { duration: 180, easing: 'cubic-bezier(.2, .8, .3, 1)', fill: 'forwards' })
      .finished.then(() => { it.style.visibility = ''; g.layer.remove() })
    selected = item.id
    it.classList.add('selected')
  }

  const finish = (e) => {
    if (!action) return
    if (action.ghost) dropGhost(e)
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
    // coming from the chest in the room
    if (location.hash.endsWith('/memories')) { history.replaceState(null, '', '#diary'); openMemories() }
  })
  return () => { document.removeEventListener('keydown', onKey); trimEnd() }
}
