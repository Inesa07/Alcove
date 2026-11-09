// The notes board can look five different ways. Each one draws its own top part
// (lights, letters, pearls, a case stamp or the night sky); the CSS does the rest.

export const WALLS = [
  ['cork', 'Cozy cork', 'The classic board with fairy lights'],
  ['letters', 'Stranger Things', 'Painted letters and blinking bulbs'],
  ['regency', 'Bridgerton', 'Roses, pearls and wax seals'],
  ['case', 'Sherlock', 'A case board with red string'],
  ['gothic', 'Wednesday', 'Black lace, bats and a full moon'],
  ['paris', 'Emily in Paris', 'Postcards from a Paris café'],
]
// boards that were saved under an older name
export const wallId = (w) => ({ stars: 'gothic' }[w] || (WALLS.some(([k]) => k === w) ? w : 'cork'))

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

// a dim 80s living room: yellowed floral wallpaper, letters painted in a hurry with black paint
// (a few drips run down), and one big old Christmas bulb hanging over every letter
function lettersTop() {
  let k = 0
  return `<div class="alpha" aria-label="Tap a letter to light it up">${ROWS.map((row, ri) => {
    const n = row.length
    const ys = [...row].map((_, i) => 6 + (i % 2) * 6 + rnd(i * 3 + ri * 17) * 5)
    const pts = ys.map((y, i) => [((i + 0.5) / n) * 100, y])
    const path = (off) => {
      let d = `M-1 ${ys[0] - 4 + off}`
      pts.forEach(([x, y], i) => { const px = i ? pts[i - 1][0] : -1, py = i ? pts[i - 1][1] : ys[0] - 4; d += ` Q${(px + x) / 2 + off} ${Math.max(py, y) + 9 + rnd(i + ri) * 5 + off} ${x} ${y + off * 0.3}` })
      return d + ` Q${(pts[n - 1][0] + 101) / 2} ${ys[n - 1] + 10 + off} 101 ${ys[n - 1] - 3}`
    }
    return `<div class="al-row"><svg class="al-wire" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <path d="${path(0)}" fill="none" stroke="#1b2a1d" stroke-width="2.2" vector-effect="non-scaling-stroke"/>
      <path d="${path(0.6)}" fill="none" stroke="#2c4130" stroke-width="1.4" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"/></svg>${[...row].map((ch, i) => {
      const sd = k++
      const drips = rnd(sd + 21) > 0.45 ? Array.from({ length: 1 + Math.floor(rnd(sd + 5) * 2) }, (_, j) => `<i class="drip" style="left:${(25 + rnd(sd + j * 9) * 50).toFixed(0)}%;--h:${(8 + rnd(sd + j * 13) * 22).toFixed(0)}px"></i>`).join('') : ''
      return `<button type="button" class="al" data-al="${ch}" style="--bc:${BULBS[Math.floor(rnd(sd + 3) * BULBS.length)]};--r:${(rnd(sd + 7) * 16 - 8).toFixed(1)}deg;--dy:${ys[i].toFixed(1)}px;--d:${(rnd(sd + 11) * 5).toFixed(2)}s;--sx:${(0.85 + rnd(sd + 17) * 0.35).toFixed(2)}" aria-label="${ch}"><i class="al-glow"></i><i class="al-bulb"></i><b>${ch}${drips}</b></button>`
    }).join('')}</div>`
  }).join('')}</div>`
}

// a rose seen from above: petals around, a curl in the middle
function rose(x, y, r, c, dark) {
  let p = `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + r; p += `<ellipse cx="${(x + Math.cos(a) * r * 0.62).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.62).toFixed(1)}" rx="${(r * 0.55).toFixed(1)}" ry="${(r * 0.42).toFixed(1)}" transform="rotate(${((a * 180) / Math.PI).toFixed(0)} ${(x + Math.cos(a) * r * 0.62).toFixed(1)} ${(y + Math.sin(a) * r * 0.62).toFixed(1)})" fill="${c}" stroke="${dark}" stroke-width=".6" stroke-opacity=".5"/>` }
  p += `<path d="M${x - r * 0.35} ${y} a${r * 0.35} ${r * 0.35} 0 1 1 ${r * 0.35} ${r * 0.35} a${r * 0.22} ${r * 0.22} 0 1 1 ${-r * 0.18} ${-r * 0.3}" fill="none" stroke="${dark}" stroke-width="1.1" stroke-opacity=".7"/>`
  return p
}
const leaf = (x, y, a, l = 13) => `<path d="M${x} ${y} q${l * 0.5} ${-l * 0.45} ${l} 0 q${-l * 0.5} ${l * 0.45} ${-l} 0z" transform="rotate(${a} ${x} ${y})" fill="#9DBF94" stroke="#7FA37A" stroke-width=".6"/>`
const butterfly = (x, y, s, c) => `<g class="bfly" transform="translate(${x} ${y}) scale(${s})"><g class="wing"><path d="M0 0 C-10 -14 -20 -6 -12 2 C-18 8 -8 14 0 4z" fill="${c}" opacity=".9"/><path d="M0 0 C10 -14 20 -6 12 2 C18 8 8 14 0 4z" fill="${c}" opacity=".9"/></g><path d="M0 -4 v9" stroke="#6B5B7A" stroke-width="1.6" stroke-linecap="round"/></g>`

// Regency: a garland of roses with pearls swagged below, wisteria falling from the corners,
// an oval gilded cartouche with the title, and butterflies
function regencyTop() {
  let garland = '', pearls = '', wist = ''
  const swags = 6, w = 1000 / swags
  for (let s = 0; s <= swags; s++) {
    const x = s * w
    // a bunch of roses where two swags meet
    garland += leaf(x - 22, 18, -160, 18) + leaf(x + 6, 22, 20, 18) + leaf(x - 8, 30, 100, 14) + leaf(x + 14, 8, -30, 14)
    garland += rose(x - 10, 14, 11, '#F4C2CF', '#C9788F') + rose(x + 9, 18, 9, '#FBE3E8', '#D79AAB') + rose(x - 1, 27, 6.5, '#E8A3B8', '#B86A83')
    garland += `<circle cx="${x + 18}" cy="${27}" r="2.4" fill="#fff"/><circle cx="${x - 22}" cy="${29}" r="2" fill="#fff"/>`
    if (s < swags) {
      for (const [depth, size] of [[30, 3.3], [46, 2.6]]) {
        for (let i = 1; i < 26; i++) { const t = i / 26; pearls += `<circle cx="${(x + t * w).toFixed(1)}" cy="${(20 + Math.sin(t * Math.PI) * depth).toFixed(1)}" r="${size}" fill="url(#pearl)"/>` }
      }
      // a pearl drop in the middle of each swag
      pearls += `<path d="M${x + w / 2} ${66} v10" stroke="#E8DCC8" stroke-width="1"/><ellipse cx="${x + w / 2}" cy="${80}" rx="3.6" ry="5" fill="url(#pearl)"/>`
    }
  }
  // wisteria falling from both top corners, longest near the corner
  for (const side of [0, 1]) {
    for (let k = 0; k < 4; k++) {
      const fx = side ? 1000 - 18 - k * 30 : 18 + k * 30, len = 150 - k * 30
      for (let j = 0; j < 24; j++) {
        const t = j / 24, y = 30 + t * len, spread = 10 * (1 - t) + 2
        wist += `<circle cx="${(fx + (rnd(side * 99 + k * 31 + j) - 0.5) * spread * 2).toFixed(1)}" cy="${y.toFixed(1)}" r="${(4.6 - t * 2.6).toFixed(1)}" fill="${['#B9A3E0', '#CDB8F0', '#A58BD6', '#E2D6F7'][(j + k) % 4]}" opacity=".9"/>`
      }
    }
  }
  return `<svg class="regency-top" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMin meet" aria-hidden="true">
    <defs><radialGradient id="pearl" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#F6F1EA"/><stop offset="1" stop-color="#CFC4B5"/></radialGradient>
    <linearGradient id="gilt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E3A1"/><stop offset=".45" stop-color="#C9A24E"/><stop offset=".6" stop-color="#F2DC94"/><stop offset="1" stop-color="#A9822F"/></linearGradient></defs>
    ${wist}${pearls}${garland}
    <g transform="translate(500 128)">
      <ellipse rx="270" ry="52" fill="#FFFCF6" stroke="url(#gilt)" stroke-width="7"/>
      <ellipse rx="258" ry="42" fill="none" stroke="#C9A24E" stroke-width="1" stroke-dasharray="2 4"/>
      ${rose(-272, 0, 10, '#F4C2CF', '#C9788F')}${rose(272, 0, 10, '#F4C2CF', '#C9788F')}${leaf(-286, 8, 150, 15)}${leaf(-262, 12, 40, 13)}${leaf(286, 8, 30, 15)}${leaf(262, 12, 140, 13)}
      ${rose(0, -50, 9, '#FBE3E8', '#D79AAB')}${leaf(-14, -48, -170, 13)}${leaf(14, -48, -10, 13)}
    </g>
    ${butterfly(150, 110, 1.3, '#B8D4F0')}${butterfly(820, 92, 1.1, '#F4C2CF')}${butterfly(880, 150, 0.75, '#D9CCF2')}
  </svg>
  <p class="regency-title">Notes &amp; Correspondence</p>
  ${['tl', 'tr', 'bl', 'br'].map((c) => `<svg class="flourish fl-${c}" viewBox="0 0 80 80" aria-hidden="true"><path d="M6 74 V30 C6 14 14 6 30 6 H74 M14 66 V34 C14 22 22 14 34 14 H66 M24 40 c0 -10 6 -16 16 -16 c-8 4 -10 10 -6 16 c-4 -4 -10 -2 -10 0z" fill="none" stroke="#C8A85A" stroke-width="2.2" stroke-linecap="round"/><circle cx="40" cy="40" r="3" fill="#C8A85A"/></svg>`).join('')}`
}

function caseTop() {
  const d = new Date()
  return `<div class="case-top"><span class="case-stamp">Case file</span><span class="case-no">No. ${String(d.getFullYear()).slice(2)}-${String(d.getMonth() + 1).padStart(2, '0')}</span><span class="case-note">Things to figure out</span><span class="case-plaque">221B</span></div>`
}

// Wednesday: a dark gothic window at night. Black lace along the top, cobwebs in the corners,
// a big full moon with bats flying across it
function gothicTop() {
  const web = (flip) => `<svg class="cobweb ${flip ? 'cw-r' : ''}" viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="#D9D2E6" stroke-width=".8" opacity=".55">
    ${[0, 18, 36, 54, 72, 90].map((a) => { const r = (a * Math.PI) / 180; return `<path d="M0 0 L${(Math.cos(r) * 120).toFixed(0)} ${(Math.sin(r) * 120).toFixed(0)}"/>` }).join('')}
    ${[22, 42, 64, 88, 112].map((d) => `<path d="${[0, 18, 36, 54, 72, 90].map((a, i) => { const r = (a * Math.PI) / 180; return `${i ? 'Q' + (Math.cos(r - 0.16) * d * 0.86).toFixed(0) + ' ' + (Math.sin(r - 0.16) * d * 0.86).toFixed(0) + ' ' : 'M'}${(Math.cos(r) * d).toFixed(0)} ${(Math.sin(r) * d).toFixed(0)}` }).join(' ')}"/>`).join('')}</g>
    <path d="M70 0 v52" stroke="#D9D2E6" stroke-width=".6" opacity=".6"/><g transform="translate(70 56)"><ellipse rx="4" ry="5" fill="#16121c"/><circle cy="-6" r="3" fill="#16121c"/>${[-1, 1].map((x) => [0, 1, 2].map((i) => `<path d="M0 ${-2 + i * 2.4} q${x * 6} ${-4 + i * 2} ${x * 9} ${2 + i * 2}" stroke="#16121c" stroke-width="1" fill="none"/>`).join('')).join('')}</g></svg>`
  const bat = (x, y, s, d) => `<g class="bat" style="animation-delay:${d}s"><path transform="translate(${x} ${y}) scale(${s})" d="M0 0 c-6 -8 -14 -8 -22 -4 c4 1 6 4 6 8 c-3 -2 -7 -2 -9 0 c4 1 6 4 6 7 c6 -4 13 -6 19 -4 l0 -3 c1 -2 3 -2 4 0 l0 3 c6 -2 13 0 19 4 c0 -3 2 -6 6 -7 c-2 -2 -6 -2 -9 0 c0 -4 2 -7 6 -8 c-8 -4 -16 -4 -22 4z" fill="#0f0b14"/></g>`
  return `<div class="lace" aria-hidden="true"></div>${web(false)}${web(true)}
    <svg class="moon-sky" viewBox="0 0 1000 260" preserveAspectRatio="xMidYMin meet" aria-hidden="true">
      <defs><radialGradient id="moonglow"><stop offset="0" stop-color="#EDE6FF" stop-opacity=".35"/><stop offset="1" stop-color="#EDE6FF" stop-opacity="0"/></radialGradient>
      <radialGradient id="moon" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FBF8FF"/><stop offset=".7" stop-color="#DCD3EC"/><stop offset="1" stop-color="#B9AECF"/></radialGradient></defs>
      <circle cx="820" cy="118" r="150" fill="url(#moonglow)"/><circle cx="820" cy="118" r="70" fill="url(#moon)"/>
      <circle cx="796" cy="98" r="11" fill="#C9BEDD" opacity=".55"/><circle cx="842" cy="140" r="15" fill="#C9BEDD" opacity=".45"/><circle cx="836" cy="88" r="6" fill="#C9BEDD" opacity=".5"/>
      ${bat(760, 110, 1.3, 0)}${bat(900, 60, 0.9, 1.2)}${bat(640, 70, 0.8, 2.1)}${bat(700, 180, 0.6, 0.6)}
    </svg>
    <p class="gothic-title">Things I must not forget</p>`
}

// Emily in Paris: a striped café awning, a string of café bulbs, the Eiffel Tower drawn in fine lines
function parisTop() {
  const bulbs = Array.from({ length: 15 }, (_, i) => { const t = i / 14, x = 40 + t * 920, y = 96 + Math.sin(t * Math.PI) * 30; return `<g class="cafe-bulb" style="animation-delay:${(i % 4) * 0.5}s"><circle cx="${x.toFixed(0)}" cy="${(y + 9).toFixed(0)}" r="14" fill="#FFE7A8" opacity=".25"/><path d="M${x.toFixed(0)} ${y.toFixed(0)} v3" stroke="#3a2f2a" stroke-width="2"/><circle cx="${x.toFixed(0)}" cy="${(y + 9).toFixed(0)}" r="5.5" fill="#FFE7A8"/></g>` }).join('')
  const tower = `<g class="eiffel" fill="none" stroke="#5A4A57" stroke-width="1.6" stroke-linejoin="round">
    <path d="M0 0 v14 M-3 14 h6 l2 30 h-10z M-5 44 h10 M-6 44 L-14 92 h28 L6 44 M-16 92 h32 M-15 92 L-32 160 M15 92 L32 160 M-36 160 h72 M-32 160 q32 -40 64 0"/>
    <path d="M-10 60 l20 20 M10 60 l-20 20 M-13 100 l26 30 M13 100 l-26 30" stroke-width=".7" opacity=".6"/></g>`
  return `<div class="awning" aria-hidden="true"></div>
    <svg class="paris-top" viewBox="0 0 1000 160" preserveAspectRatio="xMidYMin meet" aria-hidden="true">
      <path d="M40 96 ${Array.from({ length: 15 }, (_, i) => { const t = i / 14; return `L${(40 + t * 920).toFixed(0)} ${(96 + Math.sin(t * Math.PI) * 30).toFixed(0)}` }).join(' ')}" stroke="#3a2f2a" stroke-width="1.2" fill="none"/>${bulbs}
    </svg>
    <p class="paris-title"><svg class="eiffel-wrap" viewBox="-40 -6 80 170" aria-hidden="true">${tower}</svg>Mes petites notes</p>`
}

export const wallTop = (w) => ({ letters: lettersTop, regency: regencyTop, case: caseTop, gothic: gothicTop, paris: parisTop }[w] || corkTop)()

// Lights & letters: the bulbs blink a word one letter at a time
let spelling = 0
export function spell(root, word) {
  const letters = [...word.toUpperCase()].filter((c) => /[A-Z]/.test(c)).slice(0, 12)
  if (!letters.length) return
  const run = ++spelling
  const all = root.querySelectorAll('.al')
  all.forEach((b) => b.classList.add('quiet'))
  root.querySelector('.board')?.classList.add('dark')
  letters.forEach((c, i) => setTimeout(() => {
    if (run !== spelling) return
    const b = root.querySelector(`[data-al="${c}"]`)
    if (!b) return
    b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash')
  }, 500 + i * 900))
  setTimeout(() => { if (run === spelling) { all.forEach((b) => b.classList.remove('quiet', 'flash')); root.querySelector('.board')?.classList.remove('dark') } }, 300 + letters.length * 900 + 900)
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
