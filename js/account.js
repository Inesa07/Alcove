// Signing in, like on any website: a welcome screen with "Sign in" and "Create account".
// Once you are signed in, everything you write is kept in the cloud and appears on your other devices.
// The round button with your initial (top of the menu) shows your account and lets you sign out.

import * as sync from './sync.js'
import { OWNER_EMAIL as OWNER } from './config.js'
import { getState, setName } from './store.js'
import { drawRoom, DEFAULT_ROOM } from './room.js'
import { $, esc, toast, themeMode, setTheme } from './ui.js'
import { maybeOnboard } from './onboarding.js'
import { track, trackDaily, flush } from './analytics.js'

let gate, mode = 'in', note = '', notice = ''

const hasSession = () => Object.keys(localStorage).some((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))

function forms() {
  const err = note ? `<p class="auth-msg bad" role="alert">${esc(note)}</p>` : ''
  const ok = notice ? `<p class="auth-msg" role="status">${esc(notice)}</p>` : ''
  if (mode === 'check') return `
    <h1>Check your email</h1>
    <p class="auth-lead">We sent you a link. Open it on this device to confirm your account, and you are in. If it does not come in a few minutes, look in Spam.</p>
    <button class="auth-link" data-mode="in">Back to sign in</button>`
  if (mode === 'forgot') return `
    <h1>Forgot your password?</h1>
    <p class="auth-lead">Write your email and we will send you a link to choose a new one.</p>
    <form data-do="forgot">
      <label>Email<input name="email" type="email" autocomplete="email" required></label>
      ${err}${ok}
      <button class="primary auth-go" type="submit">Send the link</button>
    </form>
    <button class="auth-link" data-mode="in">Back to sign in</button>`
  if (mode === 'newpass') return `
    <h1>Choose a new password</h1>
    <form data-do="newpass">
      <label>New password<input name="password" type="password" autocomplete="new-password" minlength="6" required></label>
      ${err}
      <button class="primary auth-go" type="submit">Save and open my planner</button>
    </form>`
  if (mode === 'up') return `
    <h1>Create your account</h1>
    <p class="auth-lead">Your diary, books, notes and calendar, on every device.</p>
    <form data-do="up">
      <label>Your name<input name="name" autocomplete="given-name" required></label>
      <label>Email<input name="email" type="email" autocomplete="email" required></label>
      <label>Password<input name="password" type="password" autocomplete="new-password" minlength="6" required placeholder="At least 6 characters"></label>
      ${err}
      <button class="primary auth-go" type="submit">Create account</button>
    </form>
    <p class="auth-switch">Already have an account? <button class="auth-link" data-mode="in">Sign in</button></p>`
  return `
    <h1>Welcome back</h1>
    <p class="auth-lead">Sign in to open your room.</p>
    <form data-do="in">
      <label>Email<input name="email" type="email" autocomplete="email" required></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
      <button type="button" class="auth-link forgot" data-mode="forgot">Forgot password?</button>
      ${err}${ok}
      <button class="primary auth-go" type="submit">Sign in</button>
    </form>
    <p class="auth-switch">New here? <button class="auth-link" data-mode="up">Create an account</button></p>
    <p class="auth-privacy">We collect anonymous usage statistics to improve the app. What you write stays private.</p>`
}

function paintGate() {
  $('.auth-card', gate).innerHTML = `<div class="auth-brand">Planner</div>${forms()}`
  $('.auth-card input', gate)?.focus()
}

function openGate(m = 'in') {
  mode = m
  document.documentElement.classList.add('locked')
  gate.hidden = false
  paintGate()
}

function closeGate() {
  gate.hidden = true
  document.documentElement.classList.remove('locked')
  note = notice = ''
  const n = sync.nameOf()
  if (n && !getState().name) setName(n)
  trackDaily('app_open')
  flush()
  maybeOnboard(n)
}

const friendly = (e) => {
  const m = e?.message || ''
  if (/invalid login/i.test(m)) return 'Wrong email or password.'
  if (/not confirmed/i.test(m)) return 'Please confirm your email first: open the link we sent you.'
  if (/already registered/i.test(m)) return 'There is already an account with this email. Sign in instead.'
  if (/fetch|network/i.test(m)) return 'No internet connection. Connect and try again.'
  return m || 'Something went wrong. Try again.'
}

async function submit(form) {
  const f = Object.fromEntries(new FormData(form))
  const btn = $('.auth-go', form)
  btn.disabled = true
  btn.textContent = 'One moment…'
  note = notice = ''
  try {
    if (form.dataset.do === 'in') { await sync.signIn(f.email.trim(), f.password); closeGate(); toast('Welcome back!') }
    if (form.dataset.do === 'up') {
      const r = await sync.signUp(f.name.trim(), f.email.trim(), f.password)
      track('signed_up')
      if (r === 'check-email') { mode = 'check'; paintGate(); return }
      if (r === 'exists') { mode = 'in'; notice = 'You already have an account with this email. Sign in with your password.'; paintGate(); return }
      closeGate(); toast('Your account is ready')
    }
    if (form.dataset.do === 'forgot') { await sync.sendReset(f.email.trim()); notice = 'Sent! Check your email.'; paintGate(); return }
    if (form.dataset.do === 'newpass') { await sync.setPassword(f.password); closeGate(); toast('Your new password is saved') }
  } catch (e) {
    note = friendly(e)
    paintGate()
  }
}

/* ---------- the account button and sheet ---------- */

function setupMenu() {
  const btn = document.createElement('button')
  btn.className = 'me-btn'
  btn.type = 'button'
  $('.side').prepend(btn)
  const dlg = document.createElement('dialog')
  dlg.className = 'sheet-dialog account'
  dlg.setAttribute('aria-labelledby', 'acc-title')
  document.body.append(dlg)

  const paintBtn = () => {
    const i = sync.info()
    const n = getState().name || sync.nameOf() || i.email || '?'
    btn.textContent = n.trim()[0]?.toUpperCase() || '?'
    btn.dataset.state = i.status
    btn.setAttribute('aria-label', 'Your account')
  }
  const paint = () => {
    const i = sync.info()
    const when = i.lastSync ? new Date(i.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    const line = i.status === 'error' ? 'Not saved to the cloud right now – it will be when you are online.' : i.status === 'syncing' ? 'Saving…' : `Everything is saved${when ? ' · ' + when : ''}.`
    dlg.innerHTML = `<div class="book-form">
      <h3 id="acc-title">${esc(getState().name || sync.nameOf() || 'Your account')}</h3>
      <p class="acc-who">${esc(i.email)}</p>
      <p class="acc-msg ${i.status === 'error' ? 'bad' : ''}">${line}</p>
      <p class="acc-privacy">We collect anonymous usage statistics (like which pages are opened) to improve the app. What you write is never part of them.</p>
      ${i.email === OWNER ? '<p><a class="link-btn" href="#admin" data-close>Open your app statistics</a></p>' : ''}
      <p class="acc-label">Look</p>
      <div class="seg acc-theme" role="radiogroup" aria-label="Look">${[['light', 'Light'], ['dark', 'Dark'], ['auto', 'Like my device']].map(([k, v]) => `<button type="button" role="radio" aria-checked="${themeMode() === k}" data-theme-pick="${k}">${v}</button>`).join('')}</div>
      <div class="bf-actions">
        <button type="button" class="ghost danger" id="acc-out">Sign out</button>
        <span class="grow"></span>
        <button type="button" class="primary" data-close>Done</button>
      </div></div>`
  }
  btn.addEventListener('click', () => { paint(); dlg.showModal() })
  dlg.addEventListener('click', async (e) => {
    if (e.target === dlg || e.target.closest('[data-close]')) dlg.close()
    const tp = e.target.closest('[data-theme-pick]')
    if (tp) { setTheme(tp.dataset.themePick); paint() }
    if (e.target.closest('#acc-out')) {
      try { await sync.signOut(); location.reload() } catch (err) { toast(err.message) }
    }
  })
  sync.onStatus(() => { paintBtn(); if (dlg.open) paint() })
  window.addEventListener('planner:synced', paintBtn)
  paintBtn()
}

export async function setupAccount() {
  if (!sync.configured()) { document.documentElement.classList.remove('locked'); return }
  gate = document.createElement('div')
  gate.className = 'auth'
  gate.hidden = true
  const { svg } = drawRoom({ room: DEFAULT_ROOM, books: 6, notes: 4, events: 1, leaves: 6 })
  gate.innerHTML = `<div class="auth-art" aria-hidden="true">${svg}</div><div class="auth-card"></div>`
  document.body.append(gate)
  gate.addEventListener('submit', (e) => { e.preventDefault(); submit(e.target) })
  gate.addEventListener('click', (e) => {
    const m = e.target.closest('[data-mode]')
    if (m) { mode = m.dataset.mode; note = notice = ''; paintGate() }
  })
  setupMenu()

  const fromLink = /access_token|error_description/.test(location.hash)
  if (!hasSession() && !fromLink) openGate('in')            // not signed in on this device: welcome screen right away
  const r = await sync.start()
  if (r.type === 'recovery') { openGate('newpass'); return }
  if (r.user) { closeGate(); if (r.type === 'signup') toast('Your email is confirmed. Welcome!'); return }
  note = r.error || ''
  openGate('in')
}
