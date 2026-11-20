// The first visit: one screen with your name and your room. The rest you learn step by step in the room.

import { getState, setName, setRoom, setField, add, pick, COVER_COLORS, todayISO } from './store.js'
import { drawRoom, THEMES, THEME_PRESETS, DEFAULT_ROOM } from './room.js'
import { kitPending, kitLoad } from './kit.js'
import { appendDiaryText } from './views/diary.js'
import { track } from './analytics.js'
import { startTour } from './tour.js'
import { startGuide } from './guide.js'
import { $, esc, toast } from './ui.js'

const look = (id) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(drawRoom({ room: { ...DEFAULT_ROOM, ...THEME_PRESETS[id], theme: id, v: 2 }, tod: 'day', books: 6, notes: 3, leaves: 6 }).svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))

export function maybeOnboard(nameHint = '') {
  const s = getState()
  if (s.onboarded) return
  // people who already use the app do not need the tour
  if (s.books.length || s.notes.length || s.events.length || s.diaryDays.length) { setField({ onboarded: true }); return }
  let step = 1, theme = s.room.theme || 'cabin'
  const box = document.createElement('div')
  box.className = 'onboard'
  document.body.appendChild(box)
  track('onboarding_step', { step: 1 })

  function paint() {
    box.innerHTML = `<div class="ob-card">
      <h1>Welcome to your room</h1>
      <p class="ob-lead">A cozy place for your diary, books, notes and plans.</p>
      <form data-ob="name" class="ob-one">
        <label class="ob-label" for="ob-name">What should we call you?</label>
        <input id="ob-name" autocomplete="given-name" placeholder="Your name" value="${esc(getState().name || nameHint)}" required>
        <p class="ob-label">Choose your room <span>(you can change it any time)</span></p>
        <div class="ob-rooms">${Object.entries(THEMES).map(([id, t]) => `<button type="button" class="ob-room ${theme === id ? 'on' : ''}" data-ob-room="${id}" aria-pressed="${theme === id}"><img src="${look(id)}" alt=""><b>${esc(t.name)}</b></button>`).join('')}</div>
        <div class="ob-row"><span class="grow"></span><button class="primary ob-go">Come in</button></div>
      </form></div>`
    if (kitPending()) kitLoad().then(() => { if (box.isConnected) { const v = $('#ob-name', box)?.value; paint(); if (v != null) $('#ob-name', box).value = v } })
    if (!getState().name && !nameHint) box.querySelector('input')?.focus()
  }

  function done(what) {
    setField({ onboarded: true })
    track('onboarding_done', { theme })
    box.classList.add('bye')
    setTimeout(() => box.remove(), 350)
    toast(`Welcome, ${getState().name || 'friend'}!`)
    startGuide()
    setTimeout(() => startTour('short'), 700)
  }

  box.addEventListener('submit', (e) => {
    e.preventDefault()
    const n = $('#ob-name', box).value.trim()
    if (!n) return $('#ob-name', box).focus()
    setName(n)
    setRoom({ ...THEME_PRESETS[theme], theme, v: 2 })
    done()
  })
  box.addEventListener('click', (e) => {
    const r = e.target.closest('[data-ob-room]')
    if (!r) return
    theme = r.dataset.obRoom
    track('onboarding_room', { theme })
    box.querySelectorAll('[data-ob-room]').forEach((b) => { b.classList.toggle('on', b === r); b.setAttribute('aria-pressed', b === r) })
  })
  paint()
}
