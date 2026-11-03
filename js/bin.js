// The diary's recycle bin: a page you throw away is crumpled into a paper ball and lands in the bin.
// The page itself stays in the book (empty); what was written on it waits in the bin until you put it back.

import * as db from './db.js'

export const BIN_SVG = `<svg viewBox="0 0 64 72" aria-hidden="true">
  <defs><linearGradient id="binBody" x1="0" x2="1"><stop offset="0" stop-color="#C9BEDF"/><stop offset=".5" stop-color="#E4DCF1"/><stop offset="1" stop-color="#B3A6CF"/></linearGradient></defs>
  <path d="M12 24 L16 66 Q16.5 70 21 70 H43 Q47.5 70 48 66 L52 24 Z" fill="url(#binBody)"/>
  <path d="M22 30 L24 62 M32 30 V62 M42 30 L40 62" stroke="#9A8CBB" stroke-width="2" stroke-linecap="round" opacity=".6"/>
  <ellipse cx="32" cy="24" rx="20" ry="4.5" fill="#8E80AE"/>
  <g class="bin-lid"><rect x="9" y="15" width="46" height="6" rx="3" fill="#A797C9"/><rect x="25" y="10" width="14" height="6" rx="3" fill="none" stroke="#A797C9" stroke-width="3"/></g>
</svg>`

// a crumpled paper ball: an uneven round shape with creases
export const BALL_SVG = `<svg viewBox="0 0 60 60" aria-hidden="true">
  <defs><radialGradient id="ballG" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F3EEE4"/><stop offset="1" stop-color="#D8CFC0"/></radialGradient></defs>
  <path d="M30 3 L41 6 L50 13 L56 24 L55 36 L50 47 L40 55 L28 57 L17 53 L8 45 L4 33 L6 21 L13 11 L22 5 Z" fill="url(#ballG)" stroke="#CFC5B4" stroke-width="1"/>
  <path d="M14 18 L26 24 L22 36 L33 41 L45 34 M26 24 L37 15 L45 34 M22 36 L12 40 M33 41 L31 53 M37 15 L48 20 M26 24 L19 9" stroke="#C8BDAA" stroke-width="1.2" fill="none" stroke-linejoin="round"/>
  <path d="M26 24 L37 15 L45 34 L33 41 L22 36 Z" fill="#000" opacity=".04"/>
  <path d="M12 40 L22 36 L33 41 L31 53 L17 53 Z" fill="#000" opacity=".07"/>
</svg>`

export const binKeys = async () => (await db.keys('bin:')).sort().reverse()
export const throwAway = (n, page) => { const at = Date.now(); return db.set('bin:' + at, { n, page, at }).then(() => at) }
export const getBinned = (k) => db.get(k)
export const forget = (k) => db.del(k)

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// The animation: the page crumples, becomes a ball and is thrown in an arc into the bin.
export async function crumpleInto(pageCopy, from, bin) {
  const r = from.getBoundingClientRect()
  const b = bin.getBoundingClientRect()
  const sheet = document.createElement('div')
  sheet.className = 'crumple'
  Object.assign(sheet.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' })
  sheet.appendChild(pageCopy)
  document.body.appendChild(sheet)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // 1. crumple: the sheet wrinkles, folds in on itself and shrinks into a ball
  const jag = (k) => `polygon(${[[0, 0], [25, k * 6], [50, 0], [75, k * 8], [100, 0], [100 - k * 7, 25], [100, 50], [100 - k * 9, 75], [100, 100], [75, 100 - k * 7], [50, 100], [25, 100 - k * 9], [0, 100], [k * 8, 75], [0, 50], [k * 6, 25]].map(([x, y]) => `${x}% ${y}%`).join(', ')})`
  if (!reduce) {
    await sheet.animate([
      { transform: 'scale(1) rotate(0deg)', clipPath: jag(0), filter: 'brightness(1)', borderRadius: '4px' },
      { transform: 'scale(.92, .88) rotate(-4deg) skewX(3deg)', clipPath: jag(1.2), filter: 'brightness(.97) contrast(1.05)', offset: 0.3 },
      { transform: 'scale(.55, .5) rotate(10deg) skewY(-6deg)', clipPath: jag(3.5), filter: 'brightness(.93) contrast(1.1)', borderRadius: '30%', offset: 0.65 },
      { transform: 'scale(.12) rotate(-25deg)', clipPath: jag(5.5), filter: 'brightness(.9)', borderRadius: '50%' },
    ], { duration: 700, easing: 'cubic-bezier(.5, 0, .7, 1)', fill: 'forwards' }).finished
  }
  // 2. the ball appears where the sheet was and flies into the bin
  const size = Math.max(34, Math.min(56, r.width * 0.14))
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2
  const tx = b.left + b.width / 2, ty = b.top + b.height * 0.32
  const outer = document.createElement('div')
  outer.className = 'paper-ball'
  Object.assign(outer.style, { left: cx - size / 2 + 'px', top: cy - size / 2 + 'px', width: size + 'px', height: size + 'px' })
  outer.innerHTML = `<div class="paper-ball-in">${BALL_SVG}</div>`
  document.body.appendChild(outer)
  sheet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' })
  const lid = bin.querySelector('.bin-lid')
  if (reduce) { await wait(150); sheet.remove(); outer.remove(); return }
  outer.querySelector('.paper-ball-in').animate([{ transform: 'scale(.6)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' })
  await wait(160)
  lid?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-38deg)' }], { duration: 260, easing: 'ease-out', fill: 'forwards' })
  const dx = tx - cx, dy = ty - cy
  const lift = Math.min(-90, -Math.abs(dx) * 0.35)
  const flight = 760
  // x moves evenly, y goes up then falls: together they draw an arc
  const fx = outer.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], { duration: flight, easing: 'linear', fill: 'forwards' })
  const inner = outer.querySelector('.paper-ball-in')
  inner.animate([
    { transform: 'translateY(0) rotate(0deg) scale(1)' },
    { transform: `translateY(${lift}px) rotate(220deg) scale(.95)`, offset: 0.45, easing: 'ease-in' },
    { transform: `translateY(${dy}px) rotate(480deg) scale(.7)` },
  ], { duration: flight, easing: 'ease-out', fill: 'forwards' })
  await fx.finished
  sheet.remove()
  outer.animate([{ opacity: 1, clipPath: 'inset(0 0 0 0)' }, { opacity: 0, clipPath: 'inset(0 0 100% 0)' }], { duration: 160, fill: 'forwards' })
  bin.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(0)' }], { duration: 420, easing: 'ease-out' })
  await wait(180)
  lid?.animate([{ transform: 'rotate(-38deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' })
  outer.remove()
}
