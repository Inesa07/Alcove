// The notes board can look five different ways. Each one draws its own top part
// (lights, letters, pearls, a case stamp or the night sky); the CSS does the rest.

export const WALLS = [
  ['cork', 'Cork board', 'Fairy lights on warm cork'],
  ['letters', 'Lights & letters', 'Painted letters and a bulb over each one'],
  ['regency', 'Regency', 'Pearls, wisteria and wax seals'],
  ['case', 'Case board', 'Red string between your notes'],
  ['stars', 'Starry night', 'Notes under the moon and stars'],
]

const BULBS = ['#FF5A4E', '#3FCB6B', '#4DA3FF', '#FFD23F', '#FF9A3C', '#E66CFF']
const ROWS = ['ABCDEFGH', 'IJKLMNOPQ', 'RSTUVWXYZ']
// the same letter always gets the same colour and tilt
const rnd = (s) => { const x = Math.sin(s * 99.13) * 43758.5; return x - Math.floor(x) }

function corkTop() {
  const c = ['#FFE29A', '#F7A8B8', '#BFE0FF', '#C9F2C7']
  return `<svg class="board-lights" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 8 Q125 52 250 14 T500 14 T750 14 T1000 8" fill="none" stroke="#5b4a3a" stroke-width="1.5"/>
    ${Array.from({ length: 21 }, (_, i) => { const x = i * 50, y = 8 + 22 * Math.abs(Math.sin((i / 20) * Math.PI * 4)) * 0.9 + 6; return `<g class="bulb" style="animation-delay:${(i % 5) * 0.35}s"><circle cx="${x}" cy="${y}" r="9" fill="${c[i % 4]}" opacity=".35"/><circle cx="${x}" cy="${y}" r="4.5" fill="${c[i % 4]}"/></g>` }).join('')}
  </svg>`
}

// painted letters on old wallpaper, with a string of big Christmas bulbs: one bulb over each letter
function lettersTop() {
  let k = 0
  return `<div class="alpha" aria-label="Tap a letter to light it up">${ROWS.map((row) => {
    const n = row.length
    const ys = [...row].map((_, i) => 5 + (i % 2) * 5 + rnd(i + n) * 3)
    const pts = ys.map((y, i) => [((i + 0.5) / n) * 100, y])
    let d = `M0 ${ys[0] - 2}`
    pts.forEach(([x, y], i) => { const px = i ? pts[i - 1][0] : 0, py = i ? pts[i - 1][1] : ys[0] - 2; d += ` Q${(px + x) / 2} ${Math.max(py, y) + 7} ${x} ${y}` })
    d += ` Q${(pts[n - 1][0] + 100) / 2} ${ys[n - 1] + 7} 100 ${ys[n - 1] - 2}`
    return `<div class="al-row"><svg class="al-wire" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="#1d2a1f" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>${[...row].map((ch, i) => {
      const s = k++
      return `<button type="button" class="al" data-al="${ch}" style="--bc:${BULBS[Math.floor(rnd(s + 3) * BULBS.length)]};--r:${(rnd(s + 7) * 14 - 7).toFixed(1)}deg;--dy:${ys[i].toFixed(1)}px;--d:${(rnd(s + 11) * 3).toFixed(2)}s" aria-label="${ch}"><i class="al-bulb"></i><b>${ch}</b></button>`
    }).join('')}</div>`
  }).join('')}</div>`
}

// pearl swags with little bows, and wisteria hanging between them
function regencyTop() {
  const swags = 5, w = 1000 / swags
  let pearls = '', bows = '', flowers = ''
  for (let s = 0; s < swags; s++) {
    const x0 = s * w
    for (let i = 0; i <= 22; i++) {
      const t = i / 22, x = x0 + t * w, y = 10 + Math.sin(t * Math.PI) * 34
      pearls += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 2 ? 3.2 : 4.2}" fill="url(#pearl)"/>`
    }
    bows += `<g transform="translate(${x0} 10)"><path d="M0 0 C-14 -10 -16 8 0 0 C14 -10 16 8 0 0" fill="#F5C6D3" stroke="#D99AAD" stroke-width="1"/><path d="M0 0 l-6 16 M0 0 l6 16" stroke="#F5C6D3" stroke-width="3" stroke-linecap="round"/><circle r="3" fill="#E8A3B8"/></g>`
    // wisteria: a soft bunch of small petals, longer in the middle
    const fx = x0 + w / 2 + (s % 2 ? 8 : -8)
    for (let j = 0; j < 26; j++) {
      const t = j / 26, y = 44 + t * 70, spread = 13 * (1 - t) + 3
      const x = fx + (rnd(s * 40 + j) - 0.5) * spread * 2
      flowers += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(4.4 - t * 2.4).toFixed(1)}" fill="${['#B9A3E0', '#CDB8F0', '#A58BD6', '#E2D6F7'][j % 4]}" opacity=".92"/>`
    }
    flowers += `<path d="M${fx} 40 q-4 -10 -14 -12 M${fx} 40 q6 -9 15 -8" stroke="#8FB58A" stroke-width="2" fill="none"/><ellipse cx="${fx - 14}" cy="${28}" rx="6" ry="3" fill="#A8C9A0" transform="rotate(-20 ${fx - 14} 28)"/>`
  }
  bows += `<g transform="translate(1000 10)"><path d="M0 0 C-14 -10 -16 8 0 0" fill="#F5C6D3" stroke="#D99AAD"/></g>`
  return `<svg class="regency-top" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
    <defs><radialGradient id="pearl" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#F3EEE6"/><stop offset="1" stop-color="#CFC4B5"/></radialGradient></defs>
    ${flowers}${pearls}${bows}</svg>
    <p class="regency-title">Notes &amp; Correspondence</p>
    ${['tl', 'tr', 'bl', 'br'].map((c) => `<svg class="flourish fl-${c}" viewBox="0 0 80 80" aria-hidden="true"><path d="M6 74 V30 C6 14 14 6 30 6 H74 M14 66 V34 C14 22 22 14 34 14 H66 M24 40 c0 -10 6 -16 16 -16 c-8 4 -10 10 -6 16 c-4 -4 -10 -2 -10 0z" fill="none" stroke="#C8A85A" stroke-width="2.2" stroke-linecap="round"/><circle cx="40" cy="40" r="3" fill="#C8A85A"/></svg>`).join('')}`
}

function caseTop() {
  const d = new Date()
  return `<div class="case-top"><span class="case-stamp">Case file</span><span class="case-no">No. ${String(d.getFullYear()).slice(2)}-${String(d.getMonth() + 1).padStart(2, '0')}</span><span class="case-note">Things to figure out</span></div>`
}

function starsTop() {
  let stars = ''
  for (let i = 0; i < 90; i++) stars += `<circle class="${i % 6 ? '' : 'tw'}" cx="${(rnd(i) * 1000).toFixed(0)}" cy="${(rnd(i + 500) * 300).toFixed(0)}" r="${(0.6 + rnd(i + 900) * 1.6).toFixed(1)}" fill="#FFF8E1" style="animation-delay:${(rnd(i + 70) * 4).toFixed(1)}s"/>`
  let garland = ''
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, x = t * 1000, y = 8 + Math.sin(t * Math.PI * 3) ** 2 * 26
    garland += `<path class="tw" d="M${x} ${y - 6}l1.8 4.2 4.4.4-3.3 2.9 1 4.4-3.9-2.3-3.9 2.3 1-4.4-3.3-2.9 4.4-.4z" fill="#FFE08A" style="animation-delay:${(i % 6) * 0.4}s"/>`
  }
  return `<svg class="night-sky" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMin meet" aria-hidden="true">${stars}
    <circle cx="905" cy="70" r="70" fill="#FFF4C9" opacity=".08"/><circle cx="905" cy="70" r="34" fill="#FFF4C9"/><circle cx="920" cy="62" r="30" fill="#2B2E63"/>
    <path class="shoot" d="M120 40 l140 50" stroke="url(#shoot)" stroke-width="2.4" stroke-linecap="round"/>
    <defs><linearGradient id="shoot"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs></svg>
    <svg class="star-garland" viewBox="0 0 1000 50" preserveAspectRatio="none" aria-hidden="true"><path d="${Array.from({ length: 25 }, (_, i) => { const t = i / 24; return `${i ? 'L' : 'M'}${t * 1000} ${8 + Math.sin(t * Math.PI * 3) ** 2 * 26}` }).join(' ')}" fill="none" stroke="#C9B37A" stroke-width="1" opacity=".7"/>${garland}</svg>`
}

export const wallTop = (w) => ({ letters: lettersTop, regency: regencyTop, case: caseTop, stars: starsTop }[w] || corkTop)()

// Lights & letters: the bulbs blink a word one letter at a time
let spelling = 0
export function spell(root, word) {
  const letters = [...word.toUpperCase()].filter((c) => /[A-Z]/.test(c)).slice(0, 12)
  if (!letters.length) return
  const run = ++spelling
  const all = root.querySelectorAll('.al')
  all.forEach((b) => b.classList.add('quiet'))
  letters.forEach((c, i) => setTimeout(() => {
    if (run !== spelling) return
    const b = root.querySelector(`[data-al="${c}"]`)
    if (!b) return
    b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash')
  }, 300 + i * 750))
  setTimeout(() => { if (run === spelling) all.forEach((b) => b.classList.remove('quiet', 'flash')) }, 300 + letters.length * 750 + 900)
}

// Case board: red string from pin to pin, through every note in order and a few across
export function drawString(wall) {
  wall.querySelector('.red-string')?.remove()
  const notes = [...wall.querySelectorAll('.note')]
  if (notes.length < 2) return
  const box = wall.getBoundingClientRect()
  const pin = (n) => { const r = n.getBoundingClientRect(); return [r.left - box.left + r.width / 2, r.top - box.top + 15] }
  const p = notes.map(pin)
  const pairs = p.slice(1).map((_, i) => [i, i + 1])
  for (let i = 0; i + 3 < p.length; i += 3) pairs.push([i, i + 3])
  const svg = `<svg class="red-string" width="${box.width}" height="${box.height}" aria-hidden="true">${pairs.map(([a, b]) => {
    const [x1, y1] = p[a], [x2, y2] = p[b], sag = Math.min(40, Math.hypot(x2 - x1, y2 - y1) * 0.08)
    return `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}"/>`
  }).join('')}${p.map(([x, y]) => `<circle class="rs-pin" cx="${x}" cy="${y}" r="6.5"/><circle cx="${x - 2}" cy="${y - 2}" r="2" fill="#fff" opacity=".55"/>`).join('')}</svg>`
  wall.insertAdjacentHTML('beforeend', svg)
}
