// Books you have read, with their covers. Every book also appears on the shelf in your room.

import { getState, subscribe, add, update, remove, pick, COVER_COLORS, todayISO } from '../store.js'
import * as db from '../db.js'
import { $, esc, toast, isoToDate } from '../ui.js'

const coverKey = (id) => 'cover:' + id
const covers = new Map() // id -> picture, so covers are read from storage only once

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
            <label>Finished on<input id="b-date" type="date"></label>
          </div>
        </div>
        <div class="bf-actions">
          <button type="button" class="ghost danger" id="b-delete" hidden>Remove book</button>
          <span class="grow"></span>
          <button type="button" class="ghost" id="b-cancel">Cancel</button>
          <button type="submit" class="primary" id="b-save">Add to my shelf</button>
        </div>
      </form>
    </dialog>`

  const dialog = $('#b-dialog', el)
  let editing = null      // book being edited, or null for a new one
  let newCover = undefined // picture chosen in the form (null = removed)

  async function render() {
    const books = [...getState().books].sort((a, b) => (b.finishedOn || '').localeCompare(a.finishedOn || ''))
    const n = books.length
    $('#b-sub', el).textContent = n ? `${n} ${n === 1 ? 'book' : 'books'} read. Each one is on the shelf in your room too.` : 'Collect the books you read. Each one appears on the shelf in your room.'
    const shelves = $('#b-shelves', el)
    if (!n) {
      shelves.innerHTML = `<div class="empty-shelf"><p>Your shelf is waiting for its first book.</p><button class="primary" data-first>Add a book</button></div>`
      return
    }
    const html = await Promise.all(books.map(async (b) => {
      const pic = await coverFor(b)
      const year = b.finishedOn ? isoToDate(b.finishedOn).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''
      return `<button class="book-card" data-book="${b.id}" aria-label="${esc(b.title)}${b.author ? ' by ' + esc(b.author) : ''}">
        <span class="cover">${pic ? `<img src="${pic}" alt="">` : plainCover(b)}</span>
        <span class="ledge" aria-hidden="true"></span>
        <span class="bc-title">${esc(b.title)}</span>
        <span class="bc-meta">${esc(b.author || '')}${b.author && year ? ' · ' : ''}${esc(year)}</span>
      </button>`
    }))
    if (shelves.isConnected) shelves.innerHTML = `<div class="book-grid">${html.join('')}</div>`
  }

  function openForm(book = null) {
    editing = book
    newCover = undefined
    $('#b-dialog-title', el).textContent = book ? 'Edit book' : 'Add a book'
    $('#b-save', el).textContent = book ? 'Save' : 'Add to my shelf'
    $('#b-delete', el).hidden = !book
    $('#b-title', el).value = book?.title || ''
    $('#b-author', el).value = book?.author || ''
    $('#b-date', el).value = book?.finishedOn || todayISO()
    const prev = $('#b-preview', el)
    prev.innerHTML = '<span>Add the cover</span>'
    prev.style.backgroundImage = ''
    if (book) coverFor(book).then((pic) => { if (pic) { prev.innerHTML = ''; prev.style.backgroundImage = `url(${pic})` } })
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
    const data = { title, author: $('#b-author', el).value.trim(), finishedOn: $('#b-date', el).value || todayISO() }
    let id
    if (editing) {
      id = editing.id
      update('books', id, { ...data, ...(newCover ? { hasCover: true } : {}) })
    } else {
      id = add('books', { ...data, color: pick(COVER_COLORS), hasCover: !!newCover, createdAt: Date.now() }).id
    }
    if (newCover) {
      try { await db.set(coverKey(id), newCover); covers.set(id, newCover) } catch { toast('The cover could not be saved') }
      render()
    }
    dialog.close()
    if (!editing) toast('Added to your bookshelf')
  })

  $('#b-cancel', el).addEventListener('click', () => dialog.close())
  $('#b-delete', el).addEventListener('click', async () => {
    if (!editing) return
    remove('books', editing.id)
    db.del(coverKey(editing.id)).catch(() => {})
    covers.delete(editing.id)
    dialog.close()
  })
  $('#b-add', el).addEventListener('click', () => openForm())
  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-first]')) return openForm()
    const card = e.target.closest('[data-book]')
    if (card) openForm(getState().books.find((b) => b.id === card.dataset.book))
  })

  render()
  return subscribe(render)
}
