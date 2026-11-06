// Friends: your friend code, the friends you added, and a visit to a friend's room,
// where you can look at her shelf and leave a note on her board.

import * as sync from '../sync.js'
import * as F from '../friends.js'
import { NOTE_COLORS } from '../store.js'
import { drawRoom, seasonOf, timeOfDay, DEFAULT_ROOM } from '../room.js'
import { $, esc, toast } from '../ui.js'

const petName = (f) => f?.room?.petName || (f?.room?.pet === 'dog' ? 'The dog' : 'The cat')
const thumb = (room) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  drawRoom({ room: { ...DEFAULT_ROOM, ...(room || {}) }, tod: 'day', books: 6, notes: 2, events: 0, leaves: 6 }).svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))

export function mount(el) {
  el.innerHTML = '<section class="friends-page" id="fr"></section>'
  const box = $('#fr', el)
  let friends = null
  let noteColor = NOTE_COLORS[0]

  const visiting = () => location.hash.split('/')[1] || ''

  async function load() {
    if (!sync.signedIn()) {
      // the app is still finding out who you are: wait for it
      show('<p class="muted">Loading…</p>')
      const off = sync.onStatus(() => { if (sync.signedIn()) { off(); load() } })
      return
    }
    if (sync.currentUser()?.offline) return show('<p class="muted">Friends need the internet. Connect and open this page again.</p>')
    try {
      const [me, list] = await Promise.all([F.getMyProfile(), F.listFriends()])
      friends = list
      render(me)
    } catch (e) {
      show(F.notSetUp()
        ? '<div class="fr-card"><h3>Almost ready</h3><p class="muted">Friends need one more step in the database. The owner of the app runs <b>supabase/friends.sql</b> in Supabase → SQL Editor once.</p></div>'
        : `<p class="muted">Could not load your friends: ${esc(e.message || 'no connection')}</p>`)
    }
  }
  const show = (html) => { box.innerHTML = `<header class="page-head"><div><h2>Friends</h2></div></header>${html}` }

  function render(me) {
    if (!box.isConnected) return
    const id = visiting()
    const f = id && friends.find((x) => x.user_id === id)
    if (f) return renderVisit(f)
    box.innerHTML = `
      <header class="page-head"><div><h2>Friends</h2><p>Visit each other’s rooms and leave little notes. Friends never see your diary, notes or calendar.</p></div></header>
      <div class="fr-top">
        <div class="fr-card fr-code">
          <h3>Your friend code</h3>
          <div class="code-row"><b class="code" aria-label="Your code">${esc(me.code)}</b><button class="ghost-dark small" data-copy>Copy</button></div>
          <p class="muted">Send it to a friend. When they add it, you become friends.</p>
        </div>
        <form class="fr-card fr-add" id="fr-add" autocomplete="off">
          <h3>Add a friend</h3>
          <div class="code-row"><input id="fr-code" maxlength="8" placeholder="Friend’s code, like K7MP2Q" aria-label="Friend code" required><button class="primary small" type="submit">Add</button></div>
          <p class="fr-err" id="fr-err" role="alert"></p>
        </form>
      </div>
      ${friends.length ? `<ul class="fr-list">${friends.map((x) => `
        <li><a href="#friends/${x.user_id}" class="fr-friend">
          <span class="fr-img"><img src="${thumb(x.room)}" alt=""></span>
          <span class="fr-text"><b>${esc(x.name || 'Your friend')}</b><span>${(x.books || []).length} books on the shelf</span></span>
          <span class="fr-go">Visit</span>
        </a><button class="fr-card-remove" data-remove="${x.user_id}">Remove friend</button></li>`).join('')}</ul>`
        : '<p class="fr-empty">No friends here yet. Add one with their code, or send them yours.</p>'}`
  }

  function renderVisit(f) {
    const books = f.books || []
    const { svg, spots } = drawRoom({
      room: { ...DEFAULT_ROOM, ...(f.room || {}) },
      tod: timeOfDay(),
      season: f.room?.seasonal === 'off' ? null : seasonOf(),
      bookList: books.map((b, i) => ({ id: 'f' + i, ...b })),
      books: books.length, notes: 0, events: 0, leaves: 6,
    })
    const reading = books.filter((b) => b.status === 'reading')
    const name = esc(f.name || 'Your friend')
    box.innerHTML = `
      <header class="page-head"><div><a class="fr-back" href="#friends">‹ Friends</a><h2>${name}’s room</h2></div></header>
      <div class="fr-visit">
        <div><div class="room fr-room">${svg}${spots.pet ? `<button class="pet-spot" data-fpet style="left:${spots.pet.l}%;top:${spots.pet.t}%;width:${spots.pet.w}%;height:${spots.pet.h}%" aria-label="Play with ${esc(petName(f))}"></button>` : ''}</div>
        ${spots.pet ? `<p class="fr-pet-hint">Tap ${esc(petName(f))} to play</p>` : ''}</div>
        <aside class="fr-side">
          <form class="fr-card fr-note" id="fr-note">
            <h3>Leave a note on ${name}’s board</h3>
            <textarea id="fr-text" rows="4" maxlength="500" placeholder="Hi! I visited your room…" required style="--c:${noteColor}"></textarea>
            <div class="code-row"><div class="fr-colors">${NOTE_COLORS.map((c) => `<button type="button" class="sw ${c === noteColor ? 'on' : ''}" data-color="${c}" style="--sw:${c}" aria-label="Note colour" aria-pressed="${c === noteColor}"></button>`).join('')}</div>
            <button class="primary small" type="submit">Leave note</button></div>
            <p class="muted small-note">Only ${name} will read it.</p>
          </form>
          <div class="fr-card">
            <h3>${name}’s shelf</h3>
            ${books.length ? `<ul class="fr-books">${books.map((b) => `<li><i style="background:${esc(b.color || '#8E7CC3')}"></i><span><b>${esc(b.title)}</b>${b.author ? `<em>${esc(b.author)}</em>` : ''}</span>${b.status === 'reading' ? '<small>reading</small>' : b.rating ? `<small class="stars">${'★'.repeat(b.rating)}</small>` : ''}</li>`).join('')}</ul>` : '<p class="muted">No books yet.</p>'}
            ${reading.length ? `<p class="muted small-note">Reading now: ${reading.map((b) => esc(b.title)).join(', ')}</p>` : ''}
          </div>
          <button class="ghost-dark small fr-remove" data-remove="${f.user_id}">Remove friend</button>
        </aside>
      </div>`
  }

  el.addEventListener('click', async (e) => {
    const t = e.target
    const pt = t.closest('[data-fpet]')
    if (pt) return playWithPet(pt)
    if (t.closest('[data-copy]')) {
      const code = $('.code', el).textContent
      try { await navigator.clipboard.writeText(code); toast('Code copied') } catch { toast('Your code: ' + code) }
      return
    }
    const c = t.closest('[data-color]')
    if (c) {
      noteColor = c.dataset.color
      el.querySelectorAll('[data-color]').forEach((b) => { b.classList.toggle('on', b === c); b.setAttribute('aria-pressed', b === c) })
      $('#fr-text', el).style.setProperty('--c', noteColor)
      return
    }
    const rm = t.closest('[data-remove]')
    if (rm) {
      if (!confirmRemove(rm)) return
      try {
        await F.removeFriend(rm.dataset.remove)
        toast('Removed from your friends')
        friends = await F.listFriends()
        if (location.hash !== '#friends') location.hash = '#friends'
        else render(await F.getMyProfile())
      } catch (err) { toast(err.message) }
    }
  })
  // a friend's pet is happy to see you too: it hops, hearts float up, and it does something sweet
  let plays = 0
  function playWithPet(pt) {
    const f = friends.find((x) => x.user_id === visiting())
    const name = petName(f), dog = f?.room?.pet === 'dog'
    $('.fr-room svg .pet-g', el)?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-7px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }], { duration: 700, easing: 'ease-out' })
    for (let i = 0; i < 3; i++) {
      const h = document.createElement('span')
      h.className = 'pet-heart'
      h.textContent = '♥'
      h.style.left = 30 + i * 20 + '%'
      h.style.animationDelay = i * 0.15 + 's'
      pt.appendChild(h)
      setTimeout(() => h.remove(), 1600)
    }
    const lines = dog
      ? [`${name} wags happily`, `${name} brings you a ball`, `${name} wants belly rubs`, `${name} licks your hand`, `${name} thinks you are the best guest`]
      : [`${name} purrs`, `${name} rubs against your leg`, `${name} chases a ribbon`, `${name} gives you a slow blink`, `${name} rolls over for you`]
    toast(lines[plays++ % lines.length])
    if (plays === 1) window.dispatchEvent(new CustomEvent('planner:track', { detail: { name: 'friend_pet' } }))
  }

  // two taps to remove, instead of a browser dialog
  function confirmRemove(b) {
    if (b.dataset.sure) return true
    b.dataset.sure = '1'; b.textContent = 'Tap again to remove'
    setTimeout(() => { if (b.isConnected) { delete b.dataset.sure; b.textContent = 'Remove friend' } }, 3000)
    return false
  }

  el.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (e.target.id === 'fr-add') {
      const code = $('#fr-code', el).value
      $('#fr-err', el).textContent = ''
      try {
        const name = await F.addFriend(code)
        toast(`You and ${name} are friends now`)
        friends = await F.listFriends()
        render(await F.getMyProfile())
      } catch (err) { $('#fr-err', el).textContent = err.message }
    }
    if (e.target.id === 'fr-note') {
      const text = $('#fr-text', el).value.trim()
      if (!text) return
      const btn = e.target.querySelector('[type=submit]')
      btn.disabled = true
      try {
        await F.leaveNote(visiting(), text, noteColor)
        $('#fr-text', el).value = ''
        toast(`Your note is on ${friends.find((x) => x.user_id === visiting())?.name || 'your friend'}’s board`)
      } catch (err) { toast('Could not leave the note: ' + (err.message || 'no connection')) } finally { btn.disabled = false }
    }
  })

  const onHash = () => { if (location.hash.startsWith('#friends') && friends) F.getMyProfile().then(render) }
  window.addEventListener('hashchange', onHash)
  load()
  return () => window.removeEventListener('hashchange', onHash)
}
