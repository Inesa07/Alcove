// Getting to know Alcove step by step, instead of one long tour.
// A new person gets a very short tour, a small "first steps" list in the room,
// and then one little tip each time they come back to the room, in a set order.
// Only people who joined after this was made get it (they have state.guide).

import { getState, setField } from './store.js'
import { esc, toast } from './ui.js'

const track = (name, props) => window.dispatchEvent(new CustomEvent('planner:track', { detail: { name, props } }))
const today = () => new Date().toISOString().slice(0, 10)

// the first things to try, ticked off by themselves when you do them
export const FIRST_STEPS = [
  { id: 'diary', text: 'Write a line in your diary', done: (s) => s.diaryDays.length > 0, go: '#diary' },
  { id: 'mood', text: 'Tell how you feel today', done: (s) => Object.keys(s.moods || {}).length > 0, show: '#mood-pick' },
  { id: 'book', text: 'Put a book on your shelf', done: (s) => s.books.length > 0, go: '#books' },
  { id: 'decorate', text: 'Change something in your room', done: (s) => !!s.guide?.decorated, click: '[data-decorate]' },
]

// little tips, one per visit to the room, at most three a day
const TIPS = [
  { id: 'jar', at: '#room [data-jar]', text: 'Every mood you pick drops a marble into this jar. Tap it to see your month.', ready: (s) => Object.keys(s.moods || {}).length > 0 },
  { id: 'plant', at: '#room [data-habits]', text: 'Your plant grows with your habits: water, sleep, a walk… Tap it to start one.' },
  { id: 'pet', at: '#room [data-pet]', text: 'Tap your pet to say hi. It grows up with you, from a tiny kitten or puppy.' },
  { id: 'notes', at: '#room a[href="#notes"]', text: 'Your board: quick notes on coloured paper. Friends can pin notes here too.' },
  { id: 'calendar', at: '#room a[href="#calendar"]', text: 'Plans for the day, week or month. Add a time and you get a reminder.' },
  { id: 'player', at: '#room [data-player]', text: 'Paste a song or playlist link here, and your own music plays while you write.' },
  { id: 'amb', at: '[data-amb]', text: 'Real weather outside your window, and quiet sounds: rain, a fireplace, the sea.' },
  { id: 'focus', at: '[data-focus]', text: 'Need to concentrate? Sit down at your desk with a timer, warm tea and your pet sleeping next to you.' },
  { id: 'rooms', at: '[data-gallery]', text: 'Want a different room? Move to a cabin, an observatory, a seaside studio or a pastel room.' },
  { id: 'friends', at: '#nav a[href="#friends"]', text: 'Visit a friend’s room, and leave notes, postcards and little gifts. They never see your diary.' },
  { id: 'year', at: '#nav a[href="#year"]', text: 'A small story of your year: days you wrote, books, moods and plans.' },
]

export function startGuide() {
  setField({ guide: { since: Date.now(), tips: [], day: '', shownToday: 0 } })
}
const guide = () => getState().guide
const save = (patch) => setField({ guide: { ...guide(), ...patch } })

export function guideDecorated() { if (guide() && !guide().decorated) save({ decorated: true }) }

// notice the first thing done, for the numbers: how long it takes a new person to start
function measure(s) {
  const g = s.guide
  if (!g) return
  const done = FIRST_STEPS.filter((x) => x.done(s)).map((x) => x.id)
  if (!g.first && done.length) {
    save({ first: done[0] })
    track('first_action', { item: done[0], seconds: Math.round((Date.now() - g.since) / 1000) })
  }
  if (!g.allDone && done.length === FIRST_STEPS.length) {
    save({ allDone: Date.now() })
    track('first_steps_done', { minutes: Math.round((Date.now() - g.since) / 60000) })
    // a small present in the room
    setField({ gifts: [...(getState().gifts || []), { id: 'gwelcome', kind: 'present', from: 'Alcove', text: 'You found your way around. This room is yours ✦', at: Date.now() }].slice(-3) })
    setTimeout(() => toast('All your first steps are done! There is a present in your room ✦'), 400)
  }
}

// the "first steps" card in the room
export function guideCard(stage) {
  const s = getState(), g = s.guide
  stage.querySelector('.guide')?.remove()
  if (!g || g.hidden) return
  measure(s)
  if (getState().guide.allDone && Date.now() - getState().guide.allDone > 3000) return
  const done = FIRST_STEPS.filter((x) => x.done(s)).length
  const card = document.createElement('div')
  card.className = 'guide' + (g.folded ? ' folded' : '')
  card.innerHTML = `
    <button class="guide-head" data-guide-fold aria-expanded="${!g.folded}"><b>First steps</b><span class="guide-count">${done} of ${FIRST_STEPS.length}</span>
      <span class="guide-bar" aria-hidden="true"><i style="width:${(done / FIRST_STEPS.length) * 100}%"></i></span></button>
    <ul>${FIRST_STEPS.map((x) => { const ok = x.done(s); return `<li class="${ok ? 'ok' : ''}"><button data-guide-step="${x.id}" ${ok ? 'disabled' : ''}><span class="tick" aria-hidden="true">${ok ? '✓' : ''}</span>${esc(x.text)}</button></li>` }).join('')}</ul>
    <button class="guide-hide" data-guide-hide>Hide this list</button>`
  stage.appendChild(card)
}

export function guideClick(t) {
  if (t.closest('[data-guide-fold]')) { save({ folded: !guide().folded }); return true }
  if (t.closest('[data-guide-hide]')) { save({ hidden: true }); track('first_steps_hidden'); toast('You can find every part of Alcove in the tour, in your account'); return true }
  const st = t.closest('[data-guide-step]')
  if (!st) return false
  const x = FIRST_STEPS.find((y) => y.id === st.dataset.guideStep)
  if (x.go) location.hash = x.go
  if (x.click) document.querySelector(x.click)?.click()
  if (x.show) pulse(document.querySelector(x.show))
  return true
}

function pulse(el) {
  if (!el) return
  el.classList.remove('guide-pulse'); void el.offsetWidth; el.classList.add('guide-pulse')
  setTimeout(() => el.classList.remove('guide-pulse'), 2400)
}

// one tip, pointing at the thing it talks about
let shownThisVisit = false
export function guideTip() {
  const g = guide()
  if (!g || shownThisVisit || document.querySelector('.tour, .onboard, dialog[open], .tip, .focus')) return
  const d = today()
  const count = g.day === d ? g.shownToday : 0
  if (count >= 3) return
  const s = getState()
  const tip = TIPS.find((x) => !g.tips.includes(x.id) && (!x.ready || x.ready(s)) && visible(document.querySelector(x.at)))
  if (!tip) return
  shownThisVisit = true
  save({ tips: [...g.tips, tip.id], day: d, shownToday: count + 1 })
  track('tip_seen', { id: tip.id })
  const el = document.querySelector(tip.at)
  const box = document.createElement('div')
  box.className = 'tip'
  box.setAttribute('role', 'status')
  box.innerHTML = `<p>${esc(tip.text)}</p><button class="primary small" data-tip-ok>Got it</button>`
  document.body.appendChild(box)
  const place = () => {
    const r = el.getBoundingClientRect()
    if (!r.width) return close()
    const w = box.offsetWidth, h = box.offsetHeight
    const below = r.bottom + h + 16 < innerHeight
    const left = Math.min(innerWidth - w - 12, Math.max(12, r.left + r.width / 2 - w / 2))
    box.style.left = left + 'px'
    box.style.top = (below ? r.bottom + 12 : r.top - h - 12) + 'px'
    box.classList.toggle('above', !below)
    box.style.setProperty('--ax', Math.min(w - 20, Math.max(20, r.left + r.width / 2 - left)) + 'px')
  }
  const ring = document.createElement('div')
  ring.className = 'tip-ring'
  document.body.appendChild(ring)
  const ringAt = () => { const r = el.getBoundingClientRect(); Object.assign(ring.style, { left: r.left - 6 + 'px', top: r.top - 6 + 'px', width: r.width + 12 + 'px', height: r.height + 12 + 'px' }) }
  function close() { box.classList.add('bye'); ring.remove(); removeEventListener('resize', both); removeEventListener('hashchange', close); setTimeout(() => box.remove(), 250) }
  const both = () => { place(); ringAt() }
  box.addEventListener('click', (e) => { if (e.target.closest('[data-tip-ok]')) close() })
  el.addEventListener('click', close, { once: true })
  addEventListener('resize', both)
  addEventListener('hashchange', close)
  requestAnimationFrame(() => { both(); box.classList.add('on') })
}
export function newVisit() { shownThisVisit = false }

function visible(el) {
  if (!el) return false
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 && r.top > 0 && r.bottom < innerHeight
}
