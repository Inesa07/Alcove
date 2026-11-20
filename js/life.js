// Small things that make the room feel lived in:
// your own music on the record player, letters to your future self, "on this day",
// the first snow, a pet that grows up, the room that follows your mood,
// a focus corner at the desk, a vision board and a picture of your room for stories.

import * as db from './db.js'
import { getState, setField, setRoom, todayISO, uid, MOODS } from './store.js'
import { $, esc, toast, addDays, isoToDate, longDate } from './ui.js'
import { drawRoom, petStage, timeOfDay, PET_COLORS } from './room.js'
import { kitPending, kitLoad } from './kit.js'

const fmt = (iso) => isoToDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const track = (name, props) => window.dispatchEvent(new CustomEvent('planner:track', { detail: { name, props } }))

function dialog(cls) {
  const d = document.createElement('dialog')
  d.className = 'sheet-dialog ' + cls
  document.body.appendChild(d)
  d.addEventListener('close', () => d.remove())
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close() })
  return d
}

/* ================= your music on the record player ================= */

// A link from Spotify, YouTube, Apple Music or SoundCloud becomes a small player.
export function toEmbed(link) {
  let u
  try { u = new URL(String(link).trim()) } catch { return null }
  const h = u.hostname.replace(/^www\.|^m\./, '')
  if (h === 'open.spotify.com') {
    const m = u.pathname.match(/(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/)
    return m && { src: `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`, h: 152, from: 'Spotify' }
  }
  if (h === 'youtube.com' || h === 'youtu.be' || h === 'music.youtube.com') {
    const list = u.searchParams.get('list')
    const id = h === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v') || (u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]+)/) || [])[1]
    if (id) return { src: `https://www.youtube.com/embed/${id}${list ? '?list=' + list : ''}`, h: 200, from: 'YouTube' }
    if (list) return { src: `https://www.youtube.com/embed/videoseries?list=${list}`, h: 200, from: 'YouTube' }
    return null
  }
  if (h === 'music.apple.com') return { src: 'https://embed.music.apple.com' + u.pathname + u.search, h: u.pathname.includes('/playlist/') || !u.searchParams.get('i') ? 300 : 175, from: 'Apple Music' }
  if (h === 'soundcloud.com') return { src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.href)}&color=%23e98aa0&visual=false&show_comments=false`, h: 166, from: 'SoundCloud' }
  return null
}

let playerOn = false
let foldWatch = false
export const musicPlaying = () => playerOn
const musicChanged = () => window.dispatchEvent(new CustomEvent('planner:music'))

function miniPlayer() {
  let box = document.getElementById('mini-player')
  if (!box) {
    box = document.createElement('aside')
    box.id = 'mini-player'
    box.className = 'mini-player'
    box.setAttribute('aria-label', 'Your music')
    document.body.appendChild(box)
    box.addEventListener('click', (e) => {
      if (e.target.closest('[data-mp-fold]')) box.classList.toggle('folded')
      if (e.target.closest('[data-mp-stop]')) stopMusic()
      if (e.target.closest('[data-mp-change]')) openMusic()
    })
    // it folds into a small pill when you go on with something else; the music keeps playing
    if (!foldWatch) {
      foldWatch = true
      document.addEventListener('pointerdown', (e) => {
        const b = document.getElementById('mini-player')
        if (b && !b.contains(e.target) && !e.target.closest('dialog, .focus')) b.classList.add('folded')
      })
    }
  }
  return box
}

export function playMusic(link) {
  const em = toEmbed(link)
  if (!em) return false
  const box = miniPlayer()
  box.classList.remove('folded')
  box.innerHTML = `<div class="mp-head"><span class="mp-disc" aria-hidden="true"></span><b>On the record player</b><button class="mp-open" data-mp-fold aria-label="Show the player">♪ Your music</button><span class="grow"></span>
    <button data-mp-change title="Another link" aria-label="Play another link">✎</button>
    <button data-mp-fold title="Fold" aria-label="Fold the player">–</button>
    <button data-mp-stop title="Stop" aria-label="Stop the music">×</button></div>
    <iframe src="${esc(em.src)}" height="${em.h}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="Music from ${em.from}"></iframe>`
  playerOn = true
  musicChanged()
  return true
}

export function stopMusic() {
  document.getElementById('mini-player')?.remove()
  playerOn = false
  musicChanged()
}

export function openMusic() {
  const s = getState()
  const list = s.music?.list || []
  const d = dialog('music-dialog')
  d.innerHTML = `<form class="book-form" method="dialog">
    <h3>Your record player</h3>
    <p class="muted-ink">Paste a link to a song, album or playlist from Spotify, YouTube, Apple Music or SoundCloud. It plays in a small player, so you can keep writing while it plays.</p>
    <input class="field" name="link" type="url" placeholder="https://open.spotify.com/playlist/…" value="${esc(s.music?.url || '')}" required>
    <p class="mp-err" hidden>I cannot play this link. Try a link from Spotify, YouTube, Apple Music or SoundCloud.</p>
    ${list.length > 1 ? `<p class="acc-label">Played before</p><div class="mp-recent">${list.slice(0, 4).map((u) => `<button type="button" class="chip" data-mp-link="${esc(u)}">${esc(toEmbed(u)?.from || 'Link')} · ${esc(u.replace(/^https?:\/\/(www\.)?/, '').slice(0, 28))}…</button>`).join('')}</div>` : ''}
    <div class="bf-actions">${playerOn ? '<button type="button" class="ghost" data-mp-off>Stop the music</button>' : ''}<span class="grow"></span><button type="button" class="ghost" data-close>Close</button><button class="primary">Play</button></div>
  </form>`
  const go = (url) => {
    if (!playMusic(url)) { $('.mp-err', d).hidden = false; return }
    setField({ music: { url, list: [url, ...list.filter((u) => u !== url)].slice(0, 6) } })
    track('music', { from: toEmbed(url).from })
    d.close()
  }
  d.addEventListener('submit', (e) => { e.preventDefault(); go(e.target.link.value.trim()) })
  d.addEventListener('click', (e) => {
    const r = e.target.closest('[data-mp-link]')
    if (r) go(r.dataset.mpLink)
    if (e.target.closest('[data-mp-off]')) { stopMusic(); d.close() }
  })
  d.showModal()
}

/* ================= letters to your future self ================= */

export const letterList = () => getState().letters || []
export function letterState() {
  const today = todayISO()
  const waiting = letterList().filter((l) => !l.opened)
  return { total: waiting.length, ready: waiting.filter((l) => l.openOn <= today).length }
}

export function writeLetter() {
  const today = todayISO()
  const d = dialog('letter-dialog')
  const ins = [['In a month', addDays(today, 30)], ['In half a year', addDays(today, 182)], ['In a year', addDays(today, 365)]]
  d.innerHTML = `<form class="book-form letter-form" method="dialog">
    <h3>A letter to future me</h3>
    <div class="letter-paper"><p class="letter-date">${fmt(today)}</p><textarea name="text" rows="9" placeholder="Dear me, right now I…" required></textarea></div>
    <p class="acc-label">When can I open it?</p>
    <div class="chips">${ins.map(([n, iso], i) => `<label class="chip-radio"><input type="radio" name="on" value="${iso}" ${i === 2 ? 'checked' : ''}><span>${n}</span></label>`).join('')}
      <label class="chip-radio"><input type="radio" name="on" value="date"><span>On a day I choose</span></label>
      <input type="date" name="day" class="field small" min="${addDays(today, 1)}" hidden></div>
    <p class="muted-ink small">The letter stays sealed in an envelope in your room until that day.</p>
    <div class="bf-actions"><span class="grow"></span><button type="button" class="ghost" data-close>Cancel</button><button class="primary">Seal the letter</button></div>
  </form>`
  d.addEventListener('change', () => { $('[name=day]', d).hidden = d.querySelector('[name=on]:checked').value !== 'date' })
  d.addEventListener('submit', (e) => {
    e.preventDefault()
    const f = e.target
    let on = f.querySelector('[name=on]:checked').value
    if (on === 'date') on = f.day.value
    if (!on || on <= today) { f.day.hidden = false; f.day.focus(); return toast('Choose a day in the future') }
    const text = f.text.value.trim()
    if (!text) return
    setField({ letters: [...letterList(), { id: uid(), text, writtenOn: today, openOn: on, opened: false }] })
    track('letter')
    d.close()
    toast(`Sealed. You can open it on ${fmt(on)}`)
  })
  d.showModal()
  $('textarea', d).focus()
}

export function openLetter(id) {
  const l = letterList().find((x) => x.id === id)
  if (!l) return
  if (!l.opened) setField({ letters: letterList().map((x) => (x.id === id ? { ...x, opened: true, openedOn: todayISO() } : x)) })
  const d = dialog('letter-dialog read')
  d.innerHTML = `<div class="book-form">
    <div class="envelope-open" aria-hidden="true"></div>
    <div class="letter-paper"><p class="letter-date">Written on ${fmt(l.writtenOn)}</p><p class="letter-text">${esc(l.text).replace(/\n/g, '<br>')}</p></div>
    <div class="bf-actions"><button class="ghost" data-letter-write>Write back to future me</button><span class="grow"></span><button class="primary" data-close>Close</button></div></div>`
  d.addEventListener('click', (e) => { if (e.target.closest('[data-letter-write]')) { d.close(); writeLetter() } })
  d.showModal()
}

// what happens when you tap the envelopes in the room
export function tapLetters() {
  const today = todayISO()
  const ready = letterList().filter((l) => !l.opened && l.openOn <= today)
  if (ready.length) return openLetter(ready[0].id)
  const d = dialog('letter-dialog')
  const waiting = letterList().filter((l) => !l.opened).sort((a, b) => (a.openOn < b.openOn ? -1 : 1))
  const read = letterList().filter((l) => l.opened)
  d.innerHTML = `<div class="book-form">
    <h3>Letters to future me</h3>
    ${waiting.length ? `<ul class="letter-list">${waiting.map((l) => `<li><span class="env" aria-hidden="true"></span><span>Sealed on ${fmt(l.writtenOn)}<em>Opens on ${fmt(l.openOn)}</em></span></li>`).join('')}</ul>` : '<p class="muted-ink">No letters yet. Write to yourself: what you hope for, what worries you, what you want to remember. One day you will open it.</p>'}
    ${read.length ? `<p class="acc-label">Already opened</p><ul class="letter-list">${read.map((l) => `<li><button data-letter-read="${l.id}"><span class="env open" aria-hidden="true"></span><span>From ${fmt(l.writtenOn)}<em>Read again</em></span></button></li>`).join('')}</ul>` : ''}
    <div class="bf-actions"><span class="grow"></span><button class="ghost" data-close>Close</button><button class="primary" data-letter-write>Write a letter</button></div></div>`
  d.addEventListener('click', (e) => {
    if (e.target.closest('[data-letter-write]')) { d.close(); writeLetter() }
    const r = e.target.closest('[data-letter-read]')
    if (r) { d.close(); openLetter(r.dataset.letterRead) }
  })
  d.showModal()
}

// once a day: a letter is ready to open
export function letterReminder() {
  const s = letterState()
  const k = 'planner.letterToast'
  let last = ''
  try { last = localStorage.getItem(k) } catch {}
  if (!s.ready || last === todayISO()) return
  try { localStorage.setItem(k, todayISO()) } catch {}
  setTimeout(() => toast('A letter from your past self is ready to open', { label: 'Open', run: tapLetters }), 1200)
}

/* ================= on this day ================= */

const AGO = [[-365, 'A year ago'], [-182, 'Half a year ago'], [-30, 'A month ago']]

// The first thing you wrote or added a year, half a year or a month ago (if anything)
export async function onThisDay() {
  const s = getState(), today = todayISO()
  const pages = []
  for (const k of await db.keys('bp:')) {
    const p = await db.get(k)
    if (p?.writtenOn) pages.push({ n: Number(String(k).slice(3)), p })
  }
  for (const [days, label] of AGO) {
    const day = addDays(today, days)
    const pg = pages.find(({ p }) => p.writtenOn === day)
    if (pg) {
      const words = pg.p.items.filter((i) => i.type === 'text' && i.text).map((i) => i.text).join(' ').trim()
      return { label, day, kind: 'page', page: pg.n, text: words ? words.slice(0, 90) + (words.length > 90 ? '…' : '') : 'a page in your diary' }
    }
    const note = s.notes.find((n) => n.createdAt && todayISO(new Date(n.createdAt)) === day)
    if (note) return { label, day, kind: 'note', text: note.text.slice(0, 90) }
    const book = s.books.find((b) => b.finishedOn === day && b.status !== 'reading' && b.status !== 'want')
    if (book) return { label, day, kind: 'book', text: `you finished “${book.title}”` }
    const mood = s.moods?.[day]
    if (mood && s.diaryDays.includes(day)) return { label, day, kind: 'mood', text: `you felt ${MOODS[mood - 1].name.toLowerCase()} and wrote in your diary` }
  }
  return null
}

/* ================= first snow, pet age, mood ================= */

// winters go from November to March; the snowman stays for the winter of your first snow
const winterOf = (iso) => { const y = +iso.slice(0, 4), m = +iso.slice(5, 7); return m >= 11 ? y : m <= 3 ? y - 1 : null }
export function snowNow() {
  const f = getState().firstSnow
  const w = winterOf(todayISO())
  return !!f && w != null && winterOf(f) === w
}
export function noticeSnow(weather) {
  if (weather?.kind !== 'snow' || snowNow()) return
  setField({ firstSnow: todayISO() })
  track('first_snow')
  toast('The first snow! Someone made a little snowman for you ☃')
}

export function petAgeDays() {
  const since = getState().room.petSince
  if (!since) return 60
  return Math.max(0, Math.round((isoToDate(todayISO()) - isoToDate(since)) / 86400000))
}
export function petAgeText(name, dog) {
  const n = petAgeDays()
  const st = petStage(n)
  const kid = dog ? 'puppy' : 'kitten'
  const time = n < 1 ? 'You met today' : n < 14 ? `You have been together for ${n} ${n === 1 ? 'day' : 'days'}` : n < 60 ? `You have been together for ${Math.round(n / 7)} weeks` : n < 365 ? `You have been together for ${Math.round(n / 30)} months` : `You have been together for ${(n / 365).toFixed(n < 730 ? 1 : 0).replace('.0', '')} years`
  return `${time}. ${st === 'baby' ? `${name} is still a tiny ${kid}` : st === 'young' ? `${name} is growing up` : `${name} is all grown up`}`
}

// the average of the last 7 days you told how you feel (or null)
export function moodWeek() {
  const m = getState().moods || {}
  const today = todayISO()
  const v = Array.from({ length: 7 }, (_, i) => m[addDays(today, -i)]).filter(Boolean)
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}

/* ================= focus at the desk ================= */

export function openFocus() {
  const s = getState()
  const r = s.room
  const tod = timeOfDay()
  const night = tod === 'night' || tod === 'evening'
  const pet = r.pet !== 'none'
  const name = r.petName || (r.pet === 'dog' ? 'Your dog' : 'Your cat')
  const pc = PET_COLORS[r.petColor] || PET_COLORS[r.pet === 'dog' ? 'golden' : 'black']
  const fur = pc.base
  const dark = /^#[0-4]/.test(fur)
  const box = document.createElement('div')
  box.className = `focus ${night ? 'night' : 'day'}`
  box.setAttribute('role', 'dialog')
  box.setAttribute('aria-label', 'Focus at your desk')
  box.innerHTML = `
    <svg class="focus-scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? '#1d1f45' : '#9fc7e8'}"/><stop offset="1" stop-color="${night ? '#4a3d6e' : '#f6dcc0'}"/></linearGradient>
        <linearGradient id="fwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? '#3b3350' : '#efe2cf'}"/><stop offset="1" stop-color="${night ? '#2c263d' : '#e3d2bb'}"/></linearGradient>
        <linearGradient id="fdesk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? '#8d6a50' : '#b98c62'}"/><stop offset="1" stop-color="${night ? '#4f3a2c' : '#8c6446'}"/></linearGradient>
        <clipPath id="fwin"><rect x="452" y="92" width="696" height="426" rx="8"/></clipPath>
        <radialGradient id="flamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe2a8" stop-opacity="${night ? 0.55 : 0.25}"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#fwall)"/>
      <g class="f-window"><rect x="430" y="70" width="740" height="470" rx="18" fill="#f7efe3"/><rect x="452" y="92" width="696" height="426" rx="8" fill="url(#fsky)"/>
        ${night ? '<circle cx="1010" cy="190" r="34" fill="#fff6d8"/><circle cx="996" cy="182" r="34" fill="url(#fsky)" opacity=".0"/>' + Array.from({ length: 22 }, (_, i) => `<circle class="f-star" style="animation-delay:${(i % 7) * 0.5}s" cx="${470 + ((i * 97) % 660)}" cy="${110 + ((i * 53) % 220)}" r="${1.5 + (i % 3)}" fill="#fff"/>`).join('') : '<circle cx="1010" cy="190" r="44" fill="#fff3c9"/><g class="f-cloud"><ellipse cx="640" cy="200" rx="80" ry="26" fill="#fff" opacity=".9"/><ellipse cx="690" cy="185" rx="50" ry="26" fill="#fff" opacity=".9"/></g>'}
        <path d="M452 400 Q620 330 800 390 T1148 370 V518 H452z" fill="${night ? '#2a2950' : '#a9c9a2'}" opacity=".9"/>
        <rect x="796" y="92" width="10" height="426" fill="#f7efe3"/><rect x="452" y="300" width="696" height="10" fill="#f7efe3"/>
        ${s.firstSnow && snowNow() ? `<g clip-path="url(#fwin)">${Array.from({ length: 40 }, (_, i) => `<circle class="f-snow" style="animation-delay:-${((i * 1.37) % 7).toFixed(2)}s;animation-duration:${6 + (i % 4)}s" cx="${465 + ((i * 71) % 670)}" cy="80" r="${2 + (i % 3)}" fill="#fff" opacity=".9"/>`).join('')}</g>` : ''}
      </g>
      <rect x="400" y="540" width="800" height="22" rx="6" fill="#f2e8da"/>
      <ellipse cx="1290" cy="420" rx="420" ry="360" fill="url(#flamp)"/>
      <rect x="0" y="690" width="1600" height="310" fill="url(#fdesk)"/><rect x="0" y="690" width="1600" height="16" fill="${night ? '#a8835f' : '#cfa47a'}"/>
      <g class="f-lamp"><ellipse cx="1330" cy="694" rx="74" ry="15" fill="#3d3a46"/><path d="M1330 690 L1300 520 L1215 452" stroke="#3d3a46" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="1300" cy="520" r="11" fill="#3d3a46"/><path d="M1150 470 a78 62 -28 0 1 118 -64 l14 26 a90 40 -28 0 1 -120 60z" fill="#e98aa0"/><ellipse cx="1214" cy="468" rx="62" ry="16" transform="rotate(-28 1214 468)" fill="#ffe9b8"/></g>
      <g class="f-book"><path d="M330 900 L620 860 L820 900 L540 960 Z" fill="#fffaf0"/><path d="M330 900 L540 960 L540 972 L330 912z" fill="#e6dccb"/><path d="M540 960 L820 900 L820 912 L540 972z" fill="#efe5d4"/><path d="M380 900 l200 -26 M390 912 l190 -24 M600 890 l150 26 M590 903 l150 26" stroke="#cbbfe0" stroke-width="3"/></g>
      <g class="f-pen"><rect x="860" y="905" width="200" height="12" rx="6" fill="#8e74c4" transform="rotate(-12 860 905)"/></g>
      <g class="f-cup"><path d="M1040 770 h120 v90 a40 40 0 0 1 -40 40 h-40 a40 40 0 0 1 -40 -40z" fill="#f4b7c8"/><path d="M1160 790 a28 28 0 0 1 0 56" stroke="#f4b7c8" stroke-width="12" fill="none"/><ellipse cx="1100" cy="772" rx="60" ry="12" fill="#a0603c"/>
        <path class="f-steam" d="M1080 750 q-14 -30 0 -60 t0 -60" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/><path class="f-steam two" d="M1118 750 q-14 -30 0 -60 t0 -60" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".5"/></g>
      <g class="f-plant">${[[-70, -150, -30], [-30, -200, -12], [15, -215, 6], [55, -175, 22], [85, -120, 38], [-95, -95, -48]].map(([x, y, r]) => `<path d="M225 600 Q${225 + x * 0.3} ${600 + y * 0.6} ${225 + x} ${600 + y}" stroke="#4f7f68" stroke-width="5" fill="none"/><ellipse cx="${225 + x}" cy="${600 + y + 30}" rx="22" ry="52" transform="rotate(${r} ${225 + x} ${600 + y + 30})" fill="${r % 2 ? '#6fa287' : '#5e937a'}"/>`).join('')}<path d="M160 600 h130 l-16 92 h-98z" fill="#d98f6f"/><rect x="152" y="590" width="146" height="20" rx="6" fill="#e9a585"/></g>
      ${pet ? `<g class="f-pet"><ellipse cx="1420" cy="850" rx="130" ry="56" fill="${fur}"/><circle cx="1320" cy="830" r="48" fill="${fur}"/>${r.pet === 'dog' ? '<ellipse cx="1290" cy="810" rx="18" ry="34" fill="#8a5f3a" transform="rotate(25 1290 810)"/><ellipse cx="1352" cy="806" rx="16" ry="30" fill="#8a5f3a" transform="rotate(-20 1352 806)"/>' : `<path d="M1286 806 l6 -46 l30 30z M1336 790 l24 -36 l8 44z" fill="${fur}"/><path d="M1515 860 q60 10 40 -50" stroke="${fur}" stroke-width="22" fill="none" stroke-linecap="round"/>`}<path d="M1300 834 q8 6 16 0 M1330 834 q8 6 16 0" stroke="${dark ? '#f3efe8' : '#3a2a22'}" stroke-width="4" fill="none" stroke-linecap="round"/><text class="f-zzz" x="1370" y="770" font-size="38" fill="#fff">z</text><text class="f-zzz two" x="1400" y="730" font-size="28" fill="#fff">z</text></g>` : ''}
    </svg>
    <div class="focus-panel">
      <p class="focus-kicker">At your desk${pet ? ` · ${esc(name)} is sleeping next to you` : ''}</p>
      <div class="focus-time" aria-live="polite">25:00</div>
      <input class="focus-task" maxlength="60" placeholder="What are you working on?">
      <div class="focus-len" role="radiogroup" aria-label="How long"><button role="radio" aria-checked="true" data-len="25">25 min</button><button role="radio" aria-checked="false" data-len="50">50 min</button><button role="radio" aria-checked="false" data-len="5">5 min break</button></div>
      <div class="focus-btns"><button class="primary" data-focus-go>Start</button><button class="ghost-dark" data-focus-music>♪ Music</button><button class="ghost-dark" data-focus-end>Leave the desk</button></div>
      <p class="focus-count">${s.focus?.sessions ? `You have focused here ${s.focus.sessions} ${s.focus.sessions === 1 ? 'time' : 'times'} · ${Math.round(s.focus.minutes / 60 * 10) / 10} hours` : 'Sit down, choose a time and start. Your room waits quietly around you.'}</p>
    </div>`
  document.body.appendChild(box)
  document.body.classList.add('focusing')
  requestAnimationFrame(() => box.classList.add('in'))

  let len = 25, left = len * 60, timer = null, end = 0
  const timeEl = $('.focus-time', box), goBtn = $('[data-focus-go]', box)
  const show = () => { timeEl.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`; document.title = timer ? `${timeEl.textContent} · Focus` : 'Alcove' }
  const pause = () => { clearInterval(timer); timer = null; goBtn.textContent = 'Go on'; box.classList.remove('running'); show() }
  const done = () => {
    pause()
    goBtn.textContent = 'Start again'
    left = len * 60
    show()
    if (len >= 25) {
      const f = getState().focus || { sessions: 0, minutes: 0 }
      setField({ focus: { sessions: f.sessions + 1, minutes: f.minutes + len } })
      $('.focus-count', box).textContent = `Well done! That was focus number ${f.sessions + 1}. Time for a short break`
      track('focus', { len })
    } else $('.focus-count', box).textContent = 'Break is over. Ready for the next one?'
    chime()
  }
  const tick = () => { left = Math.max(0, Math.round((end - Date.now()) / 1000)); show(); if (!left) done() }
  goBtn.addEventListener('click', () => {
    if (timer) return pause()
    end = Date.now() + left * 1000
    timer = setInterval(tick, 500)
    goBtn.textContent = 'Pause'
    box.classList.add('running')
    show()
  })
  box.addEventListener('click', (e) => {
    const l = e.target.closest('[data-len]')
    if (l && !timer) {
      len = Number(l.dataset.len); left = len * 60
      box.querySelectorAll('[data-len]').forEach((b) => b.setAttribute('aria-checked', b === l))
      show()
    }
    if (e.target.closest('[data-focus-music]')) openMusic()
    if (e.target.closest('[data-focus-end]')) close()
  })
  const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) close() }
  document.addEventListener('keydown', onKey)
  function close() {
    clearInterval(timer)
    document.title = 'Alcove · your cozy corner for days, books and thoughts'
    document.removeEventListener('keydown', onKey)
    box.classList.remove('in')
    document.body.classList.remove('focusing')
    setTimeout(() => box.remove(), 450)
  }
  track('focus_open')
}

// a soft bell when the time is up
function chime() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)()
    ;[523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain()
      o.type = 'sine'; o.frequency.value = f
      g.gain.setValueAtTime(0, ac.currentTime + i * 0.18)
      g.gain.linearRampToValueAtTime(0.18, ac.currentTime + i * 0.18 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.18 + 1.6)
      o.connect(g).connect(ac.destination)
      o.start(ac.currentTime + i * 0.18); o.stop(ac.currentTime + i * 0.18 + 1.7)
    })
  } catch { /* no sound here */ }
}

/* ================= the vision board ================= */

const VKEY = 'vision'
export async function openVision() {
  let items = (await db.get(VKEY)) || []
  const d = dialog('vision-dialog')
  const save = () => db.set(VKEY, items)
  const card = (it) => it.type === 'photo'
    ? `<figure class="vb-item vb-photo ${it.done ? 'done' : ''}" style="--r:${it.rot}deg"><img src="${it.src}" alt="">${it.text ? `<figcaption>${esc(it.text)}</figcaption>` : ''}<span class="vb-pin" aria-hidden="true"></span>${tools(it)}</figure>`
    : `<div class="vb-item vb-goal ${it.done ? 'done' : ''}" style="--r:${it.rot}deg;--c:${it.color}"><p>${esc(it.text)}</p><span class="vb-pin" aria-hidden="true"></span>${tools(it)}</div>`
  const tools = (it) => `<span class="vb-tools"><button data-vb-done="${it.id}" aria-pressed="${!!it.done}" title="${it.done ? 'Not yet' : 'It came true!'}">${it.done ? '✓ Came true' : '✓'}</button><button data-vb-del="${it.id}" aria-label="Remove">×</button></span>${it.done ? '<span class="vb-stamp" aria-hidden="true">Came true</span>' : ''}`
  const COLORS = ['#FBE7A6', '#F7CFD9', '#CFE4F5', '#D8EBD9', '#E6DCF5']
  const draw = () => {
    const done = items.filter((i) => i.done).length
    d.innerHTML = `<div class="vb-wrap">
      <header class="vb-head"><div><h3>My vision board</h3><p>${items.length ? `${items.length} dreams · ${done} came true` : 'Pin pictures of places, things and the life you want, and goals you dream about. When one comes true, mark it.'}</p></div><button class="icon-btn" data-close aria-label="Close">×</button></header>
      <div class="vb-board">${items.map(card).join('') || '<p class="vb-empty">Your board is empty. Add a first picture or a goal ✦</p>'}</div>
      <form class="vb-add"><input class="field" name="goal" maxlength="80" placeholder="A goal or a dream: “See the northern lights”"><button class="primary small">Pin it</button>
        <label class="ghost small vb-photo-btn">Add a picture<input type="file" accept="image/*" class="sr-only" data-vb-photo></label></form>
    </div>`
  }
  const tilt = () => Math.round((Math.random() * 6 - 3) * 10) / 10
  d.addEventListener('submit', (e) => {
    e.preventDefault()
    const t = e.target.goal.value.trim()
    if (!t) return
    items = [...items, { id: uid(), type: 'goal', text: t, color: COLORS[items.length % COLORS.length], rot: tilt(), at: Date.now() }]
    save(); draw(); $('[name=goal]', d)?.focus()
  })
  d.addEventListener('change', async (e) => {
    if (!e.target.matches('[data-vb-photo]')) return
    const f = e.target.files[0]
    if (!f) return
    try {
      const { src } = await db.shrinkImage(f, 700)
      items = [...items, { id: uid(), type: 'photo', src, text: '', rot: tilt(), at: Date.now() }]
      save(); draw()
    } catch (err) { toast(err.message) }
  })
  d.addEventListener('click', (e) => {
    const dn = e.target.closest('[data-vb-done]')
    if (dn) {
      items = items.map((i) => (i.id === dn.dataset.vbDone ? { ...i, done: !i.done, doneOn: i.done ? null : todayISO() } : i))
      save(); draw()
      if (items.find((i) => i.id === dn.dataset.vbDone).done) { toast('It came true! ✦'); track('vision_done') }
    }
    const del = e.target.closest('[data-vb-del]')
    if (del) { items = items.filter((i) => i.id !== del.dataset.vbDel); save(); draw() }
  })
  draw()
  d.showModal()
}

/* ================= a picture for stories ================= */

const loadImg = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src })

async function shareOrSave(canvas, name) {
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'))
  const file = new File([blob], name, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ files: [file] }); return } catch { /* closed: save instead */ }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 1000)
  toast('The picture is saved. Share it in your stories ✦')
}

function storyFrame(ctx, W, H, dark, title, sub) {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  if (dark) { g.addColorStop(0, '#2b2547'); g.addColorStop(1, '#151226') } else { g.addColorStop(0, '#fbeee3'); g.addColorStop(1, '#efe0f2') }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = dark ? 'rgba(255,255,255,.55)' : 'rgba(80,60,110,.18)'
  for (let i = 0; i < 70; i++) { ctx.beginPath(); ctx.arc((i * 377) % W, (i * 613) % H, (i % 3) + 1, 0, 7); ctx.fill() }
  ctx.textAlign = 'center'
  ctx.fillStyle = dark ? '#fff' : '#2a2638'
  ctx.font = 'italic 300 76px Fraunces, Georgia, serif'
  ctx.fillText(title, W / 2, 230)
  ctx.font = '500 36px Figtree, system-ui, sans-serif'
  ctx.fillStyle = dark ? '#c9c2ec' : '#7a6f94'
  ctx.fillText(sub, W / 2, 300)
  ctx.font = 'italic 44px Fraunces, Georgia, serif'
  ctx.fillStyle = dark ? '#e9c46a' : '#8e74c4'
  ctx.fillText('Alcove', W / 2, H - 120)
}

export async function roomStory(roomOpts) {
  try {
    const W = 1080, H = 1920
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const ctx = c.getContext('2d')
    const dark = document.documentElement.dataset.theme !== 'light'
    const s = getState()
    storyFrame(ctx, W, H, dark, s.name ? `${s.name}’s room` : 'My cozy room', longDate(todayISO()))
    drawRoom(roomOpts)
    if (kitPending()) await kitLoad()
    const svg = drawRoom(roomOpts).svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ')
    const img = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))
    const w = 1000, h = (img.height / img.width) * w || 1000
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2 + 40, w, h)
    await shareOrSave(c, 'alcove-room.png')
    track('story', { kind: 'room' })
  } catch (e) { toast('Could not make the picture here') }
}

// copies the look of every element into its style, so a copy of the page can be drawn as a picture
function inlineStyles(src, dst) {
  const cs = getComputedStyle(src)
  let txt = ''
  for (const p of cs) txt += `${p}:${cs.getPropertyValue(p)};`
  dst.setAttribute('style', txt)
  if (src.tagName === 'CANVAS') {
    const im = document.createElement('img')
    im.src = src.toDataURL()
    im.setAttribute('style', txt)
    dst.replaceWith(im)
    return
  }
  const a = src.children, b = dst.children
  for (let i = 0; i < a.length; i++) if (b[i]) inlineStyles(a[i], b[i])
}

export async function pageStory(pageEls, label) {
  try {
    const W = 1080, H = 1920
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const ctx = c.getContext('2d')
    const dark = document.documentElement.dataset.theme !== 'light'
    storyFrame(ctx, W, H, dark, 'From my diary', label)
    const els = pageEls.filter(Boolean)
    const gap = 24
    const r0 = els[0].getBoundingClientRect()
    const pw = r0.width, ph = r0.height
    const totalW = els.length * pw + (els.length - 1) * gap
    const scale = Math.min(980 / totalW, 1300 / ph)
    let x = (W - totalW * scale) / 2
    for (const el of els) {
      const copy = el.cloneNode(true)
      inlineStyles(el, copy)
      copy.querySelectorAll('.item-del,.item-size,.item-rot,.grip,.today-q,.page-turn').forEach((n) => n.remove())
      copy.style.transform = 'none'
      copy.style.margin = '0'
      const html = new XMLSerializer().serializeToString(copy)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`
      const img = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))
      const y = (H - ph * scale) / 2 + 40
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18
      ctx.fillStyle = '#fffcf4'
      ctx.fillRect(x, y, pw * scale, ph * scale)
      ctx.restore()
      ctx.drawImage(img, x, y, pw * scale, ph * scale)
      x += (pw + gap) * scale
    }
    await shareOrSave(c, 'alcove-diary.png')
    track('story', { kind: 'page' })
  } catch (e) { console.warn(e); toast('Could not make the picture here') }
}

/* ================= postcards to friends ================= */

export const POSTCARDS = { sea: 'Greetings from the sea', mountains: 'Mountain air', city: 'City lights', flowers: 'A field of flowers', stars: 'Under the stars', autumn: 'Cozy autumn' }

// a little picture for the front of each postcard (200 × 110)
export function postcardArt(kind) {
  const A = {
    sea: `<rect width="200" height="110" fill="#BFE0F2"/><circle cx="150" cy="34" r="16" fill="#FFE39A"/><path d="M0 62h200v48H0z" fill="#5C9CC8"/><path d="M0 66q12-5 25 0t25 0 25 0 25 0 25 0 25 0 25 0 25 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/><path d="M0 88h200v22H0z" fill="#F2DDB0"/><path d="M60 62l14-26v26z" fill="#fff"/><path d="M58 62h22l-4 6H62z" fill="#C9665A"/>`,
    mountains: `<rect width="200" height="110" fill="#DDE9F3"/><path d="M0 92L50 34l30 30 34-44 46 52 40-20v58H0z" fill="#8FA6C4"/><path d="M114 20l-12 16 8-2 6 6 6-8 10 4z M50 34l-9 11 6-1 4 4 5-6z" fill="#fff"/><path d="M0 98q50-14 100 0t100-4v16H0z" fill="#7FB08F"/><circle cx="160" cy="28" r="10" fill="#FFE7A8"/>`,
    city: `<rect width="200" height="110" fill="#2C2A55"/><circle cx="160" cy="24" r="10" fill="#FFF3C9"/>${[[10, 50, 26], [40, 30, 22], [66, 58, 30], [100, 22, 24], [128, 44, 28], [160, 60, 34]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${110 - y}" fill="#433F78"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${x + 4 + (i % 2) * 10}" y="${y + 6 + Math.floor(i / 2) * 12}" width="5" height="6" fill="${i % 3 ? '#F6D27A' : '#6E68A8'}"/>`).join('')}`).join('')}`,
    flowers: `<rect width="200" height="110" fill="#FCE6EC"/><path d="M0 70q50-14 100 0t100 0v40H0z" fill="#A9D3A0"/>${Array.from({ length: 16 }, (_, i) => { const x = 8 + i * 12.5, y = 76 + (i % 3) * 9, c = ['#E98AA0', '#F6CF5E', '#B9A9E0', '#fff'][i % 4]; return `<path d="M${x} ${y + 14}v-12" stroke="#5E937A" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="4.5" fill="${c}"/><circle cx="${x}" cy="${y}" r="1.6" fill="#F2B544"/>` }).join('')}<circle cx="40" cy="28" r="12" fill="#FFF3C9"/>`,
    stars: `<rect width="200" height="110" fill="#1D1F45"/>${Array.from({ length: 34 }, (_, i) => `<circle cx="${(i * 59) % 200}" cy="${(i * 37) % 80}" r="${(i % 3) * 0.5 + 0.6}" fill="#fff"/>`).join('')}<path d="M150 18a14 14 0 1 0 12 22a11 11 0 0 1-12-22z" fill="#FFF3C9"/><path d="M0 96q40-20 80-6t70-6 50 8v18H0z" fill="#2E2C5E"/><path d="M98 92l6-10 6 10z" fill="#F6D27A"/>`,
    autumn: `<rect width="200" height="110" fill="#F7E3C8"/><path d="M0 84q50-10 100 0t100 0v26H0z" fill="#D9A066"/>${[[40, 50, '#D9734E'], [70, 40, '#E9A23B'], [150, 46, '#C8553D']].map(([x, y, c]) => `<rect x="${x - 2}" y="${y + 10}" width="4" height="${84 - y - 10}" fill="#7A5236"/><circle cx="${x}" cy="${y}" r="17" fill="${c}"/><circle cx="${x + 9}" cy="${y + 6}" r="11" fill="${c}"/>`).join('')}<ellipse cx="110" cy="88" rx="12" ry="9" fill="#E98A3B"/><path d="M110 79v-4" stroke="#5E7A3A" stroke-width="2"/>`,
  }
  return `<svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${A[kind] || A.sea}</svg>`
}
