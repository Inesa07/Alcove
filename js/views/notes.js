// Notes: anything you want to remember, on coloured paper notes.

import { getState, subscribe, add, update, remove, restore, setField, NOTE_COLORS } from '../store.js'
import { WALLS, wallId, wallTop, spell, drawString } from '../walls.js'
import { $, esc, toast } from '../ui.js'

// kinds of paper a note can be
const KINDS = [['sticky', 'Sticky note'], ['polaroid', 'Polaroid'], ['card', 'Index card'], ['torn', 'Torn paper']]
// the same note always gets the same tilt, pin and tape, so the board does not jump around
const hash = (id) => [...String(id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

export function mount(el) {
  let query = ''
  let padColor = NOTE_COLORS[0], padKind = 'sticky'
  let justPinned = null
  let wall = wallId(getState().noteWall)
  el.innerHTML = `
    <section class="notes-page">
      <header class="page-head">
        <div><h2>Notes</h2><p id="n-sub"></p></div>
        <div class="head-tools">
        <div class="wall-menu">
          <button type="button" class="ghost-dark small wall-btn" data-wall-open aria-haspopup="true" aria-expanded="false"><i class="wall-sw sw-${wall}" id="n-wall-sw"></i>Board style</button>
          <div class="wall-pop" role="radiogroup" aria-label="Board style" hidden>${WALLS.map(([k, n, hint]) => `<button type="button" role="radio" class="wall-opt" data-wall-pick="${k}" aria-checked="${k === wall}"><i class="wall-sw sw-${k}"></i><span><b>${n}</b><small>${hint}</small></span></button>`).join('')}</div>
        </div>
        <label class="search"><span class="sr-only">Search notes</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input id="n-search" type="search" placeholder="Search your notes">
        </label>
        </div>
      </header>
      <div class="board" data-wall="${wall}">
        <div class="board-top" id="n-top">${wallTop(wall)}</div>
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
    stringLater()
  }
  // the red string has to wait until the notes have found their places
  let raf = 0
  const stringLater = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const w = $('#n-wall', el); if (!w) return; if (wall === 'case') drawString(w); else w.querySelector('.red-string')?.remove() }) }
  const ro = new ResizeObserver(stringLater)
  ro.observe($('#n-wall', el))

  // the style menu opens under its button and closes when you click anywhere else
  function toggleMenu(open) {
    const pop = $('.wall-pop', el), btn = $('[data-wall-open]', el)
    const show = open ?? pop.hidden
    pop.hidden = !show
    btn.setAttribute('aria-expanded', show)
  }
  const outside = (e) => { if (!e.target.closest('.wall-menu') && el.isConnected) toggleMenu(false) }
  document.addEventListener('click', outside)
  const onKey = (e) => { if (e.key === 'Escape') toggleMenu(false) }
  document.addEventListener('keydown', onKey)

  function setWall(w) {
    wall = w
    setField({ noteWall: w })
    $('.board', el).dataset.wall = w
    $('#n-wall-sw', el).className = `wall-sw sw-${w}`
    $('#n-top', el).innerHTML = wallTop(w)
    el.querySelectorAll('[data-wall-pick]').forEach((b) => b.setAttribute('aria-checked', b.dataset.wallPick === w))
    stringLater()
    if (w === 'letters') setTimeout(() => spell(el, 'HELLO'), 400)
  }

  $('#n-form', el).addEventListener('submit', (e) => {
    e.preventDefault()
    const box = $('#n-text', el)
    const text = box.value.trim()
    if (!text) return
    justPinned = add('notes', { text, color: padColor, kind: padKind, createdAt: Date.now() }).id
    box.value = ''
    // on the letters wall, the lights spell the first word of your note
    if (wall === 'letters') spell(el, text.split(/\s+/).find((w) => /[a-z]/i.test(w)) || '')
  })
  $('#n-text', el).addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) $('#n-form', el).requestSubmit()
  })
  $('#n-search', el).addEventListener('input', (e) => { query = e.target.value; render() })

  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-wall-open]')) return toggleMenu()
    const wp = e.target.closest('[data-wall-pick]')
    if (wp) { toggleMenu(false); return setWall(wp.dataset.wallPick) }
    const al = e.target.closest('[data-al]')
    if (al) { al.classList.remove('flash'); void al.offsetWidth; al.classList.add('flash'); setTimeout(() => al.classList.remove('flash'), 900); return }
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
  const off = subscribe(() => { if (!el.contains(document.activeElement) || !document.activeElement.closest('.note-text')) render() })
  return () => { off(); ro.disconnect(); document.removeEventListener('click', outside); document.removeEventListener('keydown', onKey) }
}
