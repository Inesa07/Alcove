// The little cloud button: sign in so the diary, books, notes and calendar are the same on every device.

import * as sync from './sync.js'
import { $, esc, toast } from './ui.js'

const ICON = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.1 9.2 4.5 4.5 0 0 0 7 18z"/></svg>'

export function setupAccount() {
  const btn = document.createElement('button')
  btn.className = 'cloud-btn'
  btn.type = 'button'
  btn.innerHTML = ICON + '<span class="cloud-label"></span>'
  $('.side').prepend(btn)

  const dlg = document.createElement('dialog')
  dlg.className = 'sheet-dialog account'
  dlg.setAttribute('aria-labelledby', 'acc-title')
  document.body.append(dlg)

  const when = (t) => (t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')

  function paintButton() {
    const i = sync.info()
    const label = { off: 'Sync', 'signed-out': 'Sign in', syncing: 'Syncing…', ok: 'Synced', error: 'Sync problem' }[i.status]
    btn.querySelector('.cloud-label').textContent = label
    btn.dataset.state = i.status
    btn.setAttribute('aria-label', label + ' – account and sync')
  }

  function paint() {
    const i = sync.info()
    let body
    if (!sync.configured()) {
      body = `<p>Sync is not switched on yet. When it is, you sign in once on each device and everything you write is the same on your phone and computer.</p>
        <div class="bf-actions"><span class="grow"></span><button type="button" class="primary" data-close>Okay</button></div>`
    } else if (i.status === 'signed-out' || (!i.email && i.status !== 'syncing')) {
      body = `<p>Sign in on each device to keep your diary, books, notes and calendar the same everywhere.</p>
        <form class="acc-form" id="acc-form">
          <label>Email<input id="acc-email" type="email" autocomplete="email" required></label>
          <label>Password<input id="acc-pass" type="password" autocomplete="current-password" minlength="6" required></label>
          <p class="acc-msg" id="acc-msg" role="status"></p>
          <div class="bf-actions">
            <button type="button" class="ghost" data-close>Not now</button>
            <span class="grow"></span>
            <button type="button" class="ghost" id="acc-new">Create account</button>
            <button type="submit" class="primary">Sign in</button>
          </div>
        </form>`
    } else {
      const line = i.status === 'error' ? `Could not sync: ${esc(i.lastError)}` : i.status === 'syncing' ? 'Syncing now…' : `Everything is saved in the cloud${i.lastSync ? ' · last sync ' + when(i.lastSync) : ''}.`
      body = `<p class="acc-who">Signed in as <b>${esc(i.email)}</b></p><p class="acc-msg ${i.status === 'error' ? 'bad' : ''}">${line}</p>
        <div class="bf-actions">
          <button type="button" class="ghost danger" id="acc-out">Sign out</button>
          <span class="grow"></span>
          <button type="button" class="ghost" id="acc-now">Sync now</button>
          <button type="button" class="primary" data-close>Done</button>
        </div>`
    }
    dlg.innerHTML = `<div class="book-form"><h3 id="acc-title">Your account</h3>${body}</div>`
  }

  async function submit(create) {
    const email = $('#acc-email', dlg).value.trim(), pass = $('#acc-pass', dlg).value
    const msg = $('#acc-msg', dlg)
    if (!email || pass.length < 6) { msg.textContent = 'Write your email and a password of at least 6 characters.'; return }
    msg.textContent = create ? 'Creating your account…' : 'Signing in…'
    try {
      const r = await sync.signIn(email, pass, create)
      if (r === 'check-email') msg.textContent = 'Almost there: open the email we sent you, confirm, then sign in here.'
      else { toast('Signed in. Your planner is syncing.'); paint() }
    } catch (e) {
      msg.textContent = /invalid/i.test(e?.message || '') ? 'Wrong email or password.' : e?.message || 'Could not sign in.'
    }
  }

  dlg.addEventListener('submit', (e) => { e.preventDefault(); submit(false) })
  dlg.addEventListener('click', async (e) => {
    if (e.target === dlg || e.target.closest('[data-close]')) dlg.close()
    if (e.target.closest('#acc-new')) { if ($('#acc-form', dlg).reportValidity()) submit(true) }
    if (e.target.closest('#acc-now')) sync.syncNow()
    if (e.target.closest('#acc-out')) { await sync.signOut(); toast('Signed out. Your things stay on this device.'); paint() }
  })
  btn.addEventListener('click', () => { paint(); dlg.showModal() })
  sync.onStatus(() => { paintButton(); if (dlg.open && !dlg.querySelector('#acc-form')) paint() })
  paintButton()
  sync.start()
}
