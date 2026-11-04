// Books: what you are reading now, what you want to read, and what you have finished.
// Each book keeps its progress, reading time, a rating, a short review and your favourite quotes.
// Every book also appears on the shelf in your room.

import { getState, subscribe, add, update, remove, restore, pick, uid, COVER_COLORS, todayISO, markDiaryDay, setReadingGoal } from '../store.js'
import * as db from '../db.js'
import { appendDiaryText } from './diary.js'
import { $, esc, toast, isoToDate } from '../ui.js'

const coverKey = (id) => 'cover:' + id
const covers = new Map() // id -> picture, so covers are read from storage only once
const STATUS = { reading: 'Reading now', want: 'Want to read', done: 'Finished' }
const statusOf = (b) => b.status || 'done' // books from before had no status: they were read

async function coverFor(book) {
  if (!book.hasCover) return null
  if (!covers.has(book.id)) covers.set(book.id, (await db.get(coverKey(book.id))) || null)
  return covers.get(book.id)
}

function plainCover(book) {
  return `<div class="cover-plain" style="--c:${book.color}">
    <span class="cp-title">${esc(book.title)}</span>
    ${book.author ? `<span class="cp-author">${esc(book.author)}</span>` : ''}
  </div>`
}

const pct = (b) => (b.pages ? Math.min(100, Math.round(((b.page || 0) / b.pages) * 100)) : 0)
const mins = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${Math.round(m % 60)} min` : `${Math.round(m)} min`)
const clock = (ms) => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` }
const stars = (n, attr) => [1, 2, 3, 4, 5].map((i) => `<button type="button" class="bk-star" ${attr}="${i}" aria-pressed="${(n || 0) >= i}" aria-label="${i} star${i > 1 ? 's' : ''}">★</button>`).join('')

export function mount(el) {
  el.innerHTML = `
    <section class="books-page">
      <header class="page-head">
        <div>
          <h2>Books</h2>
          <p id="b-sub"></p>
        </div>
        <button class="primary" id="b-add">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add a book
        </button>
      </header>
      <div class="reading-top" id="b-top"></div>
      <div class="shelves" id="b-shelves"></div>
    </section>

    <dialog class="sheet-dialog" id="b-dialog" aria-labelledby="b-dialog-title">
      <form method="dialog" id="b-form" class="book-form">
        <h3 id="b-dialog-title">Add a book</h3>
        <div class="bf-grid">
          <label class="cover-drop" id="b-drop">
            <span id="b-preview" class="cover-preview"><span>Add the cover</span></span>
            <input type="file" accept="image/*" id="b-file" class="sr-only">
          </label>
          <div class="bf-fields">
            <label>Title<input id="b-title" required placeholder="The Little Prince"></label>
            <label>Author<input id="b-author" placeholder="Antoine de Saint-Exupéry"></label>
            <div class="seg bf-status" role="radiogroup" aria-label="Status">
              ${Object.entries(STATUS).map(([k, v]) => `<button type="button" role="radio" data-status-pick="${k}">${v}</button>`).join('')}
            </div>
            <label>Number of pages<input id="b-pages" type="number" min="1" inputmode="numeric" placeholder="320"></label>
          </div>
        </div>
        <div class="bf-actions">
          <button type="button" class="ghost danger" id="b-delete" hidden>Remove book</button>
          <span class="grow"></span>
          <button type="button" class="ghost" id="b-cancel">Cancel</button>
          <button type="submit" class="primary" id="b-save">Add to my shelf</button>
        </div>
      </form>
    </dialog>

    <dialog class="sheet-dialog book-detail" id="b-detail" aria-labelledby="bd-title"></dialog>`

  const dialog = $('#b-dialog', el)
  const detail = $('#b-detail', el)
  let editing = null       // book being edited in the form, or null for a new one
  let newCover = undefined // picture chosen in the form (null = removed)
  let formStatus = 'reading'
  let openId = null        // book shown in the detail sheet
  const book = (id) => getState().books.find((b) => b.id === id)

  /* ---------- the page ---------- */

  async function cardHTML(b) {
    const pic = await coverFor(b)
    const st = statusOf(b)
    const year = b.finishedOn ? isoToDate(b.finishedOn).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''
    const meta = st === 'reading' ? (b.pages ? `page ${b.page || 0} of ${b.pages}` : 'reading now') : st === 'done' ? year : 'on your list'
    return `<button class="book-card" data-book="${b.id}" aria-label="${esc(b.title)}${b.author ? ' by ' + esc(b.author) : ''}">
      <span class="cover">${pic ? `<img src="${pic}" alt="">` : plainCover(b)}${st === 'reading' && b.pages ? `<span class="cover-progress"><i style="width:${pct(b)}%"></i></span>` : ''}${b.timer ? '<span class="cover-live" title="Reading now">●</span>' : ''}</span>
      <span class="ledge" aria-hidden="true"></span>
      <span class="bc-title">${esc(b.title)}</span>
      <span class="bc-meta">${esc(b.author || '')}${b.author && meta ? ' · ' : ''}${esc(meta)}</span>
      ${st === 'done' && b.rating ? `<span class="bc-stars" aria-label="${b.rating} stars">${'★'.repeat(b.rating)}<span>${'★'.repeat(5 - b.rating)}</span></span>` : ''}
    </button>`
  }

  function topHTML() {
    const s = getState()
    const year = new Date().getFullYear()
    const goal = s.readingGoal?.[year] || 0
    const doneThisYear = s.books.filter((b) => statusOf(b) === 'done' && (b.finishedOn || '').startsWith(String(year))).length
    const total = s.books.reduce((m, b) => m + (b.minutes || 0), 0)
    const live = s.books.find((b) => b.timer)
    const r = 26, C = 2 * Math.PI * r, part = goal ? Math.min(1, doneThisYear / goal) : 0
    return `
      <div class="goal-card">
        <svg viewBox="0 0 64 64" class="goal-ring" aria-hidden="true"><circle cx="32" cy="32" r="${r}" class="gr-back"/><circle cx="32" cy="32" r="${r}" class="gr-front" stroke-dasharray="${(C * part).toFixed(1)} ${C.toFixed(1)}"/></svg>
        <div class="goal-text">
          ${goal ? `<b>${doneThisYear} of ${goal} books</b><span>your goal for ${year}</span>` : `<b>${doneThisYear} ${doneThisYear === 1 ? 'book' : 'books'} in ${year}</b><span>Set a goal for the year</span>`}
        </div>
        <form class="goal-form" id="b-goal"><input type="number" min="1" max="365" inputmode="numeric" value="${goal || ''}" placeholder="24" aria-label="Books this year"><button class="ghost-dark small" type="submit">${goal ? 'Change' : 'Set goal'}</button></form>
      </div>
      <div class="time-card"><b>${mins(total)}</b><span>read with the timer</span></div>
      ${live ? `<div class="live-card" data-book="${live.id}"><span class="live-dot"></span><div><b>Reading ${esc(live.title)}</b><span id="b-live-clock">${clock(Date.now() - live.timer)}</span></div><button class="primary small" data-stop="${live.id}">Stop</button></div>` : ''}`
  }

  async function render() {
    const books = getState().books
    const n = books.length
    const done = books.filter((b) => statusOf(b) === 'done').length
    $('#b-sub', el).textContent = n ? `${done} read · ${books.filter((b) => statusOf(b) === 'reading').length} reading now · ${books.filter((b) => statusOf(b) === 'want').length} on your list` : 'Keep track of what you read. Every book appears on the shelf in your room.'
    $('#b-top', el).innerHTML = n ? topHTML() : ''
    const shelves = $('#b-shelves', el)
    if (!n) {
      shelves.innerHTML = `<div class="empty-shelf"><p>Your shelf is waiting for its first book.</p><button class="primary" data-first>Add a book</button></div>`
      return
    }
    const groups = { reading: [], want: [], done: [] }
    books.forEach((b) => groups[statusOf(b)].push(b))
    groups.done.sort((a, b) => (b.finishedOn || '').localeCompare(a.finishedOn || ''))
    groups.reading.sort((a, b) => (b.timer || 0) - (a.timer || 0) || (b.createdAt || 0) - (a.createdAt || 0))
    const parts = []
    for (const k of ['reading', 'want', 'done']) {
      if (!groups[k].length) continue
      parts.push(`<section class="book-group"><h3>${STATUS[k]} <em>${groups[k].length}</em></h3><div class="book-grid">${(await Promise.all(groups[k].map(cardHTML))).join('')}</div></section>`)
    }
    if (shelves.isConnected) shelves.innerHTML = parts.join('')
    if (openId && detail.open) paintDetail()
  }

  /* ---------- one book: progress, timer, rating, quotes ---------- */

  async function paintDetail() {
    const b = book(openId)
    if (!b) { detail.close(); return }
    const pic = await coverFor(b)
    const st = statusOf(b)
    const keepQuote = $('#bd-quote', detail)?.value || ''
    const keepQPage = $('#bd-qpage', detail)?.value || ''
    const keepReview = document.activeElement?.id === 'bd-review' ? $('#bd-review', detail).value : null
    detail.innerHTML = `<div class="bd">
      <button class="icon-btn bd-close" data-close-detail aria-label="Close">×</button>
      <div class="bd-head">
        <span class="bd-cover">${pic ? `<img src="${pic}" alt="">` : plainCover(b)}</span>
        <div class="bd-info">
          <h3 id="bd-title">${esc(b.title)}</h3>
          ${b.author ? `<p class="bd-author">${esc(b.author)}</p>` : ''}
          <div class="seg bd-status" role="radiogroup" aria-label="Status">${Object.entries(STATUS).map(([k, v]) => `<button type="button" role="radio" aria-checked="${st === k}" data-set-status="${k}">${v}</button>`).join('')}</div>
          <button class="link-btn" data-edit="${b.id}">Edit title, cover or pages</button>
        </div>
      </div>

      ${st !== 'want' ? `<section class="bd-block">
        <h4>Progress</h4>
        ${b.pages ? `<div class="bd-progress"><div class="bar"><i style="width:${pct(b)}%"></i></div><span>${pct(b)}%</span></div>
        <div class="bd-pages">
          <label>I am on page <input id="bd-page" type="number" min="0" max="${b.pages}" value="${b.page || 0}" inputmode="numeric"></label> <span>of ${b.pages}</span>
          <button class="ghost small" data-add-pages="10">+10</button><button class="ghost small" data-add-pages="25">+25</button>
        </div>` : `<p class="muted">Add the number of pages to see how far you are. <button class="link-btn" data-edit="${b.id}">Add pages</button></p>`}
        <div class="bd-timer">
          ${b.timer ? `<span class="live-dot"></span><b id="bd-clock">${clock(Date.now() - b.timer)}</b><button class="primary small" data-stop="${b.id}">Stop reading</button>`
            : `<button class="primary small" data-start="${b.id}">▶ Start reading timer</button>`}
          <span class="muted">${b.minutes ? `${mins(b.minutes)} so far` : 'Time how long you read'}</span>
        </div>
      </section>` : ''}

      ${st === 'done' ? `<section class="bd-block">
        <h4>Your rating</h4>
        <div class="bd-stars">${stars(b.rating, 'data-rate')}</div>
        <label class="bd-finished">Finished on <input id="bd-finished" type="date" value="${b.finishedOn || todayISO()}"></label>
        <textarea id="bd-review" rows="3" placeholder="What did you think? A few words for later…">${esc(b.review || '')}</textarea>
      </section>` : ''}

      <section class="bd-block">
        <h4>Quotes and thoughts <em>${(b.quotes || []).length || ''}</em></h4>
        <form class="bd-quote-form" id="bd-qform">
          <textarea id="bd-quote" rows="2" placeholder="A line you love, or a thought…" required></textarea>
          <div><input id="bd-qpage" type="number" min="1" placeholder="page" inputmode="numeric" aria-label="Page"><button class="primary small" type="submit">Save</button></div>
        </form>
        <ul class="bd-quotes">${(b.quotes || []).map((q) => `<li>
          <blockquote>${esc(q.text)}</blockquote>
          <div class="bd-q-foot"><span>${q.page ? 'p. ' + q.page + ' · ' : ''}${new Date(q.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            <button class="link-btn" data-to-diary="${q.id}">Put in my diary</button>
            <button class="link-btn danger" data-del-quote="${q.id}" aria-label="Delete quote">Delete</button></div>
        </li>`).join('')}</ul>
      </section>
    </div>`
    $('#bd-quote', detail).value = keepQuote
    $('#bd-qpage', detail).value = keepQPage
    if (keepReview !== null) { const r = $('#bd-review', detail); r.value = keepReview; r.focus() }
  }

  function openDetail(id) { openId = id; paintDetail(); if (!detail.open) detail.showModal() }

  const setStatus = (b, st) => {
    const patch = { status: st }
    if (st === 'done' && !b.finishedOn) patch.finishedOn = todayISO()
    if (st === 'done' && b.pages) patch.page = b.pages
    if (st === 'reading' && !b.startedOn) patch.startedOn = todayISO()
    if (st !== 'reading' && b.timer) Object.assign(patch, stopPatch(b))
    update('books', b.id, patch)
    if (st === 'done') toast(`Well done! ${b.title} is finished`)
  }
  function stopPatch(b) {
    const m = (Date.now() - b.timer) / 60000
    if (m >= 5) markDiaryDay(todayISO(), true) // reading counts for the plant in your room too
    return { timer: null, minutes: (b.minutes || 0) + m }
  }
  function startTimer(id) {
    getState().books.filter((x) => x.timer && x.id !== id).forEach((x) => update('books', x.id, stopPatch(x)))
    const b = book(id)
    update('books', id, { timer: Date.now(), status: 'reading', startedOn: b.startedOn || todayISO() })
  }
  function stopTimer(id) {
    const b = book(id)
    if (!b?.timer) return
    const m = (Date.now() - b.timer) / 60000
    update('books', id, stopPatch(b))
    toast(m < 1 ? 'Timer stopped' : `You read for ${mins(m)}`)
  }

  // the clocks tick while a timer runs
  const tick = setInterval(() => {
    const live = getState().books.find((b) => b.timer)
    if (!live) return
    const c1 = $('#b-live-clock', el); if (c1) c1.textContent = clock(Date.now() - live.timer)
    const c2 = $('#bd-clock', detail); if (c2 && openId === live.id) c2.textContent = clock(Date.now() - live.timer)
  }, 1000)

  detail.addEventListener('click', async (e) => {
    const t = e.target
    const b = book(openId)
    if (t === detail || t.closest('[data-close-detail]')) return detail.close()
    if (!b) return
    const s = t.closest('[data-set-status]'); if (s) return setStatus(b, s.dataset.setStatus)
    if (t.closest('[data-edit]')) { detail.close(); return openForm(b) }
    const ap = t.closest('[data-add-pages]')
    if (ap) { const page = Math.min(b.pages, (b.page || 0) + Number(ap.dataset.addPages)); update('books', b.id, { page }); if (page >= b.pages) setStatus(book(b.id), 'done'); return }
    if (t.closest('[data-start]')) return startTimer(b.id)
    if (t.closest('[data-stop]')) return stopTimer(b.id)
    const r = t.closest('[data-rate]'); if (r) return update('books', b.id, { rating: Number(r.dataset.rate) === b.rating ? 0 : Number(r.dataset.rate) })
    const dq = t.closest('[data-del-quote]'); if (dq) return update('books', b.id, { quotes: (b.quotes || []).filter((q) => q.id !== dq.dataset.delQuote) })
    const td = t.closest('[data-to-diary]')
    if (td) {
      const q = (b.quotes || []).find((x) => x.id === td.dataset.toDiary)
      await appendDiaryText(todayISO(), `“${q.text}” — ${b.title}${b.author ? ', ' + b.author : ''}${q.page ? ' (p. ' + q.page + ')' : ''}`)
      toast('The quote is in your diary')
    }
  })
  detail.addEventListener('change', (e) => {
    const b = book(openId)
    if (!b) return
    if (e.target.id === 'bd-page') {
      const page = Math.max(0, Math.min(b.pages || Infinity, Number(e.target.value) || 0))
      update('books', b.id, { page })
      if (b.pages && page >= b.pages) setStatus(book(b.id), 'done')
    }
    if (e.target.id === 'bd-finished') update('books', b.id, { finishedOn: e.target.value })
    if (e.target.id === 'bd-review') update('books', b.id, { review: e.target.value.trim() })
  })
  detail.addEventListener('submit', (e) => {
    if (e.target.id !== 'bd-qform') return
    e.preventDefault()
    const b = book(openId)
    const text = $('#bd-quote', detail).value.trim()
    if (!text) return
    const page = Number($('#bd-qpage', detail).value) || null
    $('#bd-quote', detail).value = ''; $('#bd-qpage', detail).value = ''
    update('books', b.id, { quotes: [{ id: uid(), text, page, at: Date.now() }, ...(b.quotes || [])] })
  })
  detail.addEventListener('close', () => { openId = null })

  /* ---------- adding and editing ---------- */

  function paintStatusPick() { el.querySelectorAll('[data-status-pick]').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.statusPick === formStatus))) }

  function openForm(b = null) {
    editing = b
    newCover = undefined
    formStatus = b ? statusOf(b) : 'reading'
    paintStatusPick()
    $('#b-dialog-title', el).textContent = b ? 'Edit book' : 'Add a book'
    $('#b-save', el).textContent = b ? 'Save' : 'Add to my shelf'
    $('#b-delete', el).hidden = !b
    $('#b-title', el).value = b?.title || ''
    $('#b-author', el).value = b?.author || ''
    $('#b-pages', el).value = b?.pages || ''
    const prev = $('#b-preview', el)
    prev.innerHTML = '<span>Add the cover</span>'
    prev.style.backgroundImage = ''
    if (b) coverFor(b).then((pic) => { if (pic) { prev.innerHTML = ''; prev.style.backgroundImage = `url(${pic})` } })
    dialog.showModal()
    $('#b-title', el).focus()
  }

  $('#b-file', el).addEventListener('change', async (e) => {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    try {
      const { src } = await db.shrinkImage(f, 600)
      newCover = src
      const prev = $('#b-preview', el)
      prev.innerHTML = ''
      prev.style.backgroundImage = `url(${src})`
    } catch (err) { toast(err.message) }
  })

  $('#b-form', el).addEventListener('submit', async (e) => {
    e.preventDefault()
    const title = $('#b-title', el).value.trim()
    if (!title) return
    const pages = Number($('#b-pages', el).value) || null
    const data = { title, author: $('#b-author', el).value.trim(), pages, status: formStatus }
    if (formStatus === 'done') data.finishedOn = editing?.finishedOn || todayISO()
    if (formStatus === 'reading') data.startedOn = editing?.startedOn || todayISO()
    let id
    if (editing) {
      id = editing.id
      update('books', id, { ...data, ...(newCover ? { hasCover: true } : {}) })
    } else {
      id = add('books', { ...data, page: formStatus === 'done' && pages ? pages : 0, color: pick(COVER_COLORS), hasCover: !!newCover, createdAt: Date.now(), quotes: [], minutes: 0 }).id
    }
    if (newCover) {
      try { await db.set(coverKey(id), newCover); covers.set(id, newCover) } catch { toast('The cover could not be saved') }
      render()
    }
    dialog.close()
    if (!editing) { toast('Added to your bookshelf'); openDetail(id) }
  })

  el.addEventListener('click', (e) => {
    const sp = e.target.closest('[data-status-pick]')
    if (sp) { formStatus = sp.dataset.statusPick; return paintStatusPick() }
    if (e.target.closest('[data-first]')) return openForm()
    const stop = e.target.closest('#b-top [data-stop]')
    if (stop) { e.stopPropagation(); return stopTimer(stop.dataset.stop) }
    const card = e.target.closest('[data-book]')
    if (card && !e.target.closest('dialog')) openDetail(card.dataset.book)
  })
  el.addEventListener('submit', (e) => {
    if (e.target.id !== 'b-goal') return
    e.preventDefault()
    const n = Number(e.target.querySelector('input').value)
    if (n > 0) { setReadingGoal(new Date().getFullYear(), n); toast(`Goal set: ${n} books this year`) }
  })

  $('#b-cancel', el).addEventListener('click', () => dialog.close())
  $('#b-delete', el).addEventListener('click', async () => {
    if (!editing) return
    const id = editing.id
    const gone = remove('books', id)
    dialog.close()
    // the cover is only thrown away when the Undo button has gone
    toast(`Removed “${gone.item.title}”`, { label: 'Undo', run: () => restore('books', gone), expire: () => { if (!getState().books.some((b) => b.id === id)) { db.del(coverKey(id)).catch(() => {}); covers.delete(id) } } })
  })
  $('#b-add', el).addEventListener('click', () => openForm())

  render()
  const off = subscribe(render)
  return () => { off(); clearInterval(tick) }
}
