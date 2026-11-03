// The diary is a book: one spread (two pages) for every day.
// On the pages you can write, draw with a pen, add stickers and photos,
// choose the paper and say how the day felt. Pages are saved in IndexedDB.

import { markDiaryDay, todayISO, uid } from '../store.js'
import * as db from '../db.js'
import { STICKERS, sticker } from '../stickers.js'
import { $, $$, esc, addDays, weekday, longDate, debounce, toast, isoToDate } from '../ui.js'

const INKS = [
  ['Ink', '#3B3450'], ['Rose', '#D9637F'], ['Blue', '#4F79AC'], ['Green', '#4F8A6D'], ['Honey', '#C9902F'], ['Lilac', '#8E74C4'],
]
const SIZES = [['Thin', 3], ['Medium', 6], ['Thick', 12]]
const PAPERS = { lined: 'Lined', dotted: 'Dotted', grid: 'Grid', plain: 'Plain' }
const TINTS = { cream: '#FFFCF4', white: '#FFFFFF', pink: '#FFF2F4', blue: '#F2F6FD', sage: '#F3F8F0', lilac: '#F6F2FD' }
const MOODS = [
  ['Heavy', '#8C9BC4', 'M8 16.5c2-2 6-2 8 0'], ['Low', '#A9C1D6', 'M8.5 16h7'], ['Calm', '#9CC7B4', 'M8 15c2 1.6 6 1.6 8 0'],
  ['Good', '#EBC86A', 'M7.5 14.5c2.2 2.6 6.8 2.6 9 0'], ['Bright', '#EDA0B4', 'M7 14c2.5 3.5 7.5 3.5 10 0'],
]
const CANVAS_W = 1000, CANVAS_H = 1300

const blankPage = () => ({ paper: 'lined', tint: 'cream', mood: null, items: [], ink: [null, null] })
const pageKey = (date) => 'page:' + date
const hasContent = (p) => p.items.length > 0 || p.ink.some(Boolean) || p.mood !== null

export async function loadPage(date) {
  return { ...blankPage(), ...((await db.get(pageKey(date))) || {}) }
}

async function savePage(date, page) {
  try {
    await db.set(pageKey(date), page)
    markDiaryDay(date, hasContent(page))
  } catch {
    toast('Could not save this page. Your browser storage may be full.')
  }
}

// Used by the quick input in "My room": adds a line of text to a day's page.
export async function appendDiaryText(date, text) {
  const page = await loadPage(date)
  const onLeft = page.items.filter((i) => i.page === 0).length
  page.items.push({ id: uid(), type: 'text', page: onLeft < 4 ? 0 : 1, x: 8, y: onLeft < 4 ? 26 + onLeft * 14 : 10, w: 84, rot: 0, text, color: INKS[0][1], fs: 5.6 })
  await savePage(date, page)
}

export function mount(el) {
  let date = (location.hash.split('/')[1]) || todayISO()
  let page = blankPage()
  let tool = 'hand'
  let color = INKS[0][1]
  let size = SIZES[1][1]
  let selected = null
  let popover = null

  el.innerHTML = `
    <section class="diary-page">
      <header class="diary-head">
        <div class="day-nav">
          <button class="icon-btn" data-day="-1" aria-label="Previous day">‹</button>
          <div class="day-title"><h2 id="d-weekday"></h2><p id="d-date"></p></div>
          <button class="icon-btn" data-day="1" aria-label="Next day">›</button>
        </div>
        <div class="day-jump">
          <button class="pill" data-today>Today</button>
          <label class="pill pick-date">Go to a day<input type="date" id="d-pick" aria-label="Go to a day"></label>
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
          <button class="tool" data-pop="paper" title="Paper">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7"/></svg><span>Paper</span></button>
        </div>
        <div class="popover" id="d-pop" hidden></div>
      </div>

      <div class="book" id="book">
        <div class="page" data-page="0"></div>
        <div class="spine" aria-hidden="true"></div>
        <div class="page" data-page="1"></div>
      </div>
      <p class="diary-tip" id="d-tip"></p>
    </section>`

  const book = $('#book', el)
  const pages = $$('.page', book)
  const save = debounce(() => savePage(date, page), 400)

  /* ---------- drawing the pages ---------- */

  function paperStyle() {
    return `--tint:${TINTS[page.tint] || TINTS.cream}`
  }

  function itemHTML(it) {
    const style = `left:${it.x}%;top:${it.y}%;width:${it.w}%;--rot:${it.rot || 0}deg`
    const sel = selected === it.id ? ' selected' : ''
    let inner = ''
    if (it.type === 'text') {
      inner = `<span class="grip" data-grip aria-hidden="true"></span><div class="text" contenteditable="true" spellcheck="true" role="textbox" aria-multiline="true" aria-label="Text on page" style="color:${it.color};--fs:${it.fs || 5.6}"></div>`
    }
    if (it.type === 'sticker') inner = sticker(it.sticker)
    if (it.type === 'photo') inner = `<figure class="polaroid"><img src="${it.src}" alt="${esc(it.alt || 'Photo')}" style="aspect-ratio:${1 / (it.ratio || 1)}"><span class="tape" aria-hidden="true"></span></figure>`
    return `<div class="item item-${it.type}${sel}" data-id="${it.id}" style="${style}">
      ${inner}
      <button class="item-del" data-del aria-label="Remove">×</button>
      <span class="item-size" data-resize aria-hidden="true"></span>
    </div>`
  }

  function renderPage(i) {
    const p = pages[i]
    p.className = `page paper-${page.paper}`
    p.setAttribute('style', paperStyle())
    const header = i === 0 ? `
      <header class="page-date">
        <span class="pd-day">${esc(weekday(date))}</span>
        <span class="pd-date">${esc(isoToDate(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }))}</span>
        <div class="moods" role="radiogroup" aria-label="How was today?">
          <span class="moods-q">Today felt</span>
          ${MOODS.map(([n, c, mouth], m) => `<button role="radio" aria-checked="${page.mood === m}" aria-label="${n}" title="${n}" data-mood="${m}" class="mood ${page.mood === m ? 'on' : ''}" style="--m:${c}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--m)"/><circle cx="9" cy="10" r="1.1" fill="#3B3450"/><circle cx="15" cy="10" r="1.1" fill="#3B3450"/><path d="${mouth}" fill="none" stroke="#3B3450" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>`).join('')}
        </div>
      </header>` : `<span class="page-num" aria-hidden="true">${isoToDate(date).getDate()}</span>`
    p.innerHTML = `<div class="paper" aria-hidden="true"></div>${header}<div class="items">${page.items.filter((it) => it.page === i).map(itemHTML).join('')}</div>
      <canvas class="ink-layer" width="${CANVAS_W}" height="${CANVAS_H}" aria-label="Drawing on page ${i + 1}"></canvas>`
    // fill text safely after the HTML is in place
    page.items.filter((it) => it.page === i && it.type === 'text').forEach((it) => {
      $(`[data-id="${it.id}"] .text`, p).innerText = it.text || ''
    })
    const cv = $('canvas', p)
    if (page.ink[i]) {
      const img = new Image()
      img.onload = () => cv.getContext('2d').drawImage(img, 0, 0)
      img.src = page.ink[i]
    }
  }

  function render() {
    $('#d-weekday', el).textContent = date === todayISO() ? 'Today' : weekday(date)
    $('#d-date', el).textContent = longDate(date)
    $('#d-pick', el).value = date
    renderPage(0)
    renderPage(1)
    book.dataset.using = tool
    $('#d-tip', el).textContent = {
      hand: 'Drag stickers and photos to move them. Pull the little corner to make them bigger. Click a text to write.',
      pen: 'Draw anywhere on the pages.',
      eraser: 'Rub over your drawing to erase it.',
    }[tool]
  }

  async function open(d) {
    date = d
    selected = null
    history.replaceState(null, '', '#diary/' + d)
    page = await loadPage(d)
    render()
  }

  /* ---------- adding things ---------- */

  const emptierPage = () => (page.items.filter((i) => i.page === 0).length <= page.items.filter((i) => i.page === 1).length ? 0 : 1)
  const randomTilt = () => Math.round((Math.random() * 10 - 5) * 10) / 10

  function addItem(it) {
    page.items.push({ id: uid(), rot: 0, ...it })
    selected = page.items[page.items.length - 1].id
    setTool('hand')
    render()
    save()
    if (it.type === 'text') {
      const t = $(`[data-id="${selected}"] .text`, book)
      t?.focus()
    }
  }

  function addText() {
    const onLeft = page.items.filter((i) => i.page === 0 && i.type === 'text').length
    const target = onLeft < 4 ? 0 : 1
    const count = page.items.filter((i) => i.page === target).length
    addItem({ type: 'text', page: target, x: 8, y: Math.min(target === 0 ? 26 + count * 12 : 8 + count * 12, 82), w: 84, text: '', color, fs: 5.6 })
  }

  function addSticker(name) {
    const p = emptierPage()
    addItem({ type: 'sticker', page: p, sticker: name, x: 20 + Math.random() * 50, y: 20 + Math.random() * 55, w: 18, rot: randomTilt() * 2 })
  }

  async function addPhoto(file) {
    try {
      const { src, ratio } = await db.shrinkImage(file, 900)
      const p = emptierPage()
      addItem({ type: 'photo', page: p, src, ratio, x: 14 + Math.random() * 20, y: 16 + Math.random() * 20, w: 56, rot: randomTilt() })
    } catch (err) {
      toast(err.message)
    }
  }

  /* ---------- toolbar ---------- */

  function setTool(t) {
    tool = t
    $$('[data-tool]', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === t)))
    book.dataset.using = t
    render()
  }

  function closePop() { $('#d-pop', el).hidden = true; popover = null }

  function openPop(kind) {
    const pop = $('#d-pop', el)
    if (popover === kind) return closePop()
    popover = kind
    if (kind === 'stickers') {
      pop.innerHTML = `<p class="pop-title">Stickers</p><div class="sticker-grid">${Object.keys(STICKERS).map((n) => `<button data-sticker="${n}" aria-label="${n} sticker" title="${n}">${sticker(n)}</button>`).join('')}</div>`
    } else {
      pop.innerHTML = `<p class="pop-title">Paper</p>
        <div class="paper-row">${Object.entries(PAPERS).map(([id, n]) => `<button class="chip ${page.paper === id ? 'on' : ''}" data-paper="${id}">${n}</button>`).join('')}</div>
        <p class="pop-title">Colour</p>
        <div class="paper-row">${Object.entries(TINTS).map(([id, c]) => `<button class="tint ${page.tint === id ? 'on' : ''}" data-tint="${id}" aria-label="${id} paper" title="${id}" style="--t:${c}"></button>`).join('')}</div>`
    }
    pop.dataset.kind = kind
    pop.hidden = false
  }

  el.addEventListener('click', (e) => {
    const t = e.target
    const day = t.closest('[data-day]')
    if (day) return open(addDays(date, Number(day.dataset.day)))
    if (t.closest('[data-today]')) return open(todayISO())
    const toolBtn = t.closest('[data-tool]')
    if (toolBtn) return setTool(toolBtn.dataset.tool)
    if (t.closest('[data-add="text"]')) return addText()
    const pop = t.closest('[data-pop]')
    if (pop) return openPop(pop.dataset.pop)
    const st = t.closest('[data-sticker]')
    if (st) { closePop(); return addSticker(st.dataset.sticker) }
    const paper = t.closest('[data-paper]')
    if (paper) { page.paper = paper.dataset.paper; save(); render(); popover = null; return openPop('paper') }
    const tint = t.closest('[data-tint]')
    if (tint) { page.tint = tint.dataset.tint; save(); render(); popover = null; return openPop('paper') }
    const ink = t.closest('[data-ink]')
    if (ink) {
      color = ink.dataset.ink
      $$('[data-ink]', el).forEach((b) => b.classList.toggle('on', b === ink))
      const it = page.items.find((i) => i.id === selected && i.type === 'text')
      if (it) { it.color = color; save(); render() } else if (tool === 'hand' || tool === 'eraser') setTool('pen')
      return
    }
    const sz = t.closest('[data-size]')
    if (sz) {
      size = Number(sz.dataset.size)
      $$('[data-size]', el).forEach((b) => b.classList.toggle('on', b === sz))
      const it = page.items.find((i) => i.id === selected && i.type === 'text')
      if (it) { it.fs = { 3: 4.4, 6: 5.6, 12: 7.6 }[size]; save(); render() } else if (tool === 'hand') setTool('pen')
      return
    }
    const mood = t.closest('[data-mood]')
    if (mood) { const m = Number(mood.dataset.mood); page.mood = page.mood === m ? null : m; save(); return render() }
    const del = t.closest('[data-del]')
    if (del) {
      const id = del.closest('.item').dataset.id
      page.items = page.items.filter((i) => i.id !== id)
      selected = null
      save()
      return render()
    }
    if (popover && !t.closest('#d-pop')) closePop()
  })

  $('#d-photo', el).addEventListener('change', (e) => {
    const f = e.target.files[0]
    if (f) addPhoto(f)
    e.target.value = ''
  })
  $('#d-pick', el).addEventListener('change', (e) => { if (e.target.value) open(e.target.value) })

  /* ---------- typing ---------- */

  book.addEventListener('input', (e) => {
    const box = e.target.closest('.text')
    if (!box) return
    const it = page.items.find((i) => i.id === box.closest('.item').dataset.id)
    if (it) { it.text = box.innerText; save() }
  })
  book.addEventListener('focusout', (e) => {
    const box = e.target.closest?.('.text')
    if (!box) return
    const id = box.closest('.item').dataset.id
    const it = page.items.find((i) => i.id === id)
    if (it && !it.text.trim()) { page.items = page.items.filter((i) => i.id !== id); save(); setTimeout(render, 0) }
  })

  /* ---------- moving, resizing and drawing ---------- */

  let action = null

  book.addEventListener('pointerdown', (e) => {
    const pageEl = e.target.closest('.page')
    if (!pageEl) return
    const i = Number(pageEl.dataset.page)
    const rect = pageEl.getBoundingClientRect()

    if (tool === 'pen' || tool === 'eraser') {
      const cv = $('canvas', pageEl)
      const ctx = cv.getContext('2d')
      const at = (ev) => [((ev.clientX - rect.left) / rect.width) * CANVAS_W, ((ev.clientY - rect.top) / rect.height) * CANVAS_H]
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = tool === 'eraser' ? size * 4 : size
      const [x, y] = at(e)
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y + 0.1); ctx.stroke()
      action = { kind: 'draw', ctx, at, cv, i }
      cv.setPointerCapture(e.pointerId)
      e.preventDefault()
      return
    }

    const itemEl = e.target.closest('.item')
    if (!itemEl) {
      if (selected) { selected = null; $$('.item.selected', book).forEach((n) => n.classList.remove('selected')) }
      return
    }
    const it = page.items.find((x) => x.id === itemEl.dataset.id)
    if (selected !== it.id) {
      selected = it.id
      $$('.item.selected', book).forEach((n) => n.classList.remove('selected'))
      itemEl.classList.add('selected')
    }
    if (e.target.closest('[data-del]')) return
    if (e.target.closest('.text') && !e.target.closest('[data-grip]')) return // let people type
    const resizing = !!e.target.closest('[data-resize]')
    action = { kind: resizing ? 'resize' : 'move', it, itemEl, rect, sx: e.clientX, sy: e.clientY, x: it.x, y: it.y, w: it.w }
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
      page.ink[action.i] = isBlank(action.cv) ? null : action.cv.toDataURL('image/png')
    } else {
      action.itemEl.classList.remove('dragging')
    }
    action = null
    save()
  }
  book.addEventListener('pointerup', finish)
  book.addEventListener('pointercancel', finish)

  function isBlank(cv) {
    const data = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data
    for (let i = 3; i < data.length; i += 64) if (data[i]) return false
    return true
  }

  const onKey = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !e.target.closest?.('.text, input')) {
      page.items = page.items.filter((i) => i.id !== selected)
      selected = null
      save()
      render()
    }
    if (e.key === 'Escape') closePop()
  }
  document.addEventListener('keydown', onKey)

  open(date)
  return () => document.removeEventListener('keydown', onKey)
}
