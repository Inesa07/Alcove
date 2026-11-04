// Notes: anything you want to remember, on coloured paper notes.

import { getState, subscribe, add, update, remove, restore, pick, NOTE_COLORS } from '../store.js'
import { $, esc, toast } from '../ui.js'

export function mount(el) {
  let query = ''
  el.innerHTML = `
    <section class="notes-page">
      <header class="page-head">
        <div><h2>Notes</h2><p id="n-sub"></p></div>
        <label class="search"><span class="sr-only">Search notes</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input id="n-search" type="search" placeholder="Search your notes">
        </label>
      </header>
      <form class="note-new" id="n-form">
        <label for="n-text" class="sr-only">New note</label>
        <textarea id="n-text" rows="2" placeholder="Something to remember…"></textarea>
        <button class="primary" type="submit">Pin it</button>
      </form>
      <div class="note-wall" id="n-wall"></div>
    </section>`

  function render() {
    const notes = getState().notes
    $('#n-sub', el).textContent = notes.length ? `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}. They are pinned to the corkboard in your room too.` : 'Write what you want to remember. Nothing gets lost here.'
    const q = query.toLowerCase()
    const shown = q ? notes.filter((n) => n.text.toLowerCase().includes(q)) : notes
    const wall = $('#n-wall', el)
    if (!notes.length) { wall.innerHTML = ''; return }
    if (!shown.length) { wall.innerHTML = `<p class="muted">No notes with “${esc(query)}”.</p>`; return }
    wall.innerHTML = shown.map((n, i) => `
      <article class="note" style="--c:${n.color};--tilt:${[-1.2, 0.8, -0.4, 1.1, -0.8][i % 5]}deg" data-note="${n.id}">
        <span class="pin" aria-hidden="true"></span>
        <div class="note-text" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Note"></div>
        <footer>
          <span>${n.from ? `<b class="note-from">from ${esc(n.from)}</b> · ` : ''}${esc(new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }))}</span>
          <button class="note-color" data-recolor aria-label="Change colour"></button>
          <button class="note-del" data-del aria-label="Delete note">×</button>
        </footer>
      </article>`).join('')
    shown.forEach((n) => { el.querySelector(`[data-note="${n.id}"] .note-text`).innerText = n.text })
  }

  $('#n-form', el).addEventListener('submit', (e) => {
    e.preventDefault()
    const box = $('#n-text', el)
    const text = box.value.trim()
    if (!text) return
    add('notes', { text, color: pick(NOTE_COLORS), createdAt: Date.now() })
    box.value = ''
  })
  $('#n-text', el).addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) $('#n-form', el).requestSubmit()
  })
  $('#n-search', el).addEventListener('input', (e) => { query = e.target.value; render() })

  el.addEventListener('click', (e) => {
    const card = e.target.closest('[data-note]')
    if (!card) return
    const id = card.dataset.note
    if (e.target.closest('[data-del]')) { const gone = remove('notes', id); return gone && toast('Note deleted', { label: 'Undo', run: () => restore('notes', gone) }) }
    if (e.target.closest('[data-recolor]')) {
      const n = getState().notes.find((x) => x.id === id)
      update('notes', id, { color: NOTE_COLORS[(NOTE_COLORS.indexOf(n.color) + 1) % NOTE_COLORS.length] })
    }
  })
  el.addEventListener('focusout', (e) => {
    const box = e.target.closest?.('.note-text')
    if (!box) return
    const id = box.closest('[data-note]')?.dataset.note
    if (!id) return
    const text = box.innerText.trim()
    const n = getState().notes.find((x) => x.id === id)
    if (!text) remove('notes', id)
    else if (n && n.text !== text) update('notes', id, { text })
  })

  render()
  return subscribe(() => { if (!el.contains(document.activeElement) || !document.activeElement.closest('.note-text')) render() })
}
