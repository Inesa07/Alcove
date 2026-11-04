// The first visit: three short steps — your name, your room, and one first thing.

import { getState, setName, setRoom, setField, add, pick, COVER_COLORS, todayISO } from './store.js'
import { drawRoom, THEMES, THEME_PRESETS, DEFAULT_ROOM } from './room.js'
import { appendDiaryText } from './views/diary.js'
import { track } from './analytics.js'
import { $, esc, toast } from './ui.js'

const look = (id) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(drawRoom({ room: { ...DEFAULT_ROOM, ...THEME_PRESETS[id], theme: id }, tod: 'day', books: 6, notes: 3, leaves: 6 }).svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))

export function maybeOnboard(nameHint = '') {
  const s = getState()
  if (s.onboarded) return
  // people who already use the app do not need the tour
  if (s.books.length || s.notes.length || s.events.length || s.diaryDays.length) { setField({ onboarded: true }); return }
  let step = 1, theme = s.room.theme || 'cozy'
  const box = document.createElement('div')
  box.className = 'onboard'
  document.body.appendChild(box)
  track('onboarding_step', { step: 1 })

  function paint() {
    const dots = [1, 2, 3].map((i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')
    let body = ''
    if (step === 1) body = `
      <h1>Welcome to your room</h1>
      <p class="ob-lead">A cozy place for your diary, books, notes and plans. First, what should we call you?</p>
      <form data-ob="name"><input id="ob-name" autocomplete="given-name" placeholder="Your name" value="${esc(getState().name || nameHint)}" required><button class="primary ob-go">Next</button></form>`
    if (step === 2) body = `
      <h1>Choose your room</h1>
      <p class="ob-lead">You can change it any time with <b>Rooms</b>, and decorate every piece.</p>
      <div class="ob-rooms">${Object.entries(THEMES).map(([id, t]) => `<button class="ob-room ${theme === id ? 'on' : ''}" data-ob-room="${id}"><img src="${look(id)}" alt=""><b>${esc(t.name)}</b></button>`).join('')}</div>
      <div class="ob-row"><span class="grow"></span><button class="primary ob-go" data-ob-next>Next</button></div>`
    if (step === 3) body = `
      <h1>One first little thing</h1>
      <p class="ob-lead">Pick one. It takes ten seconds, and your room will show it right away.</p>
      <div class="ob-first">
        <form data-ob="diary"><label>Write the first line in your diary<input id="ob-diary" placeholder="Today I feel…"></label><button class="primary small">Write</button></form>
        <form data-ob="book"><label>A book you are reading<input id="ob-book" placeholder="The Little Prince"></label><button class="primary small">Add</button></form>
        <form data-ob="event"><label>Something to remember<input id="ob-event" placeholder="Call mom on Sunday"></label><button class="primary small">Add</button></form>
      </div>
      <div class="ob-row"><button class="link-btn" data-ob-done>Skip for now</button></div>`
    box.innerHTML = `<div class="ob-card"><div class="ob-dots">${dots}</div>${body}</div>`
    box.querySelector('input')?.focus()
  }

  function done(what) {
    setField({ onboarded: true })
    track('onboarding_done', { first: what || 'skip', theme })
    box.classList.add('bye')
    setTimeout(() => box.remove(), 350)
    toast(`Welcome, ${getState().name || 'friend'}!`)
  }

  box.addEventListener('submit', async (e) => {
    e.preventDefault()
    const kind = e.target.dataset.ob
    if (kind === 'name') {
      const n = $('#ob-name', box).value.trim()
      if (!n) return
      setName(n); step = 2; track('onboarding_step', { step: 2 }); return paint()
    }
    const v = e.target.querySelector('input').value.trim()
    if (!v) return
    if (kind === 'diary') await appendDiaryText(todayISO(), v)
    if (kind === 'book') add('books', { title: v, author: '', status: 'reading', color: pick(COVER_COLORS), hasCover: false, createdAt: Date.now(), startedOn: todayISO(), quotes: [], minutes: 0, page: 0 })
    if (kind === 'event') add('events', { title: v, date: todayISO(), time: '', remind: false, notified: false })
    done(kind)
  })
  box.addEventListener('click', (e) => {
    const r = e.target.closest('[data-ob-room]')
    if (r) { theme = r.dataset.obRoom; setRoom({ ...THEME_PRESETS[theme], theme }); return paint() }
    if (e.target.closest('[data-ob-next]')) { step = 3; track('onboarding_step', { step: 3, theme }); return paint() }
    if (e.target.closest('[data-ob-done]')) done()
  })
  paint()
}
