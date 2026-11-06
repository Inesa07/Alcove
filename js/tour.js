// A short guided tour: it points at each part of the app, one at a time, and says what it is for.
// It runs once after you join, and again whenever you ask for it in your account.

import { getState, setField } from './store.js'
import { esc } from './ui.js'

const track = (name, props) => window.dispatchEvent(new CustomEvent('planner:track', { detail: { name, props } }))

const STEPS = [
  { at: '#room', title: 'This is your room', text: 'Your whole planner lives here. Instead of a menu, you tap things in the room. Let’s see what each one does.' },
  { at: '#room a[href="#diary"]', title: 'Bed · Diary', text: 'A real little book. Write, draw with the pen, add stickers and photos. Press Keep on a special page to save it in Memories.' },
  { at: '#room a[href="#books"]', title: 'Bookshelf · Books', text: 'Add the books you read. Track your page, time your reading, rate them and save quotes. They appear on this shelf.' },
  { at: '#room a[href="#notes"]', title: 'Board · Notes', text: 'Quick things to remember, on coloured paper. Friends can leave notes here too.' },
  { at: '#room a[href="#calendar"]', title: 'Desk calendar · Calendar', text: 'Plans by day, week or month. Add a time and you get a reminder.' },
  { at: '#mood-pick', title: 'How do you feel?', text: 'Tap the face that matches your day: from sad (red) to great (green). Your calendar shows the colours of your month.' },
  { at: '#room [data-jar]', title: 'Mood jar', text: 'Every day you pick a mood, a marble of that colour drops into the jar. Tap the jar to see your month.' },
  { at: '#room [data-pet]', title: 'Your pet', text: 'It moves around the room through the day. Tap it to say hi. You can choose a cat or a dog and give it a name in Decorate.' },
  { at: '[data-amb]', title: 'Weather and sounds', text: 'Show the real weather outside your window, and play quiet sounds: rain, a fireplace, birds, the sea.' },
  { at: '[data-gallery]', title: 'Rooms', text: 'Move to a different room: a Nordic cabin, a night observatory, a seaside studio or a pastel room. Each has its own shape and furniture.' },
  { at: '[data-decorate]', title: 'Decorate', text: 'Every piece has 3 styles: the bed, chair, desk, lamp, clock, plant, flowers and wall decorations. Choose a cat or a dog with a name, and even put your own photo in the window.' },
  { at: '#nav a[href="#friends"]', title: 'Friends', text: 'Share your code with a friend. You can visit each other’s rooms, leave notes and little gifts. Friends never see your diary.' },
  { at: '#nav a[href="#year"]', title: 'Your year', text: 'A small story of your year: days you wrote, books, moods and plans.' },
  { at: '#me-btn, .me-btn', title: 'Your account', text: 'Light or dark look, sign out, and this tour again if you want it. Everything you add is saved and syncs to your other devices.' },
]

let running = false

export function maybeTour() {
  const s = getState()
  if (s.onboarded && !s.toured) setTimeout(startTour, 600)
}

export function startTour() {
  if (running) return
  running = true
  if (!location.hash.startsWith('#room') && location.hash !== '') location.hash = '#room'
  track('tour_started')
  const steps = () => STEPS.filter((s) => visible(document.querySelector(s.at)))
  let list = []
  let i = 0

  const layer = document.createElement('div')
  layer.className = 'tour'
  layer.innerHTML = '<div class="tour-hole"></div><div class="tour-card" role="dialog" aria-live="polite" aria-label="Tour"></div>'
  document.body.appendChild(layer)
  const hole = layer.querySelector('.tour-hole'), card = layer.querySelector('.tour-card')

  function visible(el) {
    if (!el) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }

  function place() {
    const s = list[i]
    const el = s && document.querySelector(s.at)
    if (!el) return
    el.scrollIntoView?.({ block: 'nearest' })
    const r = el.getBoundingClientRect()
    const pad = s.at === '#room' ? -10 : 8
    Object.assign(hole.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px' })
    card.innerHTML = `
      <p class="tour-n">${i + 1} of ${list.length}</p>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.text)}</p>
      <div class="tour-actions">
        <button class="link-btn" data-tour-skip ${i === list.length - 1 ? 'style="visibility:hidden"' : ''}>Skip the tour</button>
        <span class="grow"></span>
        <button class="ghost small" data-tour-back ${i ? '' : 'style="visibility:hidden"'}>Back</button>
        <button class="primary small tour-next" data-tour-next>${i === list.length - 1 ? 'Start!' : 'Next'}</button>
      </div>`
    // the card always stays in the same corner, so Next is always under your finger;
    // only the highlight moves around the screen
    card.querySelector('[data-tour-next]').focus({ preventScroll: true })
  }

  function end(finished) {
    running = false
    setField({ toured: true })
    track(finished ? 'tour_done' : 'tour_skipped', { step: i + 1 })
    layer.classList.add('bye')
    window.removeEventListener('resize', place)
    document.removeEventListener('keydown', key)
    setTimeout(() => layer.remove(), 300)
  }
  function go(d) {
    if (i + d >= list.length) return end(true)
    i = Math.max(0, i + d)
    place()
  }
  const key = (e) => {
    if (e.key === 'Escape') end(false)
    if (e.key === 'ArrowRight') go(1)
    if (e.key === 'ArrowLeft') go(-1)
  }

  layer.addEventListener('click', (e) => {
    if (e.target.closest('[data-tour-next]')) return go(1)
    if (e.target.closest('[data-tour-back]')) return go(-1)
    if (e.target.closest('[data-tour-skip]')) return end(false)
  })
  window.addEventListener('resize', place)
  document.addEventListener('keydown', key)

  // wait until the room is drawn
  let tries = 0
  ;(function wait() {
    if (document.querySelector('#room svg') || tries++ > 30) { list = steps(); place(); layer.classList.add('on') }
    else setTimeout(wait, 100)
  })()
}
