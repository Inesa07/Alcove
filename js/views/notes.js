// Notes: anything you want to remember, on coloured paper notes.

import { getState, subscribe, add, update, remove, restore, NOTE_COLORS } from '../store.js'
import { $, esc, toast } from '../ui.js'

// kinds of paper a note can be
const KINDS = [['sticky', 'Sticky note'], ['polaroid', 'Polaroid'], ['card', 'Index card'], ['torn', 'Torn paper']]
// the same note always gets the same tilt, pin and tape, so the board does not jump around
const hash = (id) => [...String(id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

export function mount(el) {
  let query = ''
  let padColor = NOTE_COLORS[0], padKind = 'sticky'
  let justPinned = null
  el.innerHTML = `
    <section class="notes-page">
      <header class="page-head">
        <div><h2>Notes</h2><p id="n-sub"></p></div>
        <label class="search"><span class="sr-only">Search notes</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input id="n-search" type="search" placeholder="Search your notes">
        </label>
      </header>
      <div class="board">
        <svg class="board-lights" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 8 Q125 52 250 14 T500 14 T750 14 T1000 8" fill="none" stroke="#5b4a3a" stroke-width="1.5"/>
          ${Array.from({ length: 21 }, (_, i) => { const x = i * 50, y = 8 + 22 * Math.abs(Math.sin((i / 20) * Math.PI * 4)) * 0.9 + 6; return `<g class="bulb" style="animation-delay:${(i % 5) * 0.35}s"><circle cx="${x}" cy="${y}" r="9" fill="${['#FFE29A', '#F7A8B8', '#BFE0FF', '#C9F2C7'][i % 4]}" opacity=".35"/><circle cx="${x}" cy="${y}" r="4.5" fill="${['#FFE29A', '#F7A8B8', '#BFE0FF', '#C9F2C7'][i % 4]}"/></g>` }).join('')}
        </svg>
        <form class="note-new" id="n-form">
          <div class="pad" style="--c:${padColor}">
            <label for="n-text" class="sr-only">New note</label>
            <textarea id="n-text" rows="3" placeholder="Write something to remember…"></textarea>
          </div>
          <div class="pad-tools">
            <div class="pad-kinds" role="radiogroup" aria-label="Paper">${KINDS.map(([k, n]) => `<button type="button" role="radio" class="pad-kind" data-kind="${k}" aria-checked="${k === padKind}" title="${n}">${n}</button>`).join('')}</div>
            <div class="pad-colors">${NOTE_COLORS.map((c) => `<button type="button" class="pad-color" data-pad-color="${c}" style="--c:${c}" aria-label="Colour" aria-pressed="${c === padColor}"></button>`).join('')}</div>
            <button class="primary" type="submit">Pin it</button>
          </div>
        </form>
        <div class="note-wall" id="n-wall"></div>
      </div>
    </section>`

  function render() {
    const notes = getState().notes
    $('#n-sub', el).textContent = notes.length ? `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}. They are pinned to the corkboard in your room too.` : 'Write what you want to remember. Nothing gets lost here.'
    const q = query.toLowerCase()
    const shown = q ? notes.filter((n) => n.text.toLowerCase().includes(q)) : notes
    const wall = $('#n-wall', el)
    if (!notes.length) { wall.innerHTML = ''; return }
    if (!shown.length) { wall.innerHTML = `<p class="muted">No notes with “${esc(query)}”.</p>`; return }
    wall.innerHTML = shown.map((n) => {
      const h = hash(n.id)
      const kind = n.from ? 'letter' : n.kind || KINDS[h % KINDS.length][0]
      const hold = n.from ? 'seal' : ['pin', 'tape', 'pin', 'clip'][(h >> 3) % 4]
      const tilt = ((h % 9) - 4) * 0.7
      return `
      <article class="note note-${kind} hold-${hold} ${n.id === justPinned ? 'just-pinned' : ''}" style="--c:${n.color};--tilt:${tilt}deg;--tape:${['#F7CFD9cc', '#CFE4F5cc', '#FBE7A6cc', '#D8EBD9cc'][h % 4]}" data-note="${n.id}">
        <span class="hold" aria-hidden="true"></span>
        ${kind === 'polaroid' ? `<span class="pola-photo" aria-hidden="true" style="--h:${h % 360}"></span>` : ''}
        <div class="note-text" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Note"></div>
        <footer>
          <span>${n.from ? `<b class="note-from">from ${esc(n.from)}</b> · ` : ''}${esc(new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }))}</span>
          <button class="note-color" data-recolor aria-label="Change colour"></button>
          <button class="note-del" data-del aria-label="Delete note">×</button>
        </footer>
      </article>`
    }).join('')
    justPinned = null
    shown.forEach((n) => { el.querySelector(`[data-note="${n.id}"] .note-text`).innerText = n.text })
  }

  $('#n-form', el).addEventListener('submit', (e) => {
    e.preventDefault()
    const box = $('#n-text', el)
    const text = box.value.trim()
    if (!text) return
    justPinned = add('notes', { text, color: padColor, kind: padKind, createdAt: Date.now() }).id
    box.value = ''
  })
  $('#n-text', el).addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) $('#n-form', el).requestSubmit()
  })
  $('#n-search', el).addEventListener('input', (e) => { query = e.target.value; render() })

  el.addEventListener('click', (e) => {
    const kb = e.target.closest('[data-kind]')
    if (kb) { padKind = kb.dataset.kind; el.querySelectorAll('[data-kind]').forEach((b) => b.setAttribute('aria-checked', b === kb)); return }
    const cb = e.target.closest('[data-pad-color]')
    if (cb) { padColor = cb.dataset.padColor; $('.pad', el).style.setProperty('--c', padColor); el.querySelectorAll('[data-pad-color]').forEach((b) => b.setAttribute('aria-pressed', b === cb)); return }
    const card = e.target.closest('[data-note]')
    if (!card) return
    const id = card.dataset.note
    if (e.target.closest('[data-del]')) {
      // the note comes off the board and floats away
      card.classList.add('unpinned')
      setTimeout(() => { const gone = remove('notes', id); gone && toast('Note taken off the board', { label: 'Undo', run: () => restore('notes', gone) }) }, 420)
      return
    }
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
