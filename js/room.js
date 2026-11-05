// The room is drawn in code on an isometric grid, so walls, floor and furniture
// can change colour and style. A point (x, y, z) in the room becomes a point on screen
// with P(): x goes to the right wall, y towards you along the left wall, z is height.

const K = 17, OX = 195, OY = 268
const COS = Math.cos(Math.PI / 6)
const P = (x, y, z) => [OX + (x - y) * COS * K, OY + (x + y) * 0.5 * K - z * K]
const pts = (ps) => ps.map((p) => P(...p).map((n) => n.toFixed(1)).join(',')).join(' ')

// The SVG shows the area x 0..390, y 70..450. Spots on top of it are placed in percent.
const VB = { x: 0, y: 70, w: 390, h: 380 }

/* ---------- options people can choose ---------- */

export const WALLS = {
  lavender: { name: 'Lavender', l: ['#DCD1E8', '#ECE4F3'], r: ['#CDC0DF', '#C1B2D6'] },
  rose: { name: 'Rose', l: ['#EFD5DC', '#F6E5EA'], r: ['#E5C2CC', '#DAB2BE'] },
  peach: { name: 'Peach', l: ['#F3DACB', '#F9E8DD'], r: ['#EBC9B6', '#E1BAA5'] },
  cream: { name: 'Cream', l: ['#EFE7D8', '#F7F1E6'], r: ['#E4D9C5', '#D9CCB5'] },
  sage: { name: 'Sage', l: ['#D4DECD', '#E4EBDE'], r: ['#C4D1BC', '#B5C4AC'] },
  sky: { name: 'Sky', l: ['#D0DDEB', '#E3ECF5'], r: ['#BED0E3', '#AFC3D9'] },
  mocha: { name: 'Mocha', l: ['#BCA595', '#CDB9AA'], r: ['#AB9383', '#9D8574'] },
  night: { name: 'Night blue', l: ['#5A6390', '#6B74A0'], r: ['#4B5480', '#414A74'] },
}

export const FLOORS = {
  oak: { name: 'Light oak', a: '#DCC1A6', b: '#EAD4BD', line: '#C9AB8E' },
  honey: { name: 'Honey wood', a: '#CFA06F', b: '#DEB487', line: '#BB8A5A' },
  walnut: { name: 'Walnut', a: '#8C6548', b: '#9F7759', line: '#77543A' },
  white: { name: 'White wood', a: '#E8E2DC', b: '#F4EFEA', line: '#D6CEC6' },
  grey: { name: 'Soft grey', a: '#BEB9C3', b: '#CECAD2', line: '#AAA4B0' },
}

export const WOODS = {
  oak: { name: 'Oak', c: '#D3AC8B' },
  walnut: { name: 'Walnut', c: '#94694D' },
  white: { name: 'White', c: '#EEEAF1' },
  pink: { name: 'Pink', c: '#E8BFC9' },
  sage: { name: 'Sage', c: '#B4C9B1' },
  black: { name: 'Black', c: '#4A4558' },
}

export const FABRICS = {
  lilac: { name: 'Lilac', c: '#B9A9E0' },
  rose: { name: 'Rose', c: '#E7A9B9' },
  peach: { name: 'Peach', c: '#F0B9A1' },
  cream: { name: 'Cream', c: '#E9DCC5' },
  sage: { name: 'Sage', c: '#A7C6AE' },
  blue: { name: 'Blue', c: '#A6BFE0' },
  linen: { name: 'Linen', c: '#F2E6D4' },
  white: { name: 'White', c: '#FFFFFF' },
  navy: { name: 'Night blue', c: '#2E3A78' },
  blush: { name: 'Blush', c: '#F3C9D6' },
}

export const RUGS = {
  pink: { name: 'Pink', c: '#F2D7DF' },
  cream: { name: 'Cream', c: '#F3EADB' },
  blue: { name: 'Blue', c: '#D9E5F3' },
  sage: { name: 'Sage', c: '#DAE7DA' },
  none: { name: 'No rug', c: null },
}

export const STYLES = {
  art: Object.fromEntries(Object.entries({ mountains: 'Mountains', sea: 'Sunset sea', flowers: 'Flowers in a vase', shapes: 'Soft shapes', moon: 'Moon and stars', cat: 'Cat portrait', plants: 'Pressed leaves' })),
  shelfStyle: { tall: 'Tall bookcase', low: 'Low shelf', ladder: 'Ladder shelf', cube: 'Cube shelf' },
  deskStyle: { drawers: 'Desk with drawers', simple: 'Light table', trestle: 'Trestle desk' },
  bedStyle: { classic: 'Cozy bed', canopy: 'Canopy bed', platform: 'Low platform bed' },
  chairStyle: { classic: 'Wooden chair', office: 'Office chair', armchair: 'Armchair', stool: 'Round stool' },
  pet: { cat: 'Cat', dog: 'Dog', none: 'No pet' },
  wallStyle: { plain: 'Plain paint', boards: 'Wooden boards', stripes: 'Stripes', dots: 'Polka dots', floral: 'Flowers', brick: 'Painted brick', panels: 'Wood panels' },
  floorStyle: { planks: 'Planks', herringbone: 'Herringbone', tiles: 'Tiles', carpet: 'Soft carpet' },
}

// Whole-room looks. Choosing one also sets matching colours, which can still be changed one by one.
export const THEMES = {
  cabin: { name: 'Nordic cabin', note: 'A pointed roof, a fireplace, snow outside the window' },
  observatory: { name: 'Night observatory', note: 'A starry dome, a round window and a telescope' },
  seaside: { name: 'Seaside studio', note: 'A glass wall to the sea and a deck outside' },
  pastel: { name: 'Pastel room', note: 'A bed on a platform, a cloud mirror and a desk setup' },
}
// rooms from before become the closest new one
const OLD_ROOM = { cozy: 'cabin', attic: 'cabin', japanese: 'pastel', plants: 'seaside', lofi: 'observatory', study: 'observatory', city: 'observatory' }
export const roomTheme = (t) => (THEMES[t] ? t : OLD_ROOM[t] || 'cabin')
export const THEME_PRESETS = {
  cabin: { blanket: 'linen', art: 'mountains', pet: 'cat', petColor: 'ginger' },
  observatory: { blanket: 'navy', art: 'moon', pet: 'cat', petColor: 'black' },
  seaside: { blanket: 'white', art: 'sea', pet: 'dog', petColor: 'golden' },
  pastel: { blanket: 'blush', art: 'flowers', pet: 'cat', petColor: 'white' },
  cozy: { wall: 'lavender', wallStyle: 'plain', floor: 'oak', floorStyle: 'planks', rug: 'pink', blanket: 'lilac', shelfWood: 'oak', deskWood: 'oak', bedWood: 'oak', chairColor: 'lilac', chairStyle: 'classic' },
  attic: { wall: 'peach', wallStyle: 'boards', floor: 'honey', floorStyle: 'planks', rug: 'cream', blanket: 'rose', shelfWood: 'white', deskWood: 'white', bedWood: 'oak', chairColor: 'cream', pet: 'cat', petColor: 'ginger', art: 'flowers' },
  japanese: { wall: 'cream', wallStyle: 'plain', floor: 'honey', floorStyle: 'planks', rug: 'none', blanket: 'blue', chairColor: 'peach', pet: 'cat', petColor: 'white', art: 'plants' },
  lofi: { wall: 'peach', wallStyle: 'plain', floor: 'honey', floorStyle: 'planks', rug: 'cream', blanket: 'peach', shelfWood: 'oak', deskWood: 'oak', bedWood: 'oak', chairColor: 'lilac', pet: 'cat', petColor: 'black', art: 'moon' },
  plants: { wall: 'cream', wallStyle: 'boards', floor: 'honey', floorStyle: 'herringbone', rug: 'sage', blanket: 'cream', shelfWood: 'oak', deskWood: 'oak', bedWood: 'oak', pet: 'cat', petColor: 'ginger', art: 'plants' },
  study: { wall: 'night', wallStyle: 'plain', floor: 'walnut', floorStyle: 'planks', rug: 'blue', blanket: 'blue', shelfWood: 'walnut', deskWood: 'walnut', bedWood: 'walnut', chairColor: 'blue', pet: 'cat', petColor: 'black', art: 'moon' },
}

export const DEFAULT_ROOM = {
  theme: 'cabin',
  wall: 'lavender', floor: 'oak', rug: 'pink',
  shelfStyle: 'tall', shelfWood: 'oak',
  deskStyle: 'drawers', deskWood: 'oak',
  bedStyle: 'classic', bedWood: 'oak', blanket: 'lilac',
  chairStyle: 'classic', chairColor: 'lilac',
  pet: 'cat', petColor: 'black', wallStyle: 'plain', floorStyle: 'planks', art: 'mountains',
}

/* ---------- colour helpers ---------- */

function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255] }
function toHex(rgb) { return '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('') }
// amount > 0 makes the colour lighter, < 0 darker
export function shade(c, amount) {
  const t = amount > 0 ? 255 : 0
  const k = Math.abs(amount)
  return toHex(hex(c).map((v) => v + (t - v) * k))
}
// top, front and side faces of a box, lit from above
const tones = (c) => [shade(c, 0.14), c, shade(c, -0.1)]

/* ---------- drawing helpers ---------- */

function painter() {
  const out = []
  const d = {
    out,
    raw(s) { out.push(s) },
    poly(ps, fill, extra = '') {
      out.push(`<polygon points="${pts(ps)}" fill="${fill}"${extra}/>`)
      if (fill === 'url(#sky)' && d.weather) skyWeather(d, ps)
    },
    // rain and snow go in front of hills and buildings, so they wait until the view is drawn
    flushWeather() { if (d.pending) { out.push(d.pending); d.pending = '' } },
    line(ps, stroke, width = 1, extra = '') { out.push(`<polyline points="${pts(ps)}" fill="none" stroke="${stroke}" stroke-width="${width}"${extra}/>`) },
    box(x0, y0, z0, dx, dy, dz, color, extra = '') {
      const [top, front, side] = Array.isArray(color) ? color : tones(color)
      const x1 = x0 + dx, y1 = y0 + dy, z1 = z0 + dz
      d.poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], front, extra)
      d.poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], side, extra)
      d.poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], top, extra)
    },
    ring(cx, cy, z, r, fill, extra = '', n = 40) {
      const ps = []
      for (let i = 0; i < n; i++) ps.push([cx + r * Math.cos((2 * Math.PI * i) / n), cy + r * Math.sin((2 * Math.PI * i) / n), z])
      d.poly(ps, fill, extra)
    },
    // an upright cylinder: bottom ring, the side between them, top ring
    cylinder(cx, cy, z0, r, h, color) {
      const [top, front, side] = tones(color)
      const ring = (z) => Array.from({ length: 40 }, (_, i) => P(cx + r * Math.cos((2 * Math.PI * i) / 40), cy + r * Math.sin((2 * Math.PI * i) / 40), z))
      const a = ring(z0), b = ring(z0 + h)
      const xs = a.map((p) => p[0])
      const L = xs.indexOf(Math.min(...xs)), R = xs.indexOf(Math.max(...xs))
      const fmt = (ps) => ps.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')
      out.push(`<polygon points="${fmt(a)}" fill="${side}"/>`)
      out.push(`<polygon points="${fmt([a[L], a[R], b[R], b[L]])}" fill="${front}"/>`)
      out.push(`<polygon points="${fmt(b)}" fill="${top}"/>`)
    },
    shadow(x0, y0, x1, y1, op = 0.16) { d.poly([[x0, y0, 0.01], [x1, y0, 0.01], [x1, y1, 0.01], [x0, y1, 0.01]], '#4A3428', ` opacity="${op * 1.4}" filter="url(#soft)"`) },
  }
  return d
}

function bounds(corners, pad = 0) {
  const ps = corners.map((c) => P(...c))
  const xs = ps.map((p) => p[0]), ys = ps.map((p) => p[1])
  const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad
  return {
    l: ((x0 - VB.x) / VB.w) * 100, t: ((y0 - VB.y) / VB.h) * 100,
    w: ((x1 - x0) / VB.w) * 100, h: ((y1 - y0) / VB.h) * 100,
  }
}

/* ---------- time of day ---------- */

export function timeOfDay(d = new Date()) {
  const h = d.getHours()
  if (h >= 5 && h < 11) return 'morning'
  if (h >= 11 && h < 17) return 'day'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

const SKIES = {
  morning: { stops: ['#F6C9B4', '#FBE4D3', '#E3ECF3'], orb: '#FFF4D6', orbZ: 5.0, stars: false, lights: false, beam: 0.28, hills: '#C9A9B8' },
  day: { stops: ['#8EC0E8', '#C6E1F4', '#EEF6FB'], orb: '#FFFBEA', orbZ: 7.0, stars: false, lights: false, beam: 0.34, hills: '#9DB79F' },
  evening: { stops: ['#3E477F', '#B9738F', '#F3BB8F'], orb: '#FFF3D6', orbZ: 6.6, stars: true, lights: true, beam: 0, hills: '#7A6496' },
  night: { stops: ['#0D1330', '#1B2550', '#2C3A6E'], orb: '#E9ECF7', orbZ: 6.9, stars: true, lights: true, beam: 0, hills: '#2A2F55' },
}

/* ---------- seasons: a little decoration that changes through the year ---------- */

export function seasonOf(d = new Date()) {
  const m = d.getMonth() + 1, day = d.getDate(), md = m * 100 + day
  if (md >= 1201 || md <= 107) return 'winter'   // a small Christmas tree
  if (md >= 201 && md <= 215) return 'love'      // heart balloons for Valentine's
  if (md >= 301 && md <= 531) return 'spring'    // a cherry blossom branch
  if (md >= 601 && md <= 831) return 'summer'    // sunflowers
  if (md >= 915 && md <= 1130) return 'autumn'   // pumpkins and leaves
  return null
}
// a free place on the floor near the front of each room
const SEASON_SPOT = { cabin: [6.3, 9.1], observatory: [2.6, 9.6], seaside: [5.0, 9.4], pastel: [4.2, 9.3] }
const f1 = (n) => n.toFixed(1)

function seasonal(d, season, x, y, lights) {
  const b = P(x, y, 0)
  const [bx, by] = b
  const shadowAt = (rx, ry = rx * 0.42) => d.raw(`<ellipse cx="${f1(bx)}" cy="${f1(by + 1)}" rx="${rx}" ry="${f1(ry)}" fill="#3a2a22" opacity=".2" filter="url(#soft)"/>`)
  d.raw('<g class="season" pointer-events="none">')
  if (season === 'autumn') {
    shadowAt(22)
    const pumpkin = (cx, cy, r, c) => {
      d.raw(`<path d="M${f1(cx)},${f1(cy - r * 0.8)} q1,-4 3,-5" stroke="#6B4E2E" stroke-width="2" fill="none" stroke-linecap="round"/>`)
      ;[[-0.5, 0.55], [0.5, 0.55], [0, 0.62]].forEach(([dx, w], i) => d.raw(`<ellipse cx="${f1(cx + dx * r)}" cy="${f1(cy)}" rx="${f1(r * w)}" ry="${f1(r * 0.78)}" fill="${i === 2 ? shade(c, 0.08) : shade(c, -0.1)}"/>`))
      d.raw(`<ellipse cx="${f1(cx - r * 0.2)}" cy="${f1(cy - r * 0.35)}" rx="${f1(r * 0.18)}" ry="${f1(r * 0.3)}" fill="#FFF" opacity=".18"/>`)
      d.raw(`<path d="M${f1(cx + 2)},${f1(cy - r * 0.85)} q6,-5 9,-1 q-5,3 -9,1z" fill="#7C9A55"/>`)
    }
    pumpkin(bx - 8, by - 6, 9, '#E58A3C')
    pumpkin(bx + 9, by - 4, 6.5, '#EFB25A')
    pumpkin(bx + 1, by + 1, 5, '#D9703A')
    ;[[-20, 3, '#D9703A', 20], [17, 4, '#C9A23B', -30], [-2, 7, '#B65A3A', 60]].forEach(([dx, dy, c, r]) => d.raw(`<path transform="translate(${f1(bx + dx)},${f1(by + dy)}) rotate(${r})" d="M0,-3 q3,1 3,3 q-1,3 -3,3 q-2,-1 -3,-3 q1,-2 3,-3z" fill="${c}" opacity=".9"/>`))
  }
  if (season === 'winter') {
    shadowAt(22)
    // gifts are real little boxes on the floor
    d.box(x + 0.45, y - 1.1, 0, 0.7, 0.7, 0.55, '#E08AA0'); d.line([P(x + 0.8, y - 0.4, 0), P(x + 0.8, y - 0.4, 0.55), P(x + 0.8, y - 1.1, 0.55)], '#FFF4D6', 1.2)
    d.box(x - 1.0, y + 0.2, 0, 0.6, 0.6, 0.4, '#8FB7E0'); d.line([P(x - 0.7, y + 0.8, 0), P(x - 0.7, y + 0.8, 0.4), P(x - 0.7, y + 0.2, 0.4)], '#FFF4D6', 1.2)
    d.raw(`<path d="M${f1(bx - 7)},${f1(by)} h14 l-2,-9 h-10z" fill="#B5734A"/><rect x="${f1(bx - 2)}" y="${f1(by - 13)}" width="4" height="5" fill="#6B4E2E"/>`)
    const tiers = [[34, 13], [26, 11], [18, 10], [10, 9]]
    let top = by - 12
    tiers.forEach(([w, h], i) => {
      const c = ['#3E7A57', '#468A61', '#4F976B', '#5AA476'][i]
      d.raw(`<path d="M${f1(bx - w / 2)},${f1(top)} Q${f1(bx)},${f1(top + 4)} ${f1(bx + w / 2)},${f1(top)} L${f1(bx)},${f1(top - h - 6)}z" fill="${c}"/>`)
      top -= h
    })
    const bulbs = ['#FFE29A', '#F7A8B8', '#BFE0FF', '#FFFFFF']
    ;[[-12, -16], [8, -19], [-6, -26], [10, -30], [-4, -36], [5, -41], [-2, -48], [-13, -22], [13, -24]].forEach(([dx, dy], i) =>
      d.raw(`<circle class="twinkle" style="animation-delay:${(i % 4) * 0.4}s" cx="${f1(bx + dx)}" cy="${f1(by + dy)}" r="1.6" fill="${bulbs[i % 4]}"/>${lights ? `<circle cx="${f1(bx + dx)}" cy="${f1(by + dy)}" r="4" fill="${bulbs[i % 4]}" opacity=".25"/>` : ''}`))
    d.raw(`<path transform="translate(${f1(bx)},${f1(top - 6)})" d="M0,-5 L1.5,-1.5 L5,-1.5 L2.2,0.8 L3.2,4.5 L0,2.3 L-3.2,4.5 L-2.2,0.8 L-5,-1.5 L-1.5,-1.5z" fill="#F6C46B"/>`)
  }
  if (season === 'love') {
    shadowAt(8)
    d.raw(`<rect x="${f1(bx - 4)}" y="${f1(by - 5)}" width="8" height="6" rx="2" fill="#B7A3C9"/>`)
    const heart = (cx, cy, s, c) => `<path transform="translate(${f1(cx)},${f1(cy)}) scale(${s})" d="M0,4 C-7,-1 -6,-7 -2.5,-7 C-1,-7 0,-6 0,-5 C0,-6 1,-7 2.5,-7 C6,-7 7,-1 0,4z" fill="${c}"/><path transform="translate(${f1(cx)},${f1(cy)}) scale(${s})" d="M-3.5,-5 q-1.5,1 -1,3" stroke="#FFF" stroke-width=".8" fill="none" opacity=".6" stroke-linecap="round"/>`
    ;[[-10, -62, '#EDA0B4', 1.6], [6, -70, '#E57A95', 1.8], [14, -54, '#F7C6D3', 1.4]].forEach(([dx, dy, c, sc], i) => {
      d.raw(`<path d="M${f1(bx)},${f1(by - 5)} Q${f1(bx + dx * 0.3)},${f1(by + dy / 2)} ${f1(bx + dx)},${f1(by + dy + 6 * sc)}" stroke="#9A8AAE" stroke-width=".6" fill="none"/>`)
      d.raw(`<g class="balloon" style="animation-delay:${i * 0.7}s">${heart(bx + dx, by + dy, sc, c)}</g>`)
    })
  }
  if (season === 'spring' || season === 'summer') {
    shadowAt(10)
    d.raw(`<path d="M${f1(bx - 6)},${f1(by)} q-3,-10 0,-20 h12 q3,10 0,20z" fill="${season === 'spring' ? '#E9E2F2' : '#8FB7E0'}"/><ellipse cx="${f1(bx)}" cy="${f1(by - 20)}" rx="6" ry="1.6" fill="${season === 'spring' ? '#D6CBE3' : '#6F9CC9'}"/>`)
    if (season === 'spring') {
      const br = [[0, -20, -14, -48], [0, -20, 12, -52], [-6, -36, -18, -40], [6, -38, 20, -40], [0, -20, 2, -58]]
      br.forEach(([x0, y0, x1, y1]) => d.raw(`<path d="M${f1(bx + x0)},${f1(by + y0)} Q${f1(bx + (x0 + x1) / 2 + 3)},${f1(by + (y0 + y1) / 2)} ${f1(bx + x1)},${f1(by + y1)}" stroke="#6B4E3E" stroke-width="1.3" fill="none" stroke-linecap="round"/>`))
      let r = 5
      const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647
      br.forEach(([x0, y0, x1, y1]) => { for (let i = 0; i < 6; i++) { const t = 0.35 + rnd() * 0.7, px = bx + x0 + (x1 - x0) * t + (rnd() - 0.5) * 5, py = by + y0 + (y1 - y0) * t + (rnd() - 0.5) * 4; d.raw(`<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(1.8 + rnd() * 1.4)}" fill="${rnd() < 0.5 ? '#F7C6D3' : '#FBDDE6'}"/><circle cx="${f1(px)}" cy="${f1(py)}" r=".6" fill="#E57A95"/>`) } })
      ;[[-22, 2], [16, 4]].forEach(([dx, dy]) => d.raw(`<ellipse cx="${f1(bx + dx)}" cy="${f1(by + dy)}" rx="2" ry="1.2" fill="#F7C6D3" opacity=".9"/>`))
    } else {
      ;[[-10, -50], [9, -54], [0, -62]].forEach(([dx, dy]) => {
        d.raw(`<path d="M${f1(bx)},${f1(by - 20)} Q${f1(bx + dx * 0.4)},${f1(by + dy / 2)} ${f1(bx + dx)},${f1(by + dy)}" stroke="#5E8C4E" stroke-width="1.4" fill="none"/>`)
        for (let i = 0; i < 12; i++) { const a = (Math.PI * 2 * i) / 12; d.raw(`<ellipse transform="translate(${f1(bx + dx + Math.cos(a) * 4.5)},${f1(by + dy + Math.sin(a) * 4.5)}) rotate(${(a * 180) / Math.PI})" rx="3" ry="1.4" fill="#F2C443"/>`) }
        d.raw(`<circle cx="${f1(bx + dx)}" cy="${f1(by + dy)}" r="3.4" fill="#7A5230"/>`)
      })
      d.raw(`<path d="M${f1(bx - 2)},${f1(by - 32)} q-8,-2 -10,4 q6,1 10,-4z M${f1(bx + 2)},${f1(by - 36)} q8,-3 10,3 q-6,2 -10,-3z" fill="#6FA287"/>`)
    }
  }
  d.raw('</g>')
}

/* ---------- real weather in the window ---------- */

// kind: clear | partly | cloudy | fog | rain | storm | snow
const GREY = { partly: 0.15, cloudy: 0.45, fog: 0.55, rain: 0.55, storm: 0.7, snow: 0.35 }
function mix(a, b, t) {
  const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
  const x = h(a), y = h(b)
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')
}
function weatherSky(sky, w) {
  const g = w && GREY[w.kind]
  if (!g) return sky
  const night = sky.lights
  const to = night ? '#30344A' : '#B9BFCB'
  return {
    ...sky,
    stops: sky.stops.map((c) => mix(c, to, g)),
    orb: w.kind === 'partly' ? sky.orb : 'transparent',
    stars: sky.stars && w.kind === 'partly',
    beam: (sky.beam || 0) * (1 - g),
  }
}
let wseq = 0
function skyWeather(d, ps) {
  const w = d.weather, kind = w.kind
  if (!GREY[kind]) return
  const sp = ps.map((p) => P(...p))
  const xs = sp.map((p) => p[0]), ys = sp.map((p) => p[1])
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
  const W = x1 - x0, H = y1 - y0
  let r = 11
  const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647
  const id = 'wx' + ++wseq
  const clip = `<clipPath id="${id}"><polygon points="${sp.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')}"/></clipPath>`
  const night = d.weatherNight
  // clouds
  const cc = kind === 'partly' ? (night ? '#7A819C' : '#FFFFFF') : kind === 'snow' ? (night ? '#6B7189' : '#EEF0F4') : (night ? '#545A72' : '#D9DDE4')
  const nClouds = kind === 'partly' ? 2 : 4
  let clouds = ''
  for (let i = 0; i < nClouds; i++) {
    const cx = x0 + W * (0.15 + 0.75 * rnd()), cy = y0 + H * (0.12 + 0.3 * rnd()), s = 0.7 + rnd() * 0.6
    clouds += `<g class="cloud" style="animation-delay:${(-rnd() * 20).toFixed(1)}s"><ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(13 * s).toFixed(1)}" ry="${(5 * s).toFixed(1)}"/><ellipse cx="${(cx - 6 * s).toFixed(1)}" cy="${(cy - 3 * s).toFixed(1)}" rx="${(7 * s).toFixed(1)}" ry="${(5 * s).toFixed(1)}"/><ellipse cx="${(cx + 5 * s).toFixed(1)}" cy="${(cy - 4 * s).toFixed(1)}" rx="${(8 * s).toFixed(1)}" ry="${(6 * s).toFixed(1)}"/></g>`
  }
  let back = `${clip}<g clip-path="url(#${id})" pointer-events="none"><g fill="${cc}" opacity="${kind === 'partly' ? 0.9 : 0.85}">${clouds}</g>`
  if (kind === 'fog') back += `<rect class="fog" x="${(x0 - 20).toFixed(1)}" y="${(y0 + H * 0.35).toFixed(1)}" width="${(W + 40).toFixed(1)}" height="${(H * 0.3).toFixed(1)}" fill="#F2F3F6" opacity=".55"/><rect class="fog fog2" x="${(x0 - 20).toFixed(1)}" y="${(y0 + H * 0.62).toFixed(1)}" width="${(W + 40).toFixed(1)}" height="${(H * 0.4).toFixed(1)}" fill="#F2F3F6" opacity=".7"/>`
  back += '</g>'
  d.raw(back)
  // rain or snow, in front of the view
  let front = ''
  const n = Math.round((W * H) / 70)
  if (kind === 'rain' || kind === 'storm') {
    let lines = ''
    for (let i = 0; i < n; i++) lines += `<path d="M${(x0 + rnd() * (W + 10)).toFixed(1)},${(y0 - 10 + rnd() * (H + 10)).toFixed(1)} l-1.3,6.5"/>`
    front += `<g class="rain" stroke="${night ? '#AFC0E6' : '#FFFFFF'}" stroke-width=".7" opacity=".8" stroke-linecap="round">${lines}</g><g class="rain rain2" stroke="${night ? '#AFC0E6' : '#FFFFFF'}" stroke-width=".7" opacity=".8" stroke-linecap="round">${lines}</g>`
    if (kind === 'storm') front += `<rect class="flash" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${W.toFixed(1)}" height="${H.toFixed(1)}" fill="#FFFFFF"/>`
  }
  if (kind === 'snow') {
    for (let i = 0; i < n * 0.7; i++) front += `<circle class="snow" style="animation-delay:${(-rnd() * 4).toFixed(2)}s;animation-duration:${(3 + rnd() * 2).toFixed(1)}s" cx="${(x0 + rnd() * W).toFixed(1)}" cy="${(y0 + rnd() * H).toFixed(1)}" r="${(0.7 + rnd() * 0.9).toFixed(1)}" fill="#FFFFFF"/>`
  }
  if (front) d.pending = `<g clip-path="url(#${id})" pointer-events="none">${front}</g>`
}

/* ---------- the room ---------- */

// the books on the shelf: their colours and covers, and where each one is drawn (for the little label on hover)
let SHELF = { list: [], spots: [] }
const bookAt = (i, fallback) => SHELF.list[i]?.color || fallback
const noteBook = (i, corners) => { if (SHELF.list[i]) SHELF.spots.push({ id: SHELF.list[i].id, ...bounds(corners, 0) }) }
const BOOK_COLORS = ['#8E7CC3', '#E99AAE', '#7DB4A1', '#E5C36B', '#7FA3C8', '#D98F72', '#B9A3D6', '#93BFAE', '#C9788C', '#6F97C2']


/* ---------- the mood jar: one marble for every day you told how you feel this month ---------- */

function moodJar(S, x, y, z) {
  const { d, spots, moods = [] } = S
  const b = P(x, y, z)
  const w = 9, h = 17
  d.raw(`<ellipse cx="${b[0].toFixed(1)}" cy="${(b[1] + 0.5).toFixed(1)}" rx="${w}" ry="3" fill="#000" opacity=".12"/>`)
  // marbles fill the jar from the bottom
  const per = 4, r = 2.1
  moods.slice(0, 32).forEach((c, i) => {
    const row = Math.floor(i / per), col = i % per
    const mx = b[0] - w + 2.8 + col * 4.1 + (row % 2) * 1.6, my = b[1] - 2.4 - row * 2.1
    if (my < b[1] - h + 3) return
    d.raw(`<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${r}" fill="${c}"/><circle cx="${(mx - 0.7).toFixed(1)}" cy="${(my - 0.7).toFixed(1)}" r=".6" fill="#fff" opacity=".7"/>`)
  })
  // the glass, a lid and a ribbon
  d.raw(`<path d="M${b[0] - w},${b[1] - 2} Q${b[0] - w - 1},${b[1] - h + 2} ${b[0] - w + 2},${b[1] - h} H${b[0] + w - 2} Q${b[0] + w + 1},${b[1] - h + 2} ${b[0] + w},${b[1] - 2} Q${b[0]},${b[1] + 2.5} ${b[0] - w},${b[1] - 2} Z" fill="#DDEBF4" fill-opacity=".35" stroke="#FFFFFF" stroke-opacity=".8" stroke-width=".8"/>`)
  d.raw(`<path d="M${b[0] - w + 3},${b[1] - h + 3} q-1.5,6 0,11" stroke="#fff" stroke-width="1.2" opacity=".7" fill="none"/>`)
  d.raw(`<rect x="${b[0] - w + 1.6}" y="${b[1] - h - 2.6}" width="${(w - 1.6) * 2}" height="3.2" rx="1.2" fill="#C9A26E"/><path d="M${b[0] - 2},${b[1] - h + 1} l-2,4 M${b[0] + 2},${b[1] - h + 1} l2,4" stroke="#E07A8F" stroke-width="1.2"/>`)
  spots.jar = screenSpot(b[0] - w - 3, b[1] - h - 5, w * 2 + 6, h + 8)
}

/* ---------- the memory chest: a small wooden trunk that glows when there are memories inside ---------- */

function memoryChest(S, x, y) {
  const { d, spots, memories } = S
  const wood = '#9A6A44', band = '#C9A26E'
  d.shadow(x - 0.1, y - 0.1, x + 1.4, y + 0.95, 0.16)
  d.box(x, y, 0, 1.3, 0.85, 0.7, [shade(wood, 0.15), wood, shade(wood, -0.14)])
  // the rounded lid
  const lid = []
  for (let i = 0; i <= 8; i++) { const a = Math.PI * (i / 8); lid.push([x, y + 0.425 - 0.425 * Math.cos(a), 0.7 + 0.32 * Math.sin(a)]) }
  d.poly([...lid.map(([, yy, z]) => [x + 1.3, yy, z])], shade(wood, -0.18))
  d.poly([[x, y + 0.85, 0.7], [x + 1.3, y + 0.85, 0.7], ...lid.slice().reverse().map(([, yy, z]) => [x + 1.3, yy, z]).slice(0, 1), [x, y + 0.85, 0.7]], wood)
  for (let i = 0; i < 8; i++) d.poly([[x, lid[i][1], lid[i][2]], [x + 1.3, lid[i][1], lid[i][2]], [x + 1.3, lid[i + 1][1], lid[i + 1][2]], [x, lid[i + 1][1], lid[i + 1][2]]], shade(wood, 0.05 + 0.02 * Math.sin((i / 8) * Math.PI)))
  ;[0.22, 1.08].forEach((dx) => { d.poly([[x + dx, y + 0.86, 0], [x + dx + 0.1, y + 0.86, 0], [x + dx + 0.1, y + 0.86, 0.7], [x + dx, y + 0.86, 0.7]], band); d.line(lid.map(([, yy, z]) => [x + dx + 0.05, yy, z + 0.01]), band, 1.6) })
  const lock = P(x + 0.65, y + 0.87, 0.55)
  d.raw(`<path d="M${lock[0] - 2.6},${lock[1] - 1} q2.6,-3 5.2,0 v3 h-5.2z" fill="${band}"/><text x="${lock[0]}" y="${(lock[1] + 1.4).toFixed(1)}" font-size="3" fill="#B4475D" text-anchor="middle">♥</text>`)
  if (memories > 0) {
    const g = P(x + 0.65, y + 0.42, 1.05)
    d.raw(`<circle cx="${g[0].toFixed(1)}" cy="${g[1].toFixed(1)}" r="14" fill="url(#halo)" opacity=".8"/>`)
  }
  spots.chest = bounds([[x, y, 0], [x + 1.3, y, 0], [x + 1.3, y + 0.85, 0], [x, y + 0.85, 0], [x, y + 0.42, 1.05]], 3)
}

/* ---------- your own photo as the view out of a window (on the right wall) ---------- */

function wallImage(d, u0, u1, z0, z1, src) {
  const id = 'wi' + ++softN
  const y = 0.035
  const tl = P(u0, y, z1), tr = P(u1, y, z1), bl = P(u0, y, z0)
  const asp = (u1 - u0) / (z1 - z0)
  d.raw(`<clipPath id="${id}"><polygon points="${pts([[u0, y, z0], [u1, y, z0], [u1, y, z1], [u0, y, z1]])}"/></clipPath>`)
  d.raw(`<g clip-path="url(#${id})"><image href="${src}" x="0" y="0" width="${asp.toFixed(3)}" height="1" preserveAspectRatio="xMidYMid slice" transform="matrix(${((tr[0] - tl[0]) / asp).toFixed(3)} ${((tr[1] - tl[1]) / asp).toFixed(3)} ${(bl[0] - tl[0]).toFixed(3)} ${(bl[1] - tl[1]).toFixed(3)} ${tl[0].toFixed(2)} ${tl[1].toFixed(2)})"/></g>`)
  // a soft reflection so it still feels like glass
  d.poly([[u0, y + 0.002, z0], [u0 + (u1 - u0) * 0.35, y + 0.002, z1], [u0 + (u1 - u0) * 0.5, y + 0.002, z1], [u0 + (u1 - u0) * 0.15, y + 0.002, z0]], '#FFFFFF', ' opacity=".12"')
}

/* ---------- the live pet: where it is depends on the time of day ---------- */

const screenSpot = (x, y, w, h) => ({ l: ((x - VB.x) / VB.w) * 100, t: ((y - VB.y) / VB.h) * 100, w: (w / VB.w) * 100, h: (h / VB.h) * 100 })
// places: bed = [x, y, z] on the bed, floor = [x, y] on the rug, sill = [x, y, z] by a window (cats only)
function livePet(S, { bed, floor, sill }) {
  const { d, room, spots, tod } = S
  if (room.pet !== 'cat' && room.pet !== 'dog') return
  const c = PET_COLORS[room.petColor] || PET_COLORS[room.pet === 'dog' ? 'golden' : 'black']
  let where = tod === 'evening' ? 'floor' : tod === 'morning' ? (room.pet === 'cat' && sill ? 'sill' : 'floor') : 'bed'
  if (where === 'floor' && !floor) where = 'bed'
  d.raw('<g class="pet-g">')
  if (where === 'sill') {
    const at = P(...sill)
    d.raw(sittingCat(c, at[0], at[1]))
    spots.pet = screenSpot(at[0] - 12, at[1] - 32, 24, 34)
  } else {
    const at = where === 'bed' ? P(...bed) : P(floor[0], floor[1], 0.02)
    if (where === 'floor') d.raw(`<ellipse cx="${at[0].toFixed(1)}" cy="${(at[1] + 1).toFixed(1)}" rx="20" ry="6" fill="#3a2a22" opacity=".18" filter="url(#soft)"/>`)
    d.raw(pet(room.pet, c, at[0] - 21, at[1] - 21, 0.42))
    spots.pet = screenSpot(at[0] - 22, at[1] - 22, 44, 28)
  }
  d.raw('</g>')
}

/* ---------- the pet: drawn in detail, then scaled down onto the bed ---------- */

export const PET_COLORS = {
  black: { name: 'Black', base: '#3B3646', light: '#5E5770', dark: '#211E29', muzzle: '#4D465A', stripes: false },
  ginger: { name: 'Ginger', base: '#E09A58', light: '#F4C38D', dark: '#B4692F', muzzle: '#F7DDBE', stripes: true },
  grey: { name: 'Grey', base: '#9C9AA8', light: '#C4C2CD', dark: '#6C6A79', muzzle: '#DCDAE2', stripes: true },
  white: { name: 'White', base: '#F1EDE8', light: '#FFFFFF', dark: '#CFC7C0', muzzle: '#FFFFFF', stripes: false },
  brown: { name: 'Brown', base: '#8D6446', light: '#B48A66', dark: '#5E4029', muzzle: '#D9BC9C', stripes: false },
  golden: { name: 'Golden', base: '#D9A862', light: '#F0CD93', dark: '#A97A3C', muzzle: '#F6E3C2', stripes: false },
}

// a cat sitting with its back to us, looking out of the window
function sittingCat(c, x, y) {
  const id = 'sc' + ++petN
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(.36)">
    <defs><radialGradient id="${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${c.light}"/><stop offset=".6" stop-color="${c.base}"/><stop offset="1" stop-color="${c.dark}"/></radialGradient></defs>
    <ellipse cx="0" cy="0" rx="26" ry="6" fill="#000" opacity=".25"/>
    <path d="M14,-2 C34,0 38,-14 28,-20" stroke="${c.dark}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M-20,0 C-24,-22 -16,-44 0,-46 C16,-44 24,-22 20,0 Z" fill="url(#${id})"/>
    <ellipse cx="0" cy="-56" rx="14" ry="12.5" fill="url(#${id})"/>
    <path d="M-12,-62 L-12,-80 L-2,-67 Z M12,-62 L12,-80 L2,-67 Z" fill="${c.base}"/>
    <path d="M-10,-64 L-10,-75 L-4,-67 Z M10,-64 L10,-75 L4,-67 Z" fill="${c.dark}" opacity=".6"/>
    <path d="M-8,-30 C-4,-38 4,-38 8,-30" stroke="${c.light}" stroke-width="3" fill="none" opacity=".3"/>
  </g>`
}

let petN = 0
function pet(kind, c, x, y, k) {
  const id = 'pet' + ++petN
  const g = `<defs>
    <radialGradient id="${id}b" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${c.light}"/><stop offset=".55" stop-color="${c.base}"/><stop offset="1" stop-color="${c.dark}"/></radialGradient>
    <radialGradient id="${id}h" cx=".4" cy=".3" r=".75"><stop offset="0" stop-color="${c.light}"/><stop offset=".6" stop-color="${c.base}"/><stop offset="1" stop-color="${c.dark}"/></radialGradient>
    <linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.dark}"/><stop offset=".7" stop-color="${c.base}"/><stop offset="1" stop-color="${c.light}"/></linearGradient>
  </defs>`
  const eye = (ex, ey) => `<path d="M${ex - 3.6},${ey} q3.6,2.6 7.2,0" stroke="${c === PET_COLORS.black ? '#15121B' : '#3A2E2A'}" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M${ex - 3.4},${ey + .2} l-1.2,.9 M${ex + 3.4},${ey + .2} l1.2,.9" stroke="#3A2E2A" stroke-width=".6" stroke-linecap="round" opacity=".6"/>`
  let body
  if (kind === 'cat') {
    const stripes = c.stripes ? `<g stroke="${c.dark}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".38">
      <path d="M56,13 q4,7 1,14"/><path d="M66,14 q4,8 1,16"/><path d="M76,18 q3,8 -1,15"/><path d="M84,25 q1,7 -3,12"/><path d="M47,15 q3,6 1,11"/></g>` : ''
    body = `
      <ellipse cx="54" cy="55" rx="46" ry="9" fill="#2a1f3a" opacity=".22" filter="url(#soft)"/>
      <path d="M22,42 C14,24 34,8 58,9 C84,10 98,26 92,42 C87,54 64,58 44,56 C30,55 24,50 22,42Z" fill="url(#${id}b)"/>
      ${stripes}
      <path d="M40,18 C52,11 72,11 84,20" stroke="${c.light}" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="M90,36 C100,50 76,62 48,59 C34,58 24,54 21,49" stroke="url(#${id}t)" stroke-width="9" fill="none" stroke-linecap="round"/>
      ${c.stripes ? `<path d="M80,52 l2,5 M70,56 l1,5 M60,57 l0,5" stroke="${c.dark}" stroke-width="2.6" opacity=".4" stroke-linecap="round"/>` : ''}
      <ellipse cx="44" cy="50" rx="7" ry="4.2" fill="${c.light}"/><ellipse cx="54" cy="52" rx="6.5" ry="4" fill="${c.base}"/>
      <path d="M14,27 L15,7 L27,20 Z" fill="${c.base}"/><path d="M17,22 L17.5,12 L24,19 Z" fill="#E9A7B2" opacity=".85"/>
      <path d="M33,19 L44,6 L45,26 Z" fill="${c.base}"/><path d="M36,20 L42,12 L42.5,23 Z" fill="#E9A7B2" opacity=".85"/>
      <ellipse cx="29" cy="35" rx="17" ry="15" fill="url(#${id}h)"/>
      ${c.stripes ? `<path d="M26,21 l1,6 M31,20 l0,6 M36,22 l-1,5" stroke="${c.dark}" stroke-width="2" opacity=".45" stroke-linecap="round"/>` : ''}
      <ellipse cx="28" cy="42" rx="8" ry="5.5" fill="${c.muzzle}" opacity=".85"/>
      ${eye(21, 34)}${eye(36, 33.5)}
      <path d="M26.3,39.5 h3.6 l-1.8,2.2 z" fill="#D9838F"/>
      <path d="M28.1,41.7 q-1.6,2.2 -3.6,1.6 M28.1,41.7 q1.6,2.2 3.6,1.6" stroke="#3A2E2A" stroke-width=".7" fill="none" stroke-linecap="round"/>
      <g stroke="${c === PET_COLORS.white ? '#B9B1AA' : '#FFFFFF'}" stroke-width=".5" opacity=".75" stroke-linecap="round"><path d="M21,42 l-13,-2 M21,43.5 l-12,2 M35,42 l13,-2 M35,43.5 l12,2"/></g>`
  } else {
    body = `
      <ellipse cx="54" cy="56" rx="48" ry="9" fill="#2a1f3a" opacity=".22" filter="url(#soft)"/>
      <path d="M24,42 C16,22 38,6 62,8 C88,10 101,28 94,44 C88,56 64,60 46,58 C32,57 26,51 24,42Z" fill="url(#${id}b)"/>
      <path d="M44,17 C56,10 76,11 88,21" stroke="${c.light}" stroke-width="3.4" fill="none" opacity=".4" stroke-linecap="round"/>
      <path d="M93,38 C103,38 104,50 94,52" stroke="url(#${id}t)" stroke-width="8" fill="none" stroke-linecap="round"/>
      <ellipse cx="46" cy="52" rx="8" ry="4.6" fill="${c.light}"/><ellipse cx="57" cy="54" rx="7" ry="4.3" fill="${c.base}"/>
      <ellipse cx="31" cy="33" rx="17" ry="15" fill="url(#${id}h)"/>
      <ellipse cx="17" cy="40" rx="11" ry="7.5" fill="${c.muzzle}"/>
      <ellipse cx="17" cy="38.5" rx="9" ry="4.5" fill="${c.light}" opacity=".5"/>
      <ellipse cx="9.5" cy="38.5" rx="3.3" ry="2.6" fill="#231C22"/><ellipse cx="8.6" cy="37.6" rx="1" ry=".6" fill="#FFF" opacity=".6"/>
      <path d="M10,42.5 q4,3.4 10,1" stroke="#3A2E2A" stroke-width=".8" fill="none" stroke-linecap="round"/>
      ${eye(25, 30)}
      <path d="M34,20 C46,17 52,30 46,44 C43,48 37,46 36,40 C35,32 33,26 34,20Z" fill="${c.dark}"/>
      <path d="M36,23 C44,22 47,31 43,40" stroke="${c.base}" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round"/>`
  }
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k})">${g}${body}</g>`
}

/* ---------- a big leafy plant in a ceramic pot ---------- */

function plant(d, x, y, leaves) {
  const base = P(x, y, 0)
  d.raw(`<ellipse cx="${base[0].toFixed(1)}" cy="${(base[1] + 1).toFixed(1)}" rx="15" ry="5.5" fill="#3a2a22" opacity=".22" filter="url(#soft)"/>`)
  // pot: a slightly tapered ceramic pot with a rim
  const top = P(x, y, 1.25)
  const [px, py] = base, ty = top[1]
  d.raw(`<defs><linearGradient id="potg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EDE6DF"/><stop offset=".55" stop-color="#F8F4EF"/><stop offset="1" stop-color="#D9CFC6"/></linearGradient>
    <linearGradient id="leafg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8CC49E"/><stop offset="1" stop-color="#4F8A67"/></linearGradient>
    <linearGradient id="leafd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6FAA84"/><stop offset="1" stop-color="#3E7356"/></linearGradient></defs>`)
  d.raw(`<path d="M${px - 9.5},${ty} L${px - 7.5},${py - 1} Q${px},${py + 3} ${px + 7.5},${py - 1} L${px + 9.5},${ty} Z" fill="url(#potg)"/>`)
  d.raw(`<path d="M${px - 9.5},${ty + 3.2} Q${px},${ty + 7.5} ${px + 9.5},${ty + 3.2}" stroke="#C9A98E" stroke-width="1.4" fill="none" opacity=".7"/>`)
  d.raw(`<ellipse cx="${px}" cy="${ty}" rx="10.2" ry="3.6" fill="#E6DDD3"/><ellipse cx="${px}" cy="${ty + .4}" rx="8.6" ry="2.7" fill="#6B4E3A"/>`)
  // leaves: wide, pointed leaves on thin stems, the newest ones on top
  const L = [
    [-24, -26, 13, 0], [22, -28, 12, 1], [-10, -40, 13, 1], [12, -44, 12, 0], [-28, -46, 11, 1], [27, -50, 11, 0],
    [0, -56, 12, 0], [-17, -60, 10, 1], [16, -64, 10, 1], [2, -72, 10, 0],
  ].slice(0, Math.max(5, Math.min(leaves + 2, 10)))
  const sx = px, sy = ty - 1
  L.forEach(([lx, ly, w, dk]) => {
    const tx = px + lx, tyy = ty + ly
    const bx = sx + lx * 0.45, by = sy + ly * 0.42
    d.raw(`<path d="M${sx},${sy} Q${sx + lx * 0.15},${sy + ly * 0.3} ${bx.toFixed(1)},${by.toFixed(1)}" stroke="#5E8F6E" stroke-width="1" fill="none"/>`)
    const ang = Math.atan2(tyy - by, tx - bx), nx = -Math.sin(ang) * w * 0.55, ny = Math.cos(ang) * w * 0.55
    const mx = (bx + tx) / 2, my = (by + tyy) / 2
    d.raw(`<path d="M${bx.toFixed(1)},${by.toFixed(1)} Q${(mx + nx).toFixed(1)},${(my + ny).toFixed(1)} ${tx.toFixed(1)},${tyy.toFixed(1)} Q${(mx - nx).toFixed(1)},${(my - ny).toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)} Z" fill="url(#${dk ? 'leafd' : 'leafg'})"/>`)
    d.raw(`<path d="M${bx.toFixed(1)},${by.toFixed(1)} Q${(mx + nx * 0.15).toFixed(1)},${(my + ny * 0.15).toFixed(1)} ${tx.toFixed(1)},${tyy.toFixed(1)}" stroke="#D6EBD9" stroke-width=".6" fill="none" opacity=".7"/>`)
  })
}


/* ---------- soft shapes: rounded mattresses, puffy pillows, draped blankets ---------- */

let softN = 0
const fmt = (ps) => ps.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')
// the outline of a rounded rectangle on the floor plan (x, y), going round
function roundRect(x0, y0, dx, dy, r, n = 6) {
  r = Math.min(r, dx / 2, dy / 2)
  const out = []
  const arc = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (Math.PI / 2) * (i / n); out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]) } }
  arc(x0 + dx - r, y0 + dy - r, 0)          // near corner
  arc(x0 + r, y0 + dy - r, Math.PI / 2)     // left corner
  arc(x0 + r, y0 + r, Math.PI)              // far corner
  arc(x0 + dx - r, y0 + r, Math.PI * 1.5)   // right corner
  return out
}
// a box with rounded corners and soft top edges, shaded from the front (left) to the side (right)
function soft(d, x0, y0, z0, dx, dy, dz, [top, front, side], r = 0.3, puff = 0) {
  const id = 'sf' + ++softN
  const ring = roundRect(x0, y0, dx, dy, r)
  const lo = ring.map(([x, y]) => P(x, y, z0))
  const hi = ring.map(([x, y]) => P(x, y, z0 + dz - Math.min(r * 0.5, dz * 0.35)))
  const xs = lo.map((p) => p[0])
  const L = xs.indexOf(Math.min(...xs)), R = xs.indexOf(Math.max(...xs))
  // walk from the leftmost point through the near corner to the rightmost point
  const chain = []
  for (let i = L; ; i = (i - 1 + ring.length) % ring.length) { chain.push(i); if (i === R) break }
  const wall = [...chain.map((i) => hi[i]), ...chain.slice().reverse().map((i) => lo[i])]
  const corner = P(x0 + dx, y0 + dy, z0)[0]
  const t = (corner - xs[L]) / Math.max(1, xs[R] - xs[L])
  d.raw(`<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${xs[L].toFixed(1)}" y1="0" x2="${xs[R].toFixed(1)}" y2="0">
    <stop offset="0" stop-color="${shade(front, 0.04)}"/><stop offset="${Math.max(0, t - 0.08).toFixed(2)}" stop-color="${front}"/>
    <stop offset="${Math.min(1, t + 0.08).toFixed(2)}" stop-color="${side}"/><stop offset="1" stop-color="${shade(side, -0.05)}"/></linearGradient>
    <radialGradient id="${id}t" cx=".42" cy=".4" r=".7"><stop offset="0" stop-color="${shade(top, puff ? 0.25 : 0.08)}"/><stop offset="1" stop-color="${top}"/></radialGradient></defs>`)
  d.raw(`<polygon points="${fmt(wall)}" fill="url(#${id})"/>`)
  // the top, a little smaller so the edge looks rounded
  const k = Math.min(r * 0.55, dx * 0.2, dy * 0.2)
  const topRing = roundRect(x0 + k * 0.5, y0 + k * 0.5, dx - k, dy - k, Math.max(0.05, r - k * 0.5)).map(([x, y]) => P(x, y, z0 + dz))
  d.raw(`<polygon points="${fmt(hi)}" fill="${shade(top, -0.02)}"/>`)
  d.raw(`<polygon points="${fmt(topRing)}" fill="url(#${id}t)"/>`)
  if (puff) {
    const c = P(x0 + dx / 2, y0 + dy / 2, z0 + dz)
    d.raw(`<ellipse cx="${c[0].toFixed(1)}" cy="${(c[1] - puff).toFixed(1)}" rx="${(dx * 5).toFixed(1)}" ry="${(dy * 2.2).toFixed(1)}" fill="#fff" opacity=".22"/>`)
  }
}
// a blanket lying on a mattress and hanging over its front and side, with a wavy hem
function duvet(d, x0, y0, x1, y1, z, drop, color) {
  const front = shade(color, -0.04), side = shade(color, -0.14)
  const wave = (a, b, n, f) => Array.from({ length: n + 1 }, (_, i) => f(a + ((b - a) * i) / n, i))
  // front hang (plane y = y1)
  d.poly([[x0, y1, z], [x1, y1, z], ...wave(x1, x0, 10, (x, i) => [x, y1 + 0.03, z - drop + (i % 2 ? 0.08 : -0.04)])], front)
  for (let i = 1; i < 6; i++) { const x = x0 + ((x1 - x0) * i) / 6; d.line([[x, y1 + 0.01, z - 0.05], [x + 0.05, y1 + 0.02, z - drop * 0.85]], shade(color, -0.1), 0.7, ' opacity=".6"') }
  // side hang (plane x = x1)
  d.poly([[x1, y0, z], [x1, y1, z], ...wave(y1, y0, 8, (y, i) => [x1 + 0.03, y, z - drop + (i % 2 ? 0.08 : -0.04)])], side)
  for (let i = 1; i < 4; i++) { const y = y0 + ((y1 - y0) * i) / 4; d.line([[x1 + 0.01, y, z - 0.05], [x1 + 0.02, y - 0.05, z - drop * 0.85]], shade(color, -0.2), 0.7, ' opacity=".5"') }
  // the top, slightly rounded at the near corner, with soft folds
  d.poly([[x0, y0, z], [x1, y0, z], [x1, y1 - 0.15, z], [x1 - 0.15, y1, z], [x0, y1, z]], shade(color, 0.06))
  ;[0.3, 0.62].forEach((t) => d.raw(`<path d="M${P(x0 + 0.2, y0 + (y1 - y0) * t, z)[0].toFixed(1)},${P(x0 + 0.2, y0 + (y1 - y0) * t, z)[1].toFixed(1)} Q${P((x0 + x1) / 2, y0 + (y1 - y0) * t + 0.25, z)[0].toFixed(1)},${P((x0 + x1) / 2, y0 + (y1 - y0) * t + 0.25, z)[1].toFixed(1)} ${P(x1 - 0.2, y0 + (y1 - y0) * t, z)[0].toFixed(1)},${P(x1 - 0.2, y0 + (y1 - y0) * t, z)[1].toFixed(1)}" stroke="${shade(color, -0.12)}" stroke-width=".9" fill="none" opacity=".55"/>`))
  // the folded top edge of the blanket near the pillows
  soft(d, x0 - 0.02, y0 - 0.05, z - 0.02, x1 - x0 + 0.04, 0.45, 0.14, ['#FFFFFF', '#F2EDF6', '#E5DDEE'], 0.12)
}
// an upholstered headboard with a rounded top, standing on the floor at y = y
function headboard(d, x0, x1, y, h, color) {
  const pts3 = []
  pts3.push([x0, y, 0])
  const r = 0.55
  for (let i = 0; i <= 6; i++) { const a = Math.PI - (Math.PI / 2) * (i / 6); pts3.push([x0 + r + r * Math.cos(a), y, h - r + r * Math.sin(a)]) }
  for (let i = 0; i <= 6; i++) { const a = Math.PI / 2 - (Math.PI / 2) * (i / 6); pts3.push([x1 - r + r * Math.cos(a), y, h - r + r * Math.sin(a)]) }
  pts3.push([x1, y, 0])
  // thickness: the same outline a bit further back, darker, then the front
  d.poly(pts3.map(([x, yy, z]) => [x + 0.05, yy - 0.3, z]), shade(color, -0.18))
  d.poly([[x1, y - 0.3, 0], [x1, y, 0], [x1, y, h - r], [x1, y - 0.3, h - r]], shade(color, -0.14))
  d.poly(pts3, color)
  // channel tufting
  for (let i = 1; i < 6; i++) { const x = x0 + ((x1 - x0) * i) / 6; d.line([[x, y + 0.01, 0.5], [x, y + 0.01, h - 0.25]], shade(color, -0.1), 0.9, ' opacity=".7"') }
  d.line(pts3.slice(1, -1).map(([x, yy, z]) => [x, yy + 0.01, z - 0.12]), shade(color, 0.2), 1.2, ' opacity=".8"')
}
// a comfortable round pouf with a puffy top and a button
function pouf(d, x, y, color) {
  const b = P(x, y, 0), t = P(x, y, 0.85)
  const id = 'pf' + ++softN
  d.raw(`<defs><radialGradient id="${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${shade(color, 0.22)}"/><stop offset=".7" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.15)}"/></radialGradient>
    <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="${shade(color, -0.02)}"/><stop offset=".6" stop-color="${shade(color, -0.1)}"/><stop offset="1" stop-color="${shade(color, -0.22)}"/></linearGradient></defs>`)
  d.raw(`<ellipse cx="${b[0].toFixed(1)}" cy="${(b[1] + 1).toFixed(1)}" rx="17" ry="7" fill="#3a2a22" opacity=".2" filter="url(#soft)"/>`)
  d.raw(`<path d="M${b[0] - 14},${t[1]} C${b[0] - 17},${(t[1] + b[1]) / 2} ${b[0] - 15},${b[1] - 1} ${b[0] - 11},${b[1] + 1} Q${b[0]},${b[1] + 7} ${b[0] + 11},${b[1] + 1} C${b[0] + 15},${b[1] - 1} ${b[0] + 17},${(t[1] + b[1]) / 2} ${b[0] + 14},${t[1]} Z" fill="url(#${id}s)"/>`)
  for (let i = -3; i <= 3; i++) d.raw(`<path d="M${b[0] + i * 4},${t[1] + 3} Q${b[0] + i * 4.6},${(t[1] + b[1]) / 2} ${b[0] + i * 4},${b[1] + 3 - Math.abs(i) * 0.6}" stroke="${shade(color, -0.18)}" stroke-width=".7" fill="none" opacity=".55"/>`)
  d.raw(`<ellipse cx="${t[0]}" cy="${t[1]}" rx="14.5" ry="7.5" fill="url(#${id})"/>`)
  for (let i = 0; i < 8; i++) { const a = (Math.PI * 2 * i) / 8; d.raw(`<path d="M${t[0]},${t[1]} L${(t[0] + 13 * Math.cos(a)).toFixed(1)},${(t[1] + 6.6 * Math.sin(a)).toFixed(1)}" stroke="${shade(color, -0.1)}" stroke-width=".6" opacity=".5"/>`) }
  d.raw(`<circle cx="${t[0]}" cy="${t[1]}" r="1.6" fill="${shade(color, -0.2)}"/>`)
}
// a round wall clock on the left wall showing the real time
function wallClock(d, y, z, now = new Date()) {
  const face = wallRing('left', y, z, 0.62, 0.62, 0.03)
  d.poly(wallRing('left', y, z, 0.78, 0.78, 0.02), '#B88D6C')
  d.poly(face, '#FFFDF8')
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12, r0 = i % 3 ? 0.5 : 0.44
    d.line([[0.04, y - r0 * Math.sin(a), z + r0 * Math.cos(a)], [0.04, y - 0.56 * Math.sin(a), z + 0.56 * Math.cos(a)]], '#6E6484', i % 3 ? 0.6 : 1.1)
  }
  const m = now.getMinutes(), h = (now.getHours() % 12) + m / 60
  const hand = (a, r, w) => d.line([[0.05, y, z], [0.05, y - r * Math.sin(a), z + r * Math.cos(a)]], '#3A3350', w, ' stroke-linecap="round"')
  hand((Math.PI * 2 * h) / 12, 0.3, 1.5)
  hand((Math.PI * 2 * m) / 60, 0.45, 1)
  const c = P(0.05, y, z)
  d.raw(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="1.1" fill="#C2556B"/>`)
}
// a book standing with its cover facing the room (towards +x); the cover picture is drawn on it if there is one
function faceOutBook(d, x, y0, y1, z0, z1, book) {
  d.box(x - 0.16, y0, z0, 0.16, y1 - y0, z1 - z0, [shade(book.color, 0.1), shade(book.color, -0.1), book.color])
  const tl = P(x, y1, z1), tr = P(x, y0, z1), bl = P(x, y1, z0)
  if (book.cover) {
    d.raw(`<image href="${book.cover}" x="0" y="0" width="1" height="1" preserveAspectRatio="none" transform="matrix(${(tr[0] - tl[0]).toFixed(2)} ${(tr[1] - tl[1]).toFixed(2)} ${(bl[0] - tl[0]).toFixed(2)} ${(bl[1] - tl[1]).toFixed(2)} ${tl[0].toFixed(2)} ${tl[1].toFixed(2)})"/>`)
  } else {
    d.poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], book.color)
    const t = P(x + 0.01, (y0 + y1) / 2, z1 - (z1 - z0) * 0.32)
    const words = (book.title || '').split(/\s+/).slice(0, 3)
    d.raw(`<text transform="translate(${t[0].toFixed(1)} ${t[1].toFixed(1)}) skewY(-30)" font-size="2.6" font-family="Fraunces, Georgia, serif" fill="#FFF" text-anchor="middle">${words.map((w, i) => `<tspan x="0" dy="${i ? 3 : 0}">${esc(w.slice(0, 12))}</tspan>`).join('')}</text>`)
  }
  d.line([[x + 0.01, y1, z0], [x + 0.01, y1, z1]], '#000', 0.6, ' opacity=".15"')
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

/* ---------- things many rooms share ---------- */

// a point on a wall: the right wall is y = 0 (u runs along x), the left wall is x = 0 (u runs along y)
const onWall = (side, u, z, off = 0.02) => (side === 'right' ? [u, off, z] : [off, u, z])
const wallRing = (side, cu, cz, ru, rz, off, n = 28) => Array.from({ length: n }, (_, i) => onWall(side, cu + ru * Math.cos((2 * Math.PI * i) / n), cz + rz * Math.sin((2 * Math.PI * i) / n), off))
const quad = (side, u0, u1, z0, z1, off) => [onWall(side, u0, z0, off), onWall(side, u1, z0, off), onWall(side, u1, z1, off), onWall(side, u0, z1, off)]

export const ART = {
  mountains: { name: 'Mountains' }, sea: { name: 'Sunset sea' }, flowers: { name: 'Flowers in a vase' },
  shapes: { name: 'Soft shapes' }, moon: { name: 'Moon and stars' }, cat: { name: 'Cat portrait' }, plants: { name: 'Pressed leaves' },
}

// a framed picture; along the wall it goes from u0 to u1 (left to right as you look at it)
function art(d, kind, side, u0, u1, z0, z1, frame = '#FFFFFF') {
  const o = 0.03
  const U = (t) => (side === 'right' ? u0 + (u1 - u0) * t : u1 - (u1 - u0) * t) // t = 0 is the left edge on screen
  const Z = (t) => z0 + (z1 - z0) * t
  const pt = (tu, tz, k = 0) => onWall(side, U(tu), Z(tz), o + k * 0.005)
  const poly = (ps, fill, k = 1, extra = '') => d.poly(ps.map(([a, b]) => pt(a, b, k)), fill, extra)
  const circle = (cu, cz, r, fill, k = 2) => {
    const ru = r / Math.abs(u1 - u0), rz = r / (z1 - z0)
    d.poly(Array.from({ length: 24 }, (_, i) => pt(cu + ru * Math.cos((2 * Math.PI * i) / 24), cz + rz * Math.sin((2 * Math.PI * i) / 24), k)), fill)
  }
  d.poly(quad(side, Math.min(u0, u1) - 0.2, Math.max(u0, u1) + 0.2, z0 - 0.2, z1 + 0.2, 0.02), shade(frame, -0.08))
  d.poly(quad(side, Math.min(u0, u1) - 0.12, Math.max(u0, u1) + 0.12, z0 - 0.12, z1 + 0.12, 0.025), frame)
  const bgs = { mountains: '#F3D9CB', sea: '#F7D3C4', flowers: '#F6EFE4', shapes: '#F2E6D8', moon: '#2C3566', cat: '#F4C7CF', plants: '#EEF0E3' }
  poly([[0, 0], [1, 0], [1, 1], [0, 1]], bgs[kind] || bgs.mountains, 0)
  if (kind === 'sea') {
    poly([[0, 0], [1, 0], [1, 0.45], [0, 0.45]], '#7FA9C9')
    poly([[0, 0.38], [1, 0.38], [1, 0.45], [0, 0.45]], '#A7C6DD')
    circle(0.5, 0.45, 0.45, '#F6B97A', 1)
    poly([[0, 0.45], [1, 0.45], [1, 0.47], [0, 0.47]], '#F7D3C4', 3)
    poly([[0, 0], [1, 0], [1, 0.45], [0, 0.45]], '#7FA9C9', 3)
    poly([[0.25, 0.3], [0.75, 0.3], [0.7, 0.33], [0.3, 0.33]], '#F6CFA0', 4)
  } else if (kind === 'flowers') {
    poly([[0.38, 0.08], [0.62, 0.08], [0.66, 0.42], [0.34, 0.42]], '#9DB6D6')
    poly([[0.48, 0.42], [0.52, 0.42], [0.52, 0.72], [0.48, 0.72]], '#6FA287')
    ;[[0.3, 0.7], [0.5, 0.82], [0.7, 0.68], [0.4, 0.6], [0.62, 0.58]].forEach(([u, z], i) => circle(u, z, 0.22, ['#E99AAE', '#F2C46B', '#F4B7C8', '#FFFFFF', '#E99AAE'][i], 3))
  } else if (kind === 'shapes') {
    circle(0.32, 0.62, 0.45, '#D98F72')
    poly([[0.5, 0.1], [0.9, 0.1], [0.9, 0.5], [0.5, 0.5]], '#A7C6AE', 3)
    circle(0.7, 0.5, 0.2, '#A7C6AE', 3)
    poly([[0.1, 0.1], [0.42, 0.1], [0.26, 0.32]], '#E9C46A', 4)
  } else if (kind === 'moon') {
    circle(0.55, 0.6, 0.38, '#F3EBD2')
    circle(0.66, 0.67, 0.34, '#2C3566', 3)
    ;[[0.2, 0.3], [0.3, 0.8], [0.8, 0.25], [0.15, 0.6], [0.85, 0.85]].forEach(([u, z]) => circle(u, z, 0.06, '#F3EBD2', 4))
  } else if (kind === 'cat') {
    poly([[0.3, 0.08], [0.7, 0.08], [0.66, 0.55], [0.34, 0.55]], '#3B3646')
    circle(0.5, 0.62, 0.32, '#3B3646', 3)
    poly([[0.36, 0.72], [0.4, 0.92], [0.48, 0.78]], '#3B3646', 4)
    poly([[0.64, 0.72], [0.6, 0.92], [0.52, 0.78]], '#3B3646', 4)
    circle(0.44, 0.64, 0.05, '#F2C46B', 5); circle(0.56, 0.64, 0.05, '#F2C46B', 5)
  } else if (kind === 'plants') {
    ;[0.28, 0.5, 0.72].forEach((u, i) => {
      poly([[u - 0.01, 0.12], [u + 0.01, 0.12], [u + 0.01, 0.85], [u - 0.01, 0.85]], '#6F8F6A', 3)
      for (let k = 0; k < 5; k++) {
        const z = 0.25 + k * 0.13, s = k % 2 ? 1 : -1
        poly([[u, z], [u + s * 0.12, z + 0.05], [u + s * 0.08, z + 0.1]], ['#8DAE83', '#A7C59C', '#7A9D72'][i], 4)
      }
    })
  } else {
    poly([[0, 0], [0.5, 0.55], [1, 0]], '#E5A99A')
    poly([[0.4, 0], [0.7, 0.36], [1, 0.16], [1, 0]], '#C98A8E', 2)
    circle(0.22, 0.75, 0.16, '#F6C46B', 3)
  }
}

// a wall lamp: a little plate, an arm and a soft shade that lights the wall
function sconce(d, side, u, z, lit, glow, shadeColor = '#F6E7CF') {
  const plate = P(...onWall(side, u, z, 0.03))
  const arm = P(...(side === 'left' ? [0.7, u, z + 0.1] : [u, 0.7, z + 0.1]))
  d.raw(`<ellipse cx="${plate[0].toFixed(1)}" cy="${plate[1].toFixed(1)}" rx="2.6" ry="3.6" fill="#B08A5A"/>`)
  d.raw(`<path d="M${plate[0].toFixed(1)},${plate[1].toFixed(1)} Q${((plate[0] + arm[0]) / 2).toFixed(1)},${(plate[1] - 6).toFixed(1)} ${arm[0].toFixed(1)},${arm[1].toFixed(1)}" stroke="#B08A5A" stroke-width="1.4" fill="none"/>`)
  d.raw(`<path d="M${(arm[0] - 5).toFixed(1)},${(arm[1] - 1).toFixed(1)} L${(arm[0] + 5).toFixed(1)},${(arm[1] - 1).toFixed(1)} L${(arm[0] + 7.5).toFixed(1)},${(arm[1] + 7).toFixed(1)} L${(arm[0] - 7.5).toFixed(1)},${(arm[1] + 7).toFixed(1)} Z" fill="${lit ? '#FCE6B8' : shadeColor}"/>`)
  d.raw(`<ellipse cx="${arm[0].toFixed(1)}" cy="${(arm[1] + 7).toFixed(1)}" rx="7.5" ry="1.6" fill="${lit ? '#FFF1CF' : shade(shadeColor, -0.08)}"/>`)
  if (lit) glow(arm[0], arm[1] + 14, 46)
}

// a bedside table with a drawer and a little ceramic lamp
function nightstand(d, x, y, wood, lit, glow, lampColor = '#F4D9C6') {
  d.shadow(x - 0.1, y - 0.1, x + 1.05, y + 1.05, 0.14)
  d.box(x, y, 0, 0.9, 0.9, 1.45, [shade(wood, 0.18), wood, shade(wood, -0.1)])
  d.poly([[x + 0.91, y + 0.12, 0.85], [x + 0.91, y + 0.78, 0.85], [x + 0.91, y + 0.78, 1.3], [x + 0.91, y + 0.12, 1.3]], shade(wood, -0.05))
  const k = P(x + 0.92, y + 0.45, 1.07)
  d.raw(`<circle cx="${k[0].toFixed(1)}" cy="${k[1].toFixed(1)}" r="1" fill="${shade(wood, -0.35)}"/>`)
  d.cylinder(x + 0.45, y + 0.45, 1.45, 0.24, 0.5, lampColor)
  const top = P(x + 0.45, y + 0.45, 1.95)
  d.raw(`<path d="M${(top[0] - 0.6).toFixed(1)},${top[1].toFixed(1)} v-5 h1.2 v5 z" fill="#C9A26E"/>`)
  const s = P(x + 0.45, y + 0.45, 2.7)
  d.raw(`<path d="M${(s[0] - 5).toFixed(1)},${s[1].toFixed(1)} L${(s[0] + 5).toFixed(1)},${s[1].toFixed(1)} L${(s[0] + 8).toFixed(1)},${(s[1] + 9).toFixed(1)} L${(s[0] - 8).toFixed(1)},${(s[1] + 9).toFixed(1)} Z" fill="${lit ? '#FDEBC4' : '#FBF4EA'}"/>`)
  d.raw(`<ellipse cx="${s[0].toFixed(1)}" cy="${(s[1] + 9).toFixed(1)}" rx="8" ry="1.8" fill="${lit ? '#FFF3D6' : '#EFE5D8'}"/>`)
  if (lit) glow(s[0], s[1] + 10, 34)
  // a small book on the table
  d.box(x + 0.08, y + 0.1, 1.45, 0.25, 0.6, 0.1, '#B9A3D6')
}

// a desk calendar standing on its edge, facing +x (towards the chair): month on top, today's date big
function deskCalendar(d, x, y0, y1, z0, h, events) {
  const now = new Date()
  const month = now.toLocaleDateString('en', { month: 'short' }).toUpperCase()
  d.poly([[x - 0.35, y0, z0], [x, y0, z0], [x, y0, z0 + h], [x - 0.35, y0, z0]], '#E6DFEC')
  d.poly([[x, y0, z0], [x, y1, z0], [x, y1, z0 + h], [x, y0, z0 + h]], '#FFFFFF')
  d.poly([[x, y0, z0 + h * 0.72], [x, y1, z0 + h * 0.72], [x, y1, z0 + h], [x, y0, z0 + h]], '#E07A8F')
  ;[0.3, 0.7].forEach((t) => { const r = P(x + 0.01, y0 + (y1 - y0) * t, z0 + h); d.raw(`<circle cx="${r[0].toFixed(1)}" cy="${r[1].toFixed(1)}" r="1.1" fill="#4A4260"/>`) })
  const m = P(x + 0.01, (y0 + y1) / 2, z0 + h * 0.8)
  d.raw(`<text transform="translate(${m[0].toFixed(1)} ${m[1].toFixed(1)}) skewY(-30)" font-size="4.6" font-family="Figtree, sans-serif" font-weight="700" fill="#FFF" text-anchor="middle">${month}</text>`)
  const n = P(x + 0.01, (y0 + y1) / 2, z0 + h * 0.22)
  d.raw(`<text transform="translate(${n[0].toFixed(1)} ${n[1].toFixed(1)}) skewY(-30)" font-size="10" font-family="Fraunces, Georgia, serif" fill="#3A3350" text-anchor="middle">${now.getDate()}</text>`)
  if (events > 0) {
    const dot = P(x + 0.02, y0 + 0.1, z0 + h + 0.15)
    d.raw(`<circle cx="${dot[0].toFixed(1)}" cy="${dot[1].toFixed(1)}" r="3.4" fill="#E07A8F" stroke="#FFF" stroke-width="1.2"/><text x="${dot[0].toFixed(1)}" y="${(dot[1] + 1.6).toFixed(1)}" font-size="4.4" font-family="Figtree, sans-serif" font-weight="700" fill="#FFF" text-anchor="middle">${Math.min(events, 9)}</text>`)
  }
}

// where the label of a spot sits, in percent of the spot's box
function tagAt(spot, p) {
  const [x, y] = P(...p)
  const left = ((x - VB.x) / VB.w) * 100, top = ((y - VB.y) / VB.h) * 100
  return { ...spot, tx: ((left - spot.l) / spot.w) * 100, ty: ((top - spot.t) / spot.h) * 100 }
}

/* ---------- room styles: windows and details ---------- */

const ring = (cx, cz, r, n = 48) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((2 * Math.PI * i) / n), 0.02, cz + r * Math.sin((2 * Math.PI * i) / n)])

function roundWindow(d, sky, blanket) {
  const cx = 7.9, cz = 4.75, r = 1.45
  const wood = '#7A5A44'
  d.poly(ring(cx, cz, r + 0.32), wood)
  d.poly(ring(cx, cz, r + 0.12), shade(wood, 0.18))
  d.raw(`<clipPath id="roundw"><polygon points="${pts(ring(cx, cz, r))}"/></clipPath><g clip-path="url(#roundw)">`)
  d.poly(ring(cx, cz, r), 'url(#sky)')
  const orb = P(8.5, 0.03, cz + 0.7)
  d.raw(`<circle cx="${orb[0].toFixed(1)}" cy="${orb[1].toFixed(1)}" r="10" fill="${sky.orb}" opacity=".25"/><circle cx="${orb[0].toFixed(1)}" cy="${orb[1].toFixed(1)}" r="5" fill="${sky.orb}"/>`)
  d.poly([[cx - r, 0.03, cz - r], [cx - r, 0.03, cz - 0.6], [cx - 0.8, 0.03, cz - 0.2], [cx, 0.03, cz - 0.7], [cx + 0.9, 0.03, cz - 0.1], [cx + r, 0.03, cz - 0.5], [cx + r, 0.03, cz - r]], sky.hills, ' opacity=".7"')
  d.raw('</g>')
  d.poly([[cx - 0.07, 0.04, cz - r], [cx + 0.07, 0.04, cz - r], [cx + 0.07, 0.04, cz + r], [cx - 0.07, 0.04, cz + r]], wood)
  d.poly([[cx - r, 0.04, cz - 0.07], [cx + r, 0.04, cz - 0.07], [cx + r, 0.04, cz + 0.07], [cx - r, 0.04, cz + 0.07]], wood)
  // one soft curtain tied to the side
  const c = shade(blanket, 0.6)
  d.poly([[9.7, 0.25, 6.3], [9.95, 0.25, 6.3], [9.95, 0.25, 2.4], [9.3, 0.25, 2.4], [9.6, 0.25, 4.0]], c)
  d.line([[9.45, 0.26, 4.0], [9.95, 0.26, 4.0]], shade(c, -0.15), 1.6)
}

let seed = 7
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
function cityWindow(d, sky, blanket, x0 = 6.0, x1 = 9.6, z0 = 3.2, z1 = 8.0, rainy = true, photo = null) {
  const frame = '#3A3350'
  d.poly([[x0 - 0.18, 0.01, z0 - 0.18], [x1 + 0.18, 0.01, z0 - 0.18], [x1 + 0.18, 0.01, z1 + 0.18], [x0 - 0.18, 0.01, z1 + 0.18]], frame)
  d.raw(`<clipPath id="cityw"><polygon points="${pts([[x0, 0.02, z0], [x1, 0.02, z0], [x1, 0.02, z1], [x0, 0.02, z1]])}"/></clipPath><g clip-path="url(#cityw)">`)
  d.poly([[x0, 0.02, z0], [x1, 0.02, z0], [x1, 0.02, z1], [x0, 0.02, z1]], 'url(#sky)')
  const moon = P(x1 - 0.7, 0.03, z1 - 0.8)
  d.raw(`<circle cx="${moon[0].toFixed(1)}" cy="${moon[1].toFixed(1)}" r="9" fill="${sky.orb}" opacity=".25"/><circle cx="${moon[0].toFixed(1)}" cy="${moon[1].toFixed(1)}" r="4.5" fill="${sky.orb}"/>`)
  seed = 7
  // far buildings, then near ones with lit windows
  const night = sky.lights
  ;[[night ? '#283062' : '#B9C9DB', 0.6, 1.4], [night ? '#1A2048' : '#9CB0C7', 0.0, 1.0]].forEach(([col, lift, lit]) => {
    let x = x0
    while (x < x1) {
      const w = 0.35 + rnd() * 0.35, h = 1.0 + rnd() * 2.6 + lift
      d.poly([[x, 0.03, z0], [x + w, 0.03, z0], [x + w, 0.03, z0 + h], [x, 0.03, z0 + h]], col)
      for (let wz = z0 + 0.2; wz < z0 + h - 0.2; wz += 0.28) for (let wx = x + 0.07; wx < x + w - 0.1; wx += 0.16) {
        if (rnd() < 0.32 * lit) d.poly([[wx, 0.04, wz], [wx + 0.07, 0.04, wz], [wx + 0.07, 0.04, wz + 0.1], [wx, 0.04, wz + 0.1]], night ? (rnd() < 0.7 ? '#F6C46B' : '#FBE3B4') : '#E6EEF6', ` opacity="${night ? 0.9 : 0.7}"`)
      }
      x += w + 0.04
    }
  })
  d.flushWeather()
  // rain: thin lines falling down the glass
  const a = P(x0, 0.03, z1), b = P(x1, 0.03, z0)
  let rain = ''
  for (let i = 0; i < 46; i++) {
    const rx = a[0] + rnd() * (b[0] - a[0] + 30) - 10, ry = a[1] - 40 + rnd() * (b[1] - a[1] + 60)
    rain += `<path d="M${rx.toFixed(1)},${ry.toFixed(1)} l-1.2,6" />`
  }
  if (rainy) d.raw(`<g class="rain" stroke="#BFD0FF" stroke-width=".6" opacity=".55" stroke-linecap="round">${rain}</g>`)
  if (photo) wallImage(d, x0, x1, z0, z1, photo)
  if (rainy) d.raw(`<g class="rain rain2" stroke="#BFD0FF" stroke-width=".6" opacity=".55" stroke-linecap="round">${rain}</g>`)
  d.raw('</g>')
  const mid = (x0 + x1) / 2
  d.poly([[mid - 0.07, 0.04, z0], [mid + 0.07, 0.04, z0], [mid + 0.07, 0.04, z1], [mid - 0.07, 0.04, z1]], frame)
  d.poly([[x0, 0.04, z0 + (z1 - z0) * 0.65], [x1, 0.04, z0 + (z1 - z0) * 0.65], [x1, 0.04, z0 + (z1 - z0) * 0.65 + 0.12], [x0, 0.04, z0 + (z1 - z0) * 0.65 + 0.12]], frame)
  d.box(x0 - 0.3, 0, z0 - 0.32, x1 - x0 + 0.6, 0.55, 0.16, [shade(frame, 0.3), frame, shade(frame, -0.1)])
}

function atticDetails(d) {
  // dark wooden beams under the roof and in the corner
  const beam = '#6E4F3A'
  d.box(0, 0, 8.45, 0.35, 10, 0.4, [shade(beam, 0.15), beam, shade(beam, -0.1)])
  // a beam running down along the sloping roof
  d.poly([[0, 0.02, 9], [10, 0.02, 6.4], [10, 0.02, 6.0], [0, 0.02, 8.6]], shade(beam, -0.05))
  d.poly([[0, 0, 9], [10, 0, 6.4], [10, 0.4, 6.4], [0, 0.4, 9]], shade(beam, 0.2))
  d.box(0, 0, 0, 0.3, 0.3, 8.45, [shade(beam, 0.15), beam, shade(beam, -0.12)])
  // paper clouds and little stars on the left wall
  const cloud = (y, z, k) => {
    const c = P(0.04, y, z)
    d.raw(`<path transform="translate(${c[0].toFixed(1)} ${c[1].toFixed(1)}) skewY(-30) scale(${k})" d="M-12,4 a6,6 0 0 1 4,-9 a8,8 0 0 1 14,-2 a6,6 0 0 1 8,7 a4,4 0 0 1 -2,4 z" fill="#FFFDF8" stroke="#E7DCCF" stroke-width="1"/>`)
  }
  cloud(6.6, 7.7, 0.9); cloud(8.6, 7.0, 0.75)
  ;[[7.6, 7.6], [9.2, 7.8], [6.4, 6.8], [8.0, 6.4]].forEach(([y, z]) => {
    const c = P(0.04, y, z)
    d.raw(`<path transform="translate(${c[0].toFixed(1)} ${c[1].toFixed(1)}) skewY(-30)" d="M0,-3.4 L1,-1 L3.4,-1 L1.5,.6 L2.2,3 L0,1.6 L-2.2,3 L-1.5,.6 L-3.4,-1 L-1,-1 Z" fill="#F2CF7A"/>`)
  })
  // warm lights hanging down in the corner
  ;[0.9, 1.6].forEach((y, j) => {
    for (let i = 0; i < 6; i++) {
      const p = P(0.3, y, 8.2 - i * 0.75 - j * 0.3)
      d.raw(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="5" fill="url(#halo)"/><circle class="twinkle" style="animation-delay:${(i * 0.3).toFixed(1)}s" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="1.5" fill="#FFE7B0"/>`)
    }
    d.line([[0.3, y, 8.45], [0.3, y, 8.2 - 5 * 0.75 - j * 0.3]], '#8C7A66', 0.5)
  })
}

function bouquet(d, x, y, z) {
  const c0 = P(x, y, z)
  const id = 'vz' + ++softN
  d.raw(`<defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#EAF1F6"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9D8E4"/></linearGradient></defs>`)
  d.raw(`<path d="M${c0[0] - 4.5},${c0[1] - 13} Q${c0[0] - 7},${c0[1] - 5} ${c0[0] - 4},${c0[1]} Q${c0[0]},${c0[1] + 2} ${c0[0] + 4},${c0[1]} Q${c0[0] + 7},${c0[1] - 5} ${c0[0] + 4.5},${c0[1] - 13} Z" fill="url(#${id})" opacity=".95"/>`)
  const t = [c0[0], c0[1] - 13]
  ;[[-10, -8], [-4, -14], [5, -12], [11, -6], [0, -6], [-12, -2], [12, 0]].forEach(([dx, dy]) => d.raw(`<path d="M${t[0]},${t[1]} Q${t[0] + dx * 0.4},${t[1] + dy * 0.5} ${t[0] + dx},${t[1] + dy}" stroke="#6FA287" stroke-width=".8" fill="none"/>`))
  ;[[-13, -3, 3.4], [13, -1, 3.2], [-9, -12, 3.4], [9, -10, 3.4]].forEach(([dx, dy, r]) => d.raw(`<ellipse cx="${t[0] + dx}" cy="${t[1] + dy}" rx="${r}" ry="${r * 0.55}" fill="#7FB495" transform="rotate(${dx * 2} ${t[0] + dx} ${t[1] + dy})"/>`))
  const bloom = (cx, cy, r, c) => {
    for (let i = 0; i < 6; i++) { const a = (Math.PI * 2 * i) / 6; d.raw(`<circle cx="${(cx + r * 0.7 * Math.cos(a)).toFixed(1)}" cy="${(cy + r * 0.7 * Math.sin(a)).toFixed(1)}" r="${(r * 0.55).toFixed(1)}" fill="${c}"/>`) }
    d.raw(`<circle cx="${cx}" cy="${cy}" r="${(r * 0.4).toFixed(1)}" fill="#F6D27A"/>`)
  }
  bloom(t[0] - 7, t[1] - 10, 4.2, '#F4B7C8'); bloom(t[0] + 6, t[1] - 13, 4.6, '#FFFFFF'); bloom(t[0], t[1] - 19, 4.2, '#E99AAE')
  bloom(t[0] + 11, t[1] - 5, 3.6, '#F7CFD9'); bloom(t[0] - 12, t[1] - 3, 3.4, '#FFFFFF')
}

function flowers(d, x, y, z) {
  d.cylinder(x, y, z, 0.22, 0.55, '#E9E2EF')
  const c = P(x, y, z + 0.55)
  ;[[-6, -5, '#F2B5C6'], [-1, -9, '#F7CFD9'], [5, -6, '#E99AAE'], [-4, -12, '#FFFFFF'], [3, -12, '#F2B5C6'], [8, -10, '#F7CFD9'], [-8, -9, '#E99AAE']].forEach(([dx, dy, col]) => {
    d.raw(`<path d="M${c[0].toFixed(1)},${c[1].toFixed(1)} L${(c[0] + dx * 0.6).toFixed(1)},${(c[1] + dy * 0.6).toFixed(1)}" stroke="#6FA287" stroke-width=".7"/>`)
    d.raw(`<circle cx="${(c[0] + dx).toFixed(1)}" cy="${(c[1] + dy).toFixed(1)}" r="2.6" fill="${col}"/><circle cx="${(c[0] + dx).toFixed(1)}" cy="${(c[1] + dy).toFixed(1)}" r=".9" fill="#F6D27A"/>`)
  })
  ;[[-9, -3], [8, -3], [0, -4]].forEach(([dx, dy]) => d.raw(`<ellipse cx="${(c[0] + dx).toFixed(1)}" cy="${(c[1] + dy).toFixed(1)}" rx="2.8" ry="1.4" fill="#7FB495"/>`))
}

function plush(d, x, y, z, col) {
  const c = P(x, y, z)
  d.raw(`<g transform="translate(${c[0].toFixed(1)} ${(c[1] - 7).toFixed(1)})">
    <ellipse cx="0" cy="7" rx="9" ry="2.5" fill="#000" opacity=".15"/>
    <path d="M-6,-6 l-1,-6 l5,4 M6,-6 l1,-6 l-5,4" fill="${col}"/>
    <ellipse cx="0" cy="0" rx="9" ry="8" fill="${col}"/>
    <ellipse cx="-2" cy="-3" rx="5" ry="3" fill="#fff" opacity=".25"/>
    <path d="M-4,0 q1.2,1 2.4,0 M1.6,0 q1.2,1 2.4,0" stroke="#4A4260" stroke-width=".8" fill="none" stroke-linecap="round"/>
    <circle cx="-5.5" cy="2.5" r="1.4" fill="#F4A3B4" opacity=".7"/><circle cx="5.5" cy="2.5" r="1.4" fill="#F4A3B4" opacity=".7"/>
  </g>`)
}

/* ---------- furniture used by the attic and the night study ---------- */

// a bookcase standing against the left wall, from y0 to y0 + len
function bookcase(d, { y0, len, depth = 1.3, h, levels, wood, books, plushTop = false }) {
  let placed = 0
  d.shadow(0, y0 - 0.2, depth + 0.35, y0 + len + 0.3, 0.18)
  d.poly([[0.06, y0, 0], [0.06, y0 + len, 0], [0.06, y0 + len, h], [0.06, y0, h]], shade(wood, -0.3))
  d.box(0, y0, 0, depth, 0.12, h, wood)
  levels.forEach((z, si) => {
    d.box(0, y0, z - 0.12, depth, len, 0.12, shade(wood, 0.07))
    let y = y0 + 0.2, k = si * 3
    while (y < y0 + len - 0.35) {
      const w = [0.24, 0.29, 0.34, 0.26, 0.31, 0.27][k % 6]
      if (placed < books) {
        const bh = Math.min((levels[si + 1] || h) - z - 0.25, [0.95, 0.8, 1.05, 0.72, 0.9, 1.0, 0.85][k % 7])
        d.box(0.18, y, z, depth - 0.3, w, bh, bookAt(placed, BOOK_COLORS[(placed * 3 + si) % BOOK_COLORS.length]))
        noteBook(placed, [[0.18, y, z], [depth - 0.12, y + w, z], [depth - 0.12, y, z + bh], [0.18, y + w, z + bh]])
        placed++
      }
      y += w + 0.04; k++
    }
  })
  d.box(0, y0 + len - 0.12, 0, depth, 0.12, h, wood)
  d.box(0, y0, h, depth, len, 0.12, shade(wood, 0.12))
  if (plushTop) {
    plush(d, 0.65, y0 + 0.7, h + 0.12, '#B9A3E0')
    plush(d, 0.7, y0 + 1.6, h + 0.12, '#F2B5C6')
    plush(d, 0.6, y0 + 2.4, h + 0.12, '#A7D3C0')
  }
  return bounds([[0, y0, 0], [depth, y0, 0], [depth, y0 + len, 0], [0, y0 + len, h + 1], [depth, y0, h + 1], [0, y0, h + 1]], 0)
}

// a desk standing against the right wall, from x0 to x1
function wallDesk(d, { x0, x1, depth = 2.0, top = 2.5, wood, drawers = 'left' }) {
  d.shadow(x0 - 0.1, 0, x1 + 0.2, depth + 0.3, 0.16)
  const leg = shade(wood, -0.1)
  if (drawers === 'left') {
    d.box(x0 + 0.1, 0.1, 0, 1.3, depth - 0.2, top - 0.18, wood)
    ;[0.35, 1.05, 1.75].forEach((z) => d.poly([[x0 + 0.25, depth - 0.09, z], [x0 + 1.25, depth - 0.09, z], [x0 + 1.25, depth - 0.09, z + 0.55], [x0 + 0.25, depth - 0.09, z + 0.55]], shade(wood, -0.05)))
    ;[0.62, 1.32, 2.02].forEach((z) => { const k = P(x0 + 0.75, depth - 0.08, z); d.raw(`<ellipse cx="${k[0].toFixed(1)}" cy="${k[1].toFixed(1)}" rx="2" ry="1" fill="${shade(wood, -0.35)}"/>`) })
  } else {
    d.box(x0 + 0.15, 0.15, 0, 0.16, 0.16, top - 0.18, leg)
    d.box(x0 + 0.15, depth - 0.3, 0, 0.16, 0.16, top - 0.18, leg)
  }
  d.box(x1 - 0.3, 0.15, 0, 0.16, 0.16, top - 0.18, leg)
  d.box(x1 - 0.3, depth - 0.3, 0, 0.16, 0.16, top - 0.18, leg)
  d.box(x0, 0, top - 0.18, x1 - x0, depth, 0.18, [shade(wood, 0.18), wood, shade(wood, -0.1)])
}

// a desk calendar facing the room (towards +y)
function calendarFront(d, x0, x1, y, z0, h, events) {
  const now = new Date()
  const month = now.toLocaleDateString('en', { month: 'short' }).toUpperCase()
  d.poly([[x1, y - 0.35, z0], [x1, y, z0], [x1, y, z0 + h]], '#E6DFEC')
  d.poly([[x0, y, z0], [x1, y, z0], [x1, y, z0 + h], [x0, y, z0 + h]], '#FFFFFF')
  d.poly([[x0, y, z0 + h * 0.72], [x1, y, z0 + h * 0.72], [x1, y, z0 + h], [x0, y, z0 + h]], '#E07A8F')
  ;[0.3, 0.7].forEach((t) => { const r = P(x0 + (x1 - x0) * t, y + 0.01, z0 + h); d.raw(`<circle cx="${r[0].toFixed(1)}" cy="${r[1].toFixed(1)}" r="1.1" fill="#4A4260"/>`) })
  const m = P((x0 + x1) / 2, y + 0.01, z0 + h * 0.8)
  d.raw(`<text transform="translate(${m[0].toFixed(1)} ${m[1].toFixed(1)}) skewY(30)" font-size="4.6" font-family="Figtree, sans-serif" font-weight="700" fill="#FFF" text-anchor="middle">${month}</text>`)
  const n = P((x0 + x1) / 2, y + 0.01, z0 + h * 0.22)
  d.raw(`<text transform="translate(${n[0].toFixed(1)} ${n[1].toFixed(1)}) skewY(30)" font-size="10" font-family="Fraunces, Georgia, serif" fill="#3A3350" text-anchor="middle">${now.getDate()}</text>`)
  if (events > 0) {
    const dot = P(x1, y + 0.02, z0 + h + 0.15)
    d.raw(`<circle cx="${dot[0].toFixed(1)}" cy="${dot[1].toFixed(1)}" r="3.4" fill="#E07A8F" stroke="#FFF" stroke-width="1.2"/><text x="${dot[0].toFixed(1)}" y="${(dot[1] + 1.6).toFixed(1)}" font-size="4.4" font-family="Figtree, sans-serif" font-weight="700" fill="#FFF" text-anchor="middle">${Math.min(events, 9)}</text>`)
  }
}

// a chair at a desk on the right wall: we see its back
function chairFacingWall(d, cx, cy, { color, wood, style }) {
  d.shadow(cx - 0.8, cy - 0.8, cx + 0.8, cy + 0.9, 0.14)
  if (style === 'swivel') {
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5 + 0.4, ex = cx + 0.7 * Math.cos(a), ey = cy + 0.7 * Math.sin(a)
      d.line([[cx, cy, 0.22], [ex, ey, 0.15]], '#D8D2DE', 2.4, ' stroke-linecap="round"')
      const w = P(ex, ey, 0.07); d.raw(`<circle cx="${w[0].toFixed(1)}" cy="${w[1].toFixed(1)}" r="1.5" fill="#A9A2B4"/>`)
    }
    d.cylinder(cx, cy, 0.22, 0.08, 1.05, '#C9C2D2')
    d.box(cx - 0.75, cy - 0.7, 1.25, 1.5, 1.4, 0.35, [shade(color, 0.12), color, shade(color, -0.1)])
    d.box(cx - 0.85, cy - 0.7, 1.3, 0.22, 1.35, 0.85, [shade(color, 0.12), shade(color, -0.04), shade(color, -0.12)])
    d.box(cx + 0.65, cy - 0.7, 1.3, 0.22, 1.35, 0.85, [shade(color, 0.12), shade(color, -0.04), shade(color, -0.12)])
    d.box(cx - 0.85, cy + 0.6, 1.3, 1.72, 0.3, 2.1, [shade(color, 0.15), color, shade(color, -0.08)])
  } else {
    // wooden chair with a slatted back
    const leg = (x, y, h) => d.box(x, y, 0, 0.12, 0.12, h, shade(wood, -0.1))
    leg(cx - 0.65, cy - 0.6, 1.45); leg(cx + 0.55, cy - 0.6, 1.45)
    leg(cx - 0.65, cy + 0.55, 1.45)
    d.box(cx - 0.72, cy - 0.68, 1.45, 1.42, 1.38, 0.12, [shade(wood, 0.18), wood, shade(wood, -0.08)])
    d.box(cx - 0.62, cy - 0.58, 1.57, 1.22, 1.18, 0.1, [shade(color, 0.15), color, shade(color, -0.1)])
    leg(cx + 0.55, cy + 0.55, 1.45)
    d.box(cx - 0.65, cy + 0.55, 1.45, 0.12, 0.12, 2.0, shade(wood, -0.1))
    d.box(cx + 0.55, cy + 0.55, 1.45, 0.12, 0.12, 2.0, shade(wood, -0.1))
    for (let i = 0; i < 4; i++) d.box(cx - 0.42 + i * 0.27, cy + 0.58, 1.6, 0.08, 0.06, 1.55, wood)
    d.box(cx - 0.7, cy + 0.53, 3.35, 1.4, 0.16, 0.2, [shade(wood, 0.18), wood, shade(wood, -0.08)])
  }
  return bounds([[cx - 0.9, cy - 0.8, 0], [cx + 0.9, cy - 0.8, 0], [cx + 0.9, cy + 0.9, 0], [cx - 0.9, cy + 0.9, 0], [cx - 0.9, cy + 0.9, 3.6], [cx + 0.9, cy - 0.8, 3.6]], 2)
}

// a bed along the left wall, the head at y0
function wallBed(d, { y0, len, depth, base, blanket, wood, mattressZ, cushions = [] }) {
  d.shadow(0, y0 - 0.3, depth + 0.3, y0 + len + 0.3, 0.18)
  headboard(d, 0, depth, y0, mattressZ + 1.4, shade(blanket, 0.22))
  if (base) d.box(0, y0, 0, depth, len, base, [shade(wood, 0.15), wood, shade(wood, -0.12)])
  soft(d, 0.04, y0 + 0.05, base || 0, depth - 0.08, len - 0.1, mattressZ - (base || 0), ['#FFFFFF', '#F2EDF6', '#E4DCEC'], 0.3)
  const mt = mattressZ
  soft(d, 0.3, y0 + 0.15, mt, depth - 0.6, 0.85, 0.5, ['#FFFFFF', '#F4F0F8', '#E6DFEE'], 0.4, 2)
  cushions.forEach(([x, c], i) => soft(d, x, y0 + 0.8 + i * 0.04, mt, 0.8, 0.5, 0.55, [shade(c, 0.2), shade(c, 0.08), shade(c, -0.08)], 0.25, 1))
  duvet(d, 0.02, y0 + 1.45, depth - 0.02, y0 + len - 0.02, mt + 0.08, Math.min(0.75, mt - (base || 0) - 0.05), blanket)
  return mt + 0.1
}

function openDiary(d, x, y, z, written) {
  d.poly([[x, y, z], [x + 0.9, y, z], [x + 0.9, y + 1.25, z], [x, y + 1.25, z]], '#FFFDF8')
  d.poly([[x + 0.9, y, z], [x + 1.8, y, z], [x + 1.8, y + 1.25, z], [x + 0.9, y + 1.25, z]], '#FBF6EC')
  d.line([[x + 0.9, y, z + 0.01], [x + 0.9, y + 1.25, z + 0.01]], '#CDBFAE', 1)
  for (let j = 0; j < (written ? 4 : 2); j++) d.line([[x + 0.15, y + 0.25 + j * 0.24, z + 0.01], [x + 0.75, y + 0.25 + j * 0.24, z + 0.01]], written ? '#9C86C9' : '#DCD3C6', 0.8)
}

function bush(d, x, y) {
  const b = P(x, y, 0)
  d.raw(`<ellipse cx="${b[0].toFixed(1)}" cy="${(b[1] + 1).toFixed(1)}" rx="16" ry="5" fill="#3a2a22" opacity=".2" filter="url(#soft)"/>`)
  d.cylinder(x, y, 0, 0.55, 0.9, '#E2D6C8')
  const t = P(x, y, 0.9)
  const blobs = [[-12, -10, 11], [10, -12, 11], [0, -22, 13], [-14, -28, 10], [13, -30, 10], [0, -38, 10]]
  blobs.forEach(([dx, dy, r], i) => d.raw(`<circle cx="${(t[0] + dx).toFixed(1)}" cy="${(t[1] + dy).toFixed(1)}" r="${r}" fill="${i % 2 ? '#6F9E7F' : '#7FAE8C'}"/>`))
  const fl = [[-14, -14], [-6, -20], [6, -16], [14, -22], [-10, -30], [2, -32], [12, -34], [-2, -42], [8, -40], [-16, -24], [16, -12], [0, -26]]
  fl.forEach(([dx, dy], i) => d.raw(`<circle cx="${(t[0] + dx).toFixed(1)}" cy="${(t[1] + dy).toFixed(1)}" r="3.3" fill="${['#F2B5C6', '#FFFFFF', '#E99AAE', '#F7CFD9'][i % 4]}"/><circle cx="${(t[0] + dx).toFixed(1)}" cy="${(t[1] + dy).toFixed(1)}" r="1" fill="#F6D27A"/>`))
}

function polaroids(d, y0, z0, n) {
  const spots = [[0, 0, -4], [1.05, 0.25, 5], [2.1, -0.1, -2], [0.45, -1.3, 6], [1.6, -1.2, -5], [2.6, -1.3, 3]]
  spots.slice(0, Math.max(2, Math.min(n + 1, 6))).forEach(([dy, dz], i) => {
    const y = y0 + dy, z = z0 + dz
    d.poly([[0.04, y, z], [0.04, y + 0.85, z], [0.04, y + 0.85, z + 1.0], [0.04, y, z + 1.0]], '#FFFFFF')
    d.poly([[0.05, y + 0.08, z + 0.25], [0.05, y + 0.77, z + 0.25], [0.05, y + 0.77, z + 0.92], [0.05, y + 0.08, z + 0.92]], ['#E9B8A4', '#A9C6DD', '#C7B6E2', '#B6D3B8', '#F2CF9A', '#E7A9B9'][i % 6])
    const tape = P(0.06, y + 0.42, z + 1.0)
    d.raw(`<rect x="${(tape[0] - 3).toFixed(1)}" y="${(tape[1] - 1.5).toFixed(1)}" width="6" height="3" fill="#F6E7A8" opacity=".85" transform="skewY(-30 ${tape[0].toFixed(1)} ${tape[1].toFixed(1)})"/>`)
  })
}

function deskLamp(d, x, y, z, lit, glow, color = '#3A3350') {
  const b = P(x, y, z), j = P(x + 0.3, y + 0.2, z + 1.6), h = P(x + 1.0, y + 0.55, z + 1.9)
  d.raw(`<ellipse cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" rx="5.5" ry="2.6" fill="${color}"/>`)
  d.raw(`<path d="M${b[0].toFixed(1)},${b[1].toFixed(1)} L${j[0].toFixed(1)},${j[1].toFixed(1)} L${h[0].toFixed(1)},${h[1].toFixed(1)}" stroke="${color}" stroke-width="1.8" fill="none" stroke-linejoin="round"/>`)
  d.raw(`<circle cx="${j[0].toFixed(1)}" cy="${j[1].toFixed(1)}" r="1.4" fill="${color}"/>`)
  d.raw(`<path d="M${(h[0] - 3).toFixed(1)},${(h[1] - 3).toFixed(1)} L${(h[0] + 3).toFixed(1)},${(h[1] - 4).toFixed(1)} L${(h[0] + 9).toFixed(1)},${(h[1] + 6).toFixed(1)} L${(h[0] - 3).toFixed(1)},${(h[1] + 8).toFixed(1)} Z" fill="${color}"/>`)
  d.raw(`<ellipse cx="${(h[0] + 3).toFixed(1)}" cy="${(h[1] + 7).toFixed(1)}" rx="6.5" ry="2" fill="${lit ? '#FFE9B5' : '#E9E1CF'}" transform="rotate(-12 ${(h[0] + 3).toFixed(1)} ${(h[1] + 7).toFixed(1)})"/>`)
  if (lit) {
    d.raw(`<path d="M${(h[0] - 3).toFixed(1)},${(h[1] + 8).toFixed(1)} L${(h[0] + 9).toFixed(1)},${(h[1] + 6).toFixed(1)} L${(h[0] + 40).toFixed(1)},${(h[1] + 34).toFixed(1)} L${(h[0] - 20).toFixed(1)},${(h[1] + 40).toFixed(1)} Z" fill="#FFE3A8" opacity=".18"/>`)
    glow(h[0] + 6, h[1] + 24, 60)
  }
}

/* ---------- the attic studio ---------- */

function atticScene(S) {
  const { d, room, sky, spots, G, E, glow, books, notes, events, diaryToday, leaves, blanket, shelfWood, deskWood, bedWood, rug } = S
  const white = '#F4EFEA'
  roundWindow(d, sky, blanket)
  atticDetails(d)
  // picture and polaroids
  G('art'); art(d, room.art || 'flowers', 'right', 1.4, 3.0, 4.6, 6.2, '#F7F1E8'); spots.art = bounds([[1.2, 0, 4.4], [3.2, 0, 4.4], [3.2, 0, 6.4], [1.2, 0, 6.4]], 1); E()
  polaroids(d, 4.3, 6.0, notes)
  spots.board = bounds([[0, 4.3, 4.4], [0, 7.3, 4.4], [0, 7.3, 7.1], [0, 4.3, 7.1]], 3)
  // a soft round rug
  spots.rug = bounds(Array.from({ length: 24 }, (_, i) => [5.6 + 2.4 * Math.cos((Math.PI * i) / 12), 5.6 + 2.4 * Math.sin((Math.PI * i) / 12), 0]), 0)
  G('rug')
  if (rug) {
    d.ring(5.6, 5.6, 0.01, 2.4, rug)
    for (let r = 2.0; r > 0.3; r -= 0.45) d.ring(5.6, 5.6, 0.02, r, shade(rug, (Math.round(r * 10) % 2 ? -0.05 : 0.02)))
    for (let i = 0; i < 44; i++) { const a = (Math.PI * 2 * i) / 44; d.line([[5.6 + 2.4 * Math.cos(a), 5.6 + 2.4 * Math.sin(a), 0.01], [5.6 + 2.62 * Math.cos(a), 5.6 + 2.62 * Math.sin(a), 0.01]], shade(rug, -0.04), 0.8) }
  }
  E()
  // tall white bookcase with plushies on top
  G('shelf'); spots.shelf = bookcase(d, { y0: 0.4, len: 3.2, depth: 1.3, h: 5.2, levels: [0.25, 1.5, 2.75, 4.0], wood: room.shelfWood === 'oak' ? white : shelfWood, books, plushTop: true }); E()
  plant(d, 3.0, 0.85, leaves)
  // drawers and the desk under the round window
  const dw = room.deskWood === 'oak' ? white : deskWood
  G('desk')
  d.box(4.3, 0.05, 0, 1.6, 1.4, 3.2, [shade(dw, 0.12), dw, shade(dw, -0.1)])
  ;[0.3, 1.2, 2.1].forEach((z) => { d.poly([[4.45, 1.46, z], [5.75, 1.46, z], [5.75, 1.46, z + 0.7], [4.45, 1.46, z + 0.7]], shade(dw, -0.05)); const k = P(5.1, 1.47, z + 0.38); d.raw(`<ellipse cx="${k[0].toFixed(1)}" cy="${k[1].toFixed(1)}" rx="2.4" ry="1.1" fill="#C9A26E"/>`) })
  d.cylinder(4.7, 0.6, 3.2, 0.24, 0.45, '#E9A3B4')
  ;[[4.65, 0.55], [4.75, 0.65], [4.7, 0.5]].forEach(([x, y], i) => d.line([[x, y, 3.5], [x + 0.05 * i, y, 4.3]], ['#B9A3E0', '#F2CF7A', '#7FA3C8'][i], 1.6, ' stroke-linecap="round"'))
  d.cylinder(5.4, 0.7, 3.2, 0.32, 0.36, '#D9B48F')
  const suc = P(5.4, 0.7, 3.56); ;[[-5, -4], [0, -7], [5, -4], [-2, -3], [3, -2]].forEach(([dx, dy]) => d.raw(`<ellipse cx="${(suc[0] + dx).toFixed(1)}" cy="${(suc[1] + dy).toFixed(1)}" rx="2.4" ry="4" fill="#8FB89A" transform="rotate(${dx * 5} ${(suc[0] + dx).toFixed(1)} ${(suc[1] + dy).toFixed(1)})"/>`))
  wallDesk(d, { x0: 6.0, x1: 9.7, depth: 1.9, top: 2.6, wood: dw, drawers: 'none' })
  // drawing tablet, tea, and the calendar
  d.poly([[6.9, 0.35, 2.62], [8.4, 0.35, 2.62], [8.4, 0.9, 3.6], [6.9, 0.9, 3.6]], '#3A3350')
  d.poly([[6.98, 0.4, 2.7], [8.32, 0.4, 2.7], [8.32, 0.86, 3.52], [6.98, 0.86, 3.52]], '#9FC3E8')
  d.cylinder(8.9, 1.2, 2.62, 0.22, 0.3, '#FFFFFF')
  const tea = P(8.9, 1.2, 2.92); d.raw(`<ellipse cx="${tea[0].toFixed(1)}" cy="${tea[1].toFixed(1)}" rx="2.6" ry="1.2" fill="#B98A5E"/>`)
  calendarFront(d, 6.3, 6.95, 1.55, 2.62, 1.2, events)
  spots.desk = tagAt(bounds([[4.3, 0, 0], [9.7, 0, 0], [9.7, 1.9, 0], [4.3, 1.9, 0], [4.3, 0, 4.4], [9.7, 1.9, 3.9]], 2), [6.6, 1.55, 4.2])
  E()
  bush(d, 9.25, 2.9)
  // white swivel armchair
  G('chair'); spots.chair = chairFacingWall(d, 7.6, 3.1, { color: (FABRICS[room.chairColor] || FABRICS.cream).c, wood: dw, style: 'swivel' }); E()
  // a low daybed full of cushions along the left wall
  G('bed')
  const mt = wallBed(d, { y0: 6.2, len: 3.6, depth: 3.0, base: 0.35, blanket, wood: bedWood, mattressZ: 1.1, cushions: [[0.3, '#F2B5C6'], [1.2, '#B9A3E0'], [2.05, '#F6D9A8']] })
  openDiary(d, 0.5, 8.0, mt + 0.02, diaryToday)
  if (room.pet === 'cat' || room.pet === 'dog') { const at = P(2.1, 8.6, mt + 0.05); d.raw(pet(room.pet, PET_COLORS[room.petColor] || PET_COLORS.black, at[0] - 21, at[1] - 21, 0.42)) }
  spots.bed = bounds([[0, 5.9, 0], [3.1, 5.9, 0], [3.1, 9.9, 0], [0, 9.9, 0], [0, 5.9, 2.6], [3.1, 9.9, 1.6]], 0)
  E()
  pouf(d, 4.3, 8.7, '#F2CF9A')
}

/* ---------- the night study ---------- */

function studyScene(S) {
  const { d, room, sky, spots, G, E, glow, books, notes, events, diaryToday, leaves, blanket, shelfWood, deskWood, bedWood, rug } = S
  const dark = room.deskWood === 'walnut' ? '#6B4A36' : deskWood
  cityWindow(d, sky, blanket, 3.1, 8.6, 3.1, 8.1, false)
  // a poster next to the window
  G('art'); art(d, room.art || 'moon', 'right', 0.9, 2.3, 4.4, 6.4, '#2E2A40'); spots.art = bounds([[0.7, 0, 4.2], [2.5, 0, 4.2], [2.5, 0, 6.6], [0.7, 0, 6.6]], 1); E()
  // pinboard with papers on the left wall
  d.poly([[0.02, 4.9, 4.3], [0.02, 7.9, 4.3], [0.02, 7.9, 6.7], [0.02, 4.9, 6.7]], '#5A4636')
  d.poly([[0.03, 5.02, 4.42], [0.03, 7.78, 4.42], [0.03, 7.78, 6.58], [0.03, 5.02, 6.58]], '#8C6E55')
  ;[[5.2, 5.6, '#F3EBD2'], [6.1, 5.75, '#E7D9B8'], [7.0, 5.5, '#F3EBD2'], [5.5, 4.65, '#D9E2EE'], [6.5, 4.6, '#F3EBD2'], [7.2, 4.7, '#E7D9B8']].slice(0, Math.max(2, Math.min(notes + 1, 6))).forEach(([y, z, c], i) => {
    d.poly([[0.04, y, z], [0.04, y + 0.7, z], [0.04, y + 0.7, z + 0.85], [0.04, y, z + 0.85]], c)
    for (let k = 0; k < 3; k++) d.line([[0.05, y + 0.12, z + 0.2 + k * 0.2], [0.05, y + 0.58, z + 0.2 + k * 0.2]], '#9C8F7A', 0.5)
    const pin = P(0.05, y + 0.35, z + 0.78); d.raw(`<circle cx="${pin[0].toFixed(1)}" cy="${pin[1].toFixed(1)}" r="1.5" fill="${i % 2 ? '#C2556B' : '#E9C46A'}"/>`)
  })
  spots.board = bounds([[0, 4.9, 4.3], [0, 7.9, 4.3], [0, 7.9, 6.7], [0, 4.9, 6.7]], 3)
  // rug
  spots.rug = bounds([[3.6, 3.4, 0], [8.4, 3.4, 0], [8.4, 7.6, 0], [3.6, 7.6, 0]], 0)
  G('rug')
  if (rug) {
    d.poly([[3.6, 3.4, 0.01], [8.4, 3.4, 0.01], [8.4, 7.6, 0.01], [3.6, 7.6, 0.01]], rug)
    d.poly([[3.9, 3.7, 0.02], [8.1, 3.7, 0.02], [8.1, 7.3, 0.02], [3.9, 7.3, 0.02]], 'none', ` stroke="${shade(rug, -0.12)}" stroke-width="1.2"`)
    d.poly([[4.4, 4.2, 0.02], [7.6, 4.2, 0.02], [7.6, 6.8, 0.02], [4.4, 6.8, 0.02]], 'none', ` stroke="${shade(rug, -0.08)}" stroke-width=".8"`)
  }
  E()
  // tall bookcase full of books
  G('shelf'); spots.shelf = bookcase(d, { y0: 0.4, len: 3.8, depth: 1.3, h: 6.4, levels: [0.25, 1.5, 2.75, 4.0, 5.25], wood: room.shelfWood === 'oak' ? dark : shelfWood, books: Math.max(books, 6) }); E()
  // the desk under the window: lamp, books, an open book, the calendar
  G('desk')
  wallDesk(d, { x0: 2.7, x1: 9.0, depth: 2.0, top: 2.5, wood: dark, drawers: 'left' })
  deskLamp(d, 3.2, 0.5, 2.5, true, glow)
  ;[0, 1, 2, 3, 4, 5, 6].forEach((i) => d.box(7.2 + i * 0.22, 0.15, 2.5, 0.2, 0.75, 0.75 + (i % 3) * 0.12, BOOK_COLORS[(i * 3) % BOOK_COLORS.length]))
  openDiary(d, 5.0, 0.9, 2.52, true)
  d.cylinder(4.4, 1.5, 2.5, 0.18, 0.4, '#C9BFD9')
  calendarFront(d, 6.3, 6.95, 1.6, 2.5, 1.15, events)
  if (room.pet === 'cat') { const at = P(5.6, 0.55, 2.52); d.raw(sittingCat(PET_COLORS[room.petColor] || PET_COLORS.black, at[0], at[1])) }
  spots.desk = tagAt(bounds([[2.7, 0, 0], [9.0, 0, 0], [9.0, 2.0, 0], [2.7, 2.0, 0], [2.7, 0, 4.4], [9.0, 2.0, 3.7]], 2), [6.6, 1.6, 4.0])
  E()
  // wooden chair with a slatted back
  G('chair'); spots.chair = chairFacingWall(d, 5.8, 3.0, { color: (FABRICS[room.chairColor] || FABRICS.blue).c, wood: dark, style: 'slats' }); E()
  // a low bed along the left wall, under the pinboard
  G('bed')
  const mt = wallBed(d, { y0: 5.2, len: 4.5, depth: 3.1, base: 0.5, blanket, wood: bedWood === 'oak' ? dark : (WOODS[room.bedWood] || WOODS.oak).c, mattressZ: 1.3, cushions: [[0.4, shade(blanket, 0.3)]] })
  openDiary(d, 0.6, 7.3, mt + 0.02, diaryToday)
  if (room.pet === 'dog') { const at = P(2.2, 8.4, mt + 0.05); d.raw(pet('dog', PET_COLORS[room.petColor] || PET_COLORS.golden, at[0] - 21, at[1] - 21, 0.42)) }
  spots.bed = bounds([[0, 4.9, 0], [3.2, 4.9, 0], [3.2, 9.8, 0], [0, 9.8, 0], [0, 4.9, 2.9], [3.2, 9.8, 1.8]], 0)
  E()
  plant(d, 9.0, 8.6, leaves)
}

/* ---------- small potted plants of different kinds ---------- */

function pottedPlant(d, x, y, kind = 'leafy', k = 1, pot = '#D98F72') {
  const b = P(x, y, 0)
  d.raw(`<ellipse cx="${b[0].toFixed(1)}" cy="${(b[1] + 1).toFixed(1)}" rx="${(9 * k).toFixed(1)}" ry="${(3.5 * k).toFixed(1)}" fill="#3a2a22" opacity=".18" filter="url(#soft)"/>`)
  d.cylinder(x, y, 0, 0.32 * k, 0.55 * k, pot)
  const t = P(x, y, 0.55 * k)
  const leaf = (dx, dy, rx, ry, rot, c) => d.raw(`<ellipse cx="${(t[0] + dx * k).toFixed(1)}" cy="${(t[1] + dy * k).toFixed(1)}" rx="${(rx * k).toFixed(1)}" ry="${(ry * k).toFixed(1)}" fill="${c}" transform="rotate(${rot} ${(t[0] + dx * k).toFixed(1)} ${(t[1] + dy * k).toFixed(1)})"/>`)
  if (kind === 'snake') {
    ;[[-4, -14, -8], [0, -18, 0], [4, -13, 9], [-1, -10, -3]].forEach(([dx, dy, r], i) => d.raw(`<path d="M${(t[0] + dx * k).toFixed(1)},${t[1].toFixed(1)} q${(2 * k).toFixed(1)},${(dy * k).toFixed(1)} ${(r * 0.3 * k).toFixed(1)},${(dy * 1.9 * k).toFixed(1)} q${(-3 * k).toFixed(1)},${(-dy * 0.9 * k).toFixed(1)} ${(-1 * k).toFixed(1)},${(-dy * 1.9 * k).toFixed(1)}" fill="${['#5E937A', '#7FAF8E', '#6FA287', '#8DBB9B'][i]}"/>`))
  } else if (kind === 'flower') {
    ;[[-6, -6, 6, 2.5, -30], [6, -7, 6, 2.5, 30], [0, -10, 5, 2.2, 90]].forEach(([dx, dy, rx, ry, r]) => leaf(dx, dy, rx, ry, r, '#7FAF8E'))
    ;[[-5, -14], [4, -16], [0, -20], [7, -11], [-8, -10]].forEach(([dx, dy], i) => d.raw(`<circle cx="${(t[0] + dx * k).toFixed(1)}" cy="${(t[1] + dy * k).toFixed(1)}" r="${(2.6 * k).toFixed(1)}" fill="${['#E99AAE', '#F2C46B', '#F4B7C8', '#E0566F', '#FFFFFF'][i]}"/>`))
  } else if (kind === 'trail') {
    ;[[-1, 1], [1, 1]].forEach(([s]) => { for (let i = 0; i < 6; i++) leaf(s * (5 + i * 1.6), -3 + i * 3.2, 3, 1.6, s * 40, i % 2 ? '#6FA287' : '#8DBB9B') })
    for (let i = 0; i < 5; i++) leaf(-6 + i * 3, -5 - (i % 2) * 2, 3.4, 2, i * 30, '#7FAF8E')
  } else if (kind === 'succulent') {
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; leaf(Math.cos(a) * 4, -3 + Math.sin(a) * 1.8, 3.6, 1.8, (a * 180) / Math.PI, i % 2 ? '#8FB89A' : '#A7CBB0') }
    leaf(0, -4, 2.2, 2.6, 0, '#B7D6BE')
  } else {
    ;[[-8, -8, -40], [8, -9, 40], [-3, -15, -15], [4, -16, 15], [0, -10, 90], [-10, -14, -60], [10, -14, 60]].forEach(([dx, dy, r], i) => leaf(dx, dy, 6.5, 3, r, ['#6FA287', '#7FAF8E', '#5E937A', '#8DBB9B'][i % 4]))
  }
}

// a tatami floor: mats with dark cloth edges, laid in the classic pattern
function tatami(d) {
  const mats = [[0, 0, 5, 2.5], [0, 2.5, 5, 2.5], [5, 0, 2.5, 5], [7.5, 0, 2.5, 5], [0, 5, 2.5, 5], [2.5, 5, 2.5, 5], [5, 5, 5, 2.5], [5, 7.5, 5, 2.5]]
  mats.forEach(([x, y, dx, dy], i) => {
    d.poly([[x, y, 0.005], [x + dx, y, 0.005], [x + dx, y + dy, 0.005], [x, y + dy, 0.005]], i % 2 ? '#D8CB9E' : '#D2C394')
    for (let k = 1; k < 12; k++) {
      if (dx >= dy) d.line([[x + (dx * k) / 12, y + 0.1, 0.006], [x + (dx * k) / 12, y + dy - 0.1, 0.006]], '#C4B484', 0.5, ' opacity=".5"')
      else d.line([[x + 0.1, y + (dy * k) / 12, 0.006], [x + dx - 0.1, y + (dy * k) / 12, 0.006]], '#C4B484', 0.5, ' opacity=".5"')
    }
    const e = 0.12
    if (dx >= dy) { d.poly([[x, y, 0.007], [x + dx, y, 0.007], [x + dx, y + e, 0.007], [x, y + e, 0.007]], '#4F5A3E'); d.poly([[x, y + dy - e, 0.007], [x + dx, y + dy - e, 0.007], [x + dx, y + dy, 0.007], [x, y + dy, 0.007]], '#4F5A3E') }
    else { d.poly([[x, y, 0.007], [x + e, y, 0.007], [x + e, y + dy, 0.007], [x, y + dy, 0.007]], '#4F5A3E'); d.poly([[x + dx - e, y, 0.007], [x + dx, y, 0.007], [x + dx, y + dy, 0.007], [x + dx - e, y + dy, 0.007]], '#4F5A3E') }
  })
}

/* ---------- the Japanese room ---------- */

// shoji: a fine wooden lattice over warm paper; in daylight, bamboo shadows fall on the paper
function shoji(d, side, u0, u1, z0, z1, wood, day) {
  const id = 'sj' + ++softN
  d.poly(quad(side, u0 - 0.16, u1 + 0.16, z0 - 0.12, z1 + 0.16, 0.02), shade(wood, -0.1))
  d.raw(`<clipPath id="${id}"><polygon points="${pts(quad(side, u0, u1, z0, z1, 0.03))}"/></clipPath><g clip-path="url(#${id})">`)
  d.poly(quad(side, u0, u1, z0, z1, 0.03), day ? '#FBF3E1' : '#F6DFAE')
  if (day) {
    // soft shadows of bamboo outside
    ;[u0 + 0.5, u0 + 1.6].forEach((u, i) => {
      d.poly([onWall(side, u, z0, 0.035), onWall(side, u + 0.1, z0, 0.035), onWall(side, u + 0.5, z1, 0.035), onWall(side, u + 0.4, z1, 0.035)], '#7B6A4E', ' opacity=".12"')
      for (let k = 0; k < 7; k++) {
        const c = P(...onWall(side, u + 0.1 + k * 0.06, z0 + 1.6 + k * 0.7 + i * 0.3, 0.035))
        d.raw(`<ellipse cx="${(c[0] + (k % 2 ? 5 : -5)).toFixed(1)}" cy="${c[1].toFixed(1)}" rx="5.5" ry="1.3" fill="#6B5B40" opacity=".12" transform="rotate(${k % 2 ? 20 : -25} ${c[0].toFixed(1)} ${c[1].toFixed(1)})"/>`)
      }
    })
  }
  d.raw('</g>')
  const bar = shade(wood, 0.08)
  for (let i = 1; i < 5; i++) { const u = u0 + ((u1 - u0) * i) / 5; d.poly(quad(side, u - 0.022, u + 0.022, z0, z1, 0.04), bar) }
  for (let j = 1; j < 10; j++) { const z = z0 + ((z1 - z0) * j) / 10; d.poly(quad(side, u0, u1, z - 0.022, z + 0.022, 0.04), bar) }
  d.poly(quad(side, u0 - 0.05, u1 + 0.05, z0 - 0.05, z0 + 0.55, 0.045), shade(wood, -0.02)) // the solid wooden kick panel
  if (!day) glowOnWall(d, side, (u0 + u1) / 2, (z0 + z1) / 2)
}
function glowOnWall(d, side, u, z) {
  const c = P(...onWall(side, u, z, 0.05))
  d.raw(`<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="38" ry="52" fill="url(#halo)" opacity=".55"/>`)
}
// fusuma: sliding paper doors with a soft ink painting of mountains and cranes across them
function fusuma(d, u0, u1, z0, z1) {
  const id = 'fs' + ++softN
  const frame = '#3E2A1E'
  d.poly(quad('right', u0 - 0.08, u1 + 0.08, z0, z1 + 0.08, 0.02), frame)
  d.raw(`<clipPath id="${id}"><polygon points="${pts(quad('right', u0, u1, z0 + 0.05, z1, 0.03))}"/></clipPath><g clip-path="url(#${id})">`)
  d.poly(quad('right', u0, u1, z0, z1, 0.03), '#F1E8D6')
  d.poly(quad('right', u0, u1, z1 - 1.6, z1, 0.031), '#E9D9B4', ' opacity=".7"')
  const m = (pts2, c, op) => d.poly(pts2.map(([u, z]) => onWall('right', u, z, 0.034)), c, ` opacity="${op}"`)
  m([[u0, z0 + 1.6], [u0 + 0.8, z0 + 3.4], [u0 + 1.5, z0 + 2.6], [u0 + 2.4, z0 + 4.2], [u0 + 3.3, z0 + 2.9], [u1, z0 + 3.6], [u1, z0], [u0, z0]], '#B9B3A6', '.55')
  m([[u0, z0 + 0.8], [u0 + 1.2, z0 + 2.2], [u0 + 2.0, z0 + 1.5], [u0 + 3.0, z0 + 2.6], [u1, z0 + 1.3], [u1, z0], [u0, z0]], '#8E897D', '.5')
  const sun = P(...onWall('right', u0 + 2.9, z0 + 5.0, 0.035))
  d.raw(`<circle cx="${sun[0].toFixed(1)}" cy="${sun[1].toFixed(1)}" r="7" fill="#D9705A" opacity=".75"/>`)
  ;[[u0 + 0.9, z0 + 5.2], [u0 + 1.4, z0 + 5.6], [u0 + 1.15, z0 + 4.9]].forEach(([u, z]) => { const c = P(...onWall('right', u, z, 0.036)); d.raw(`<path d="M${(c[0] - 3).toFixed(1)},${(c[1] + 1).toFixed(1)} q3,-3 3,0 q0,-3 3,0" stroke="#4A4538" stroke-width=".8" fill="none"/>`) })
  d.raw('</g>')
  const mid = (u0 + u1) / 2
  d.poly(quad('right', mid - 0.04, mid + 0.04, z0, z1, 0.04), frame)
  ;[mid - 0.4, mid + 0.4].forEach((u) => { const h = P(...onWall('right', u, z0 + 2.9, 0.045)); d.raw(`<ellipse cx="${h[0].toFixed(1)}" cy="${h[1].toFixed(1)}" rx="1.7" ry="2.5" fill="#2A1E16"/><ellipse cx="${h[0].toFixed(1)}" cy="${h[1].toFixed(1)}" rx="1" ry="1.6" fill="#8A6A48"/>`) })
}
// ranma: a carved wooden lattice panel above the doors
function ranma(d, side, u0, u1, z0, z1, wood) {
  d.poly(quad(side, u0, u1, z0, z1, 0.03), shade(wood, -0.25), ' opacity=".9"')
  const n = Math.round((u1 - u0) / 0.35)
  for (let i = 0; i <= n; i++) {
    const u = u0 + ((u1 - u0) * i) / n
    d.line([onWall(side, u, z0, 0.04), onWall(side, Math.min(u1, u + (z1 - z0) * 0.5), z1, 0.04)], shade(wood, 0.15), 0.7)
    d.line([onWall(side, u, z0, 0.04), onWall(side, Math.max(u0, u - (z1 - z0) * 0.5), z1, 0.04)], shade(wood, 0.15), 0.7)
  }
  d.poly(quad(side, u0, u1, z0 - 0.05, z0 + 0.05, 0.045), wood)
  d.poly(quad(side, u0, u1, z1 - 0.05, z1 + 0.05, 0.045), wood)
}
// a stand of bamboo in a glazed pot; more stalks as your diary streak grows
function bamboo(d, x, y, n) {
  const b = P(x, y, 0)
  d.raw(`<ellipse cx="${b[0].toFixed(1)}" cy="${(b[1] + 1).toFixed(1)}" rx="13" ry="4.5" fill="#2a1f18" opacity=".22" filter="url(#soft)"/>`)
  d.cylinder(x, y, 0, 0.45, 0.8, '#2F4A5A')
  d.ring(x, y, 0.81, 0.4, '#3B2E24')
  const t = P(x, y, 0.8)
  const stalks = [[-4, 78], [2, 92], [6, 70], [-1, 60], [-6, 66], [4, 84]].slice(0, Math.max(3, Math.min(n, 6)))
  stalks.forEach(([dx, h], i) => {
    const x0 = t[0] + dx, y0 = t[1]
    d.raw(`<path d="M${x0},${y0} L${x0 + dx * 0.2},${y0 - h}" stroke="${i % 2 ? '#8AA65A' : '#9CB86A'}" stroke-width="2.2" stroke-linecap="round"/>`)
    for (let k = 1; k < 6; k++) d.raw(`<path d="M${(x0 + dx * 0.2 * (k / 6) - 1.4).toFixed(1)},${(y0 - (h * k) / 6).toFixed(1)} h2.8" stroke="#6E8A44" stroke-width="1"/>`)
    for (let k = 2; k < 6; k++) {
      const lx = x0 + dx * 0.2 * (k / 6), ly = y0 - (h * k) / 6 - 2, s = (k + i) % 2 ? 1 : -1
      d.raw(`<path d="M${lx.toFixed(1)},${ly.toFixed(1)} q${s * 6},${-2} ${s * 12},${3} q${-s * 6},${-1} ${-s * 12},${-3}z" fill="${k % 2 ? '#7E9E52' : '#94B562'}"/>`)
      d.raw(`<path d="M${lx.toFixed(1)},${(ly - 3).toFixed(1)} q${-s * 5},${-3} ${-s * 10},${1} q${s * 5},${0} ${s * 10},${-1}z" fill="#88A85A"/>`)
    }
  })
}
function pineBonsai(d, x, y, z) {
  const b = P(x, y, z)
  d.raw(`<path d="M${b[0] - 9},${b[1] - 2} h18 l-2,4 h-14 z" fill="#2F4A5A"/><ellipse cx="${b[0]}" cy="${b[1] - 2}" rx="9" ry="2.2" fill="#3A5A6C"/>`)
  d.raw(`<path d="M${b[0]},${b[1] - 3} q-2,-6 3,-10 q5,-4 1,-9 q-3,-4 2,-7" stroke="#5A3C28" stroke-width="2.4" fill="none" stroke-linecap="round"/>`)
  ;[[-7, -12, 9, 3.4], [7, -18, 8, 3], [-2, -26, 7, 2.8], [9, -27, 5, 2.2]].forEach(([dx, dy, rx, ry]) => {
    d.raw(`<ellipse cx="${b[0] + dx}" cy="${b[1] + dy}" rx="${rx}" ry="${ry}" fill="#4E7F5E"/><ellipse cx="${b[0] + dx - 1}" cy="${b[1] + dy - 1.2}" rx="${rx * 0.75}" ry="${ry * 0.55}" fill="#6B9C76"/>`)
  })
}
function ikebana(d, x, y, z) {
  const b = P(x, y, z)
  d.raw(`<path d="M${b[0] - 3},${b[1]} q-1,-6 1,-9 h4 q2,3 1,9 z" fill="#E9E1D3"/><ellipse cx="${b[0]}" cy="${b[1] - 9}" rx="2.6" ry="1" fill="#CFC6B6"/>`)
  d.raw(`<path d="M${b[0]},${b[1] - 9} q-6,-12 -14,-16 M${b[0]},${b[1] - 9} q4,-14 10,-20" stroke="#4A3A2A" stroke-width=".9" fill="none"/>`)
  ;[[-14, -25], [-10, -21], [-6, -18], [10, -29], [7, -24], [5, -19]].forEach(([dx, dy], i) => d.raw(`<circle cx="${b[0] + dx}" cy="${b[1] + dy}" r="${i % 3 ? 1.7 : 2.2}" fill="${i % 2 ? '#F4C6D0' : '#FBE3E8'}"/>`))
}
function teaSet(d, x, y, z) {
  const t = P(x, y, z)
  d.raw(`<ellipse cx="${t[0]}" cy="${t[1]}" rx="9" ry="3.4" fill="#3E2A1E" opacity=".9"/>`)
  d.raw(`<path d="M${t[0] - 4},${t[1] - 1} q-1,-6 4,-6 q5,0 4,6 z" fill="#2C2F33"/><path d="M${t[0] + 4},${t[1] - 4} q4,-1 5,-4" stroke="#2C2F33" stroke-width="1.4" fill="none"/><path d="M${t[0] - 3},${t[1] - 7} q3,-4 6,0" stroke="#2C2F33" stroke-width=".9" fill="none"/>`)
  ;[[-10, 3], [9, 4]].forEach(([dx, dy]) => d.raw(`<path d="M${t[0] + dx - 2.6},${t[1] + dy - 3} h5.2 l-.8,3.4 h-3.6 z" fill="#E6DCCB"/><ellipse cx="${t[0] + dx}" cy="${t[1] + dy - 3}" rx="2.6" ry=".9" fill="#9DB07A"/>`))
}

function japaneseScene(S) {
  const { d, room, sky, spots, G, E, glow, books, notes, events, diaryToday, leaves, blanket } = S
  const wood = '#9A6A44', dark = '#3E2A1E', day = !sky.lights
  G('floor'); tatami(d)
  // a polished wooden strip along the shoji side
  d.poly([[0, 6.3, 0.008], [0.9, 6.3, 0.008], [0.9, 10, 0.008], [0, 10, 0.008]], '#B88A5E')
  for (let i = 1; i < 4; i++) d.line([[i * 0.22, 6.3, 0.009], [i * 0.22, 10, 0.009]], '#9A6E46', 0.5, ' opacity=".6"')
  E()
  // posts and the rail that runs round the room
  const post = (x, y) => d.box(x, y, 0, 0.24, 0.24, 9, [shade(wood, 0.12), wood, shade(wood, -0.14)])
  post(0, 0); post(0, 3.6); post(0, 6.3); post(0, 9.6); post(5.3, 0); post(9.6, 0)
  ranma(d, 'left', 0.24, 3.6, 7.25, 8.7, wood); ranma(d, 'left', 3.84, 6.3, 7.25, 8.7, wood); ranma(d, 'left', 6.54, 9.6, 7.25, 8.7, wood)
  ranma(d, 'right', 0.24, 5.3, 7.25, 8.7, wood); ranma(d, 'right', 5.54, 9.6, 7.25, 8.7, wood)
  d.box(0, 0, 6.95, 0.22, 10, 0.3, [shade(wood, 0.12), wood, shade(wood, -0.14)])
  d.box(0, 0, 6.95, 10, 0.22, 0.3, [shade(wood, 0.12), wood, shade(wood, -0.14)])
  // the shoji on the left wall, and fusuma with an ink painting on the right
  shoji(d, 'left', 6.65, 9.4, 0.15, 6.8, wood, day)
  fusuma(d, 5.65, 9.5, 0.05, 6.9)
  // the tokonoma: a raised alcove with a hanging scroll and an ikebana
  d.poly(quad('left', 3.84, 6.3, 0, 6.95, 0.025), shade(room.wall === 'cream' ? '#EFE6D6' : WALLS[room.wall]?.l[1] || '#EFE6D6', -0.06))
  d.box(0, 3.85, 0, 1.0, 2.45, 0.32, [shade(dark, 0.3), shade(dark, 0.1), dark])
  G('art'); art(d, room.art || 'plants', 'left', 4.55, 5.55, 2.0, 6.2, '#D8CBB0'); spots.art = bounds([[0, 4.4, 1.8], [0, 5.7, 1.8], [0, 5.7, 6.4], [0, 4.4, 6.4]], 1); E()
  const rod = P(...onWall('left', 5.05, 6.35, 0.05)); d.raw(`<path d="M${(rod[0] - 10).toFixed(1)},${(rod[1] + 5).toFixed(1)} l20,-11" stroke="${dark}" stroke-width="1.6"/>`)
  ikebana(d, 0.5, 4.5, 0.32)
  // the bookcase in the far corner
  G('shelf'); spots.shelf = bookcase(d, { y0: 0.45, len: 2.8, depth: 1.05, h: 3.4, levels: [0.25, 1.3, 2.35], wood: dark, books }); E()
  // a tansu chest with iron handles, a pine bonsai and a small vase; notes hang above on ema plaques
  d.box(2.3, 0.05, 0, 2.9, 1.05, 1.5, [shade(dark, 0.22), shade(dark, 0.08), dark])
  ;[0.2, 0.85].forEach((z) => { d.poly([[2.45, 1.11, z], [5.05, 1.11, z], [5.05, 1.11, z + 0.55], [2.45, 1.11, z + 0.55]], shade(dark, 0.14)); ;[3.1, 4.4].forEach((x) => { const k = P(x, 1.12, z + 0.28); d.raw(`<path d="M${(k[0] - 2.6).toFixed(1)},${(k[1] - 0.6).toFixed(1)} q2.6,3 5.2,0" stroke="#1E1610" stroke-width="1.2" fill="none"/>`) }) })
  pineBonsai(d, 3.2, 0.55, 1.5)
  moodJar(S, 4.6, 0.55, 1.5)
  d.line([onWall('right', 1.9, 6.15, 0.05), onWall('right', 5.1, 6.15, 0.05)], dark, 1.2)
  ;[0, 1, 2, 3, 4, 5].slice(0, Math.max(2, Math.min(notes + 1, 6))).forEach((i) => {
    const u = 2.05 + i * 0.5, z = 5.05 + (i % 2) * 0.2
    d.line([onWall('right', u + 0.22, 6.15, 0.05), onWall('right', u + 0.22, z + 0.7, 0.05)], '#B4475D', 0.5)
    d.poly([onWall('right', u, z, 0.06), onWall('right', u + 0.45, z, 0.06), onWall('right', u + 0.45, z + 0.5, 0.06), onWall('right', u + 0.22, z + 0.7, 0.06), onWall('right', u, z + 0.5, 0.06)], '#DCC08E')
    d.line([onWall('right', u + 0.1, z + 0.3, 0.07), onWall('right', u + 0.35, z + 0.3, 0.07)], '#7A5236', 0.5)
  })
  spots.board = bounds([[1.9, 0, 4.9], [5.1, 0, 4.9], [5.1, 0, 6.3], [1.9, 0, 6.3]], 3)
  // daylight from the shoji on the tatami
  if (day) d.poly([[0.2, 6.7, 0.012], [0.2, 9.3, 0.012], [3.4, 9.8, 0.012], [3.6, 7.1, 0.012]], '#FFF3D2', ' opacity=".28"')
  spots.rug = bounds([[3.2, 4.2, 0], [7.2, 4.2, 0], [7.2, 8.0, 0], [3.2, 8.0, 0]], 0)
  G('rug'); E()
  // the futon, laid out in front of the fusuma (opens the Diary)
  G('bed')
  d.shadow(6.6, 0.7, 9.8, 4.6, 0.12)
  soft(d, 6.7, 0.75, 0, 3.0, 3.65, 0.42, ['#FBF8F2', '#EFE9DF', '#E1D9CC'], 0.3)
  soft(d, 7.4, 0.9, 0.42, 1.6, 0.7, 0.3, ['#FFFFFF', '#F3EFE8', '#E5DFD5'], 0.3, 1)
  duvet(d, 6.72, 1.8, 9.68, 4.38, 0.5, 0.4, blanket)
  openDiary(d, 7.35, 2.55, 0.6, diaryToday)
  livePet(S, { bed: [8.95, 3.05, 0.6], floor: [7.6, 7.6] })
  spots.bed = bounds([[6.6, 0.6, 0], [9.8, 0.6, 0], [9.8, 4.6, 0], [6.6, 4.6, 0], [6.6, 0.6, 1.2]], 0)
  E()
  const cc = (FABRICS[room.chairColor] || FABRICS.peach).c
  G('chair')
  soft(d, 1.7, 4.9, 0, 1.15, 1.2, 0.24, [shade(cc, 0.12), cc, shade(cc, -0.14)], 0.25, 1)
  E()
  // the kotatsu: a low table under a quilt, with a cast-iron teapot and the calendar (opens the Calendar)
  G('desk')
  d.shadow(3.0, 4.4, 7.4, 8.2, 0.16)
  const q = blanket
  d.raw(`<defs><pattern id="asanoha" patternUnits="userSpaceOnUse" width=".8" height=".8" patternTransform="${ISO.floor}"><rect width=".8" height=".8" fill="${q}"/><path d="M0,0 L.8,.8 M.8,0 L0,.8 M.4,0 V.8 M0,.4 H.8" stroke="#FFFFFF" stroke-width=".025" opacity=".35"/></pattern></defs>`)
  d.poly([[3.25, 4.55, 0.02], [7.15, 4.55, 0.02], [7.45, 7.95, 0.02], [3.05, 8.15, 0.02]], 'url(#asanoha)', ' opacity=".95"')
  soft(d, 3.6, 4.9, 0, 3.2, 2.7, 0.95, [shade(q, 0.08), shade(q, -0.02), shade(q, -0.14)], 0.45)
  d.box(3.7, 5.0, 0.95, 3.0, 2.5, 0.12, [shade(dark, 0.35), shade(dark, 0.15), dark])
  teaSet(d, 4.7, 6.4, 1.07)
  // a standing calendar at the back of the table, where you can see it
  calendarFront(d, 5.55, 6.4, 5.45, 1.07, 1.35, events)
  spots.desk = tagAt(bounds([[3.0, 4.4, 0], [7.4, 4.4, 0], [7.4, 8.2, 0], [3.0, 8.2, 0], [5.55, 5.45, 2.6]], 2), [5.95, 5.45, 3.1])
  E()
  // a zabuton cushion in front of the table
  G('chair')
  soft(d, 4.5, 8.5, 0, 1.25, 1.15, 0.24, [shade(cc, 0.12), cc, shade(cc, -0.14)], 0.25, 1)
  spots.chair = bounds([[4.4, 8.4, 0], [5.8, 8.4, 0], [5.8, 9.7, 0], [4.4, 9.7, 0], [4.4, 8.4, 0.6]], 2)
  E()
  // an andon lantern with a dark wooden frame, in the corner by the futon
  const lx = 9.0, ly = 6.0
  ;[[lx, ly], [lx + 0.55, ly], [lx, ly + 0.55]].forEach(([x, y]) => d.box(x, y, 0, 0.12, 0.12, 1.9, dark))
  d.box(lx + 0.05, ly + 0.05, 0.2, 0.55, 0.55, 1.6, ['#F7EEDC', day ? '#F4EBD9' : '#FFE6AE', day ? '#E9DEC9' : '#F8D898'])
  d.box(lx + 0.55, ly + 0.55, 0, 0.12, 0.12, 1.9, dark)
  d.box(lx - 0.03, ly - 0.03, 1.9, 0.72, 0.72, 0.08, dark)
  if (!day) { const an = P(lx + 0.3, ly + 0.3, 1.0); glow(an[0], an[1], 44) }
  bamboo(d, 1.15, 9.15, 2 + Math.round(leaves / 2))
}

/* ---------- the plant room ---------- */

function plantScene(S) {
  const { d, room, sky, spots, G, E, glow, books, notes, events, diaryToday, leaves, blanket, shelfWood, deskWood, bedWood, rug } = S
  const wood = room.shelfWood === 'oak' ? '#C89B6A' : shelfWood
  const bw = room.bedWood === 'oak' ? '#C89B6A' : bedWood
  const dw = room.deskWood === 'oak' ? '#C89B6A' : deskWood
  // big garden windows on the right wall
  const x0 = 3.6, x1 = 9.8, z0 = 2.4, z1 = 8.6
  d.poly(quad('right', x0 - 0.15, x1, z0 - 0.15, z1 + 0.15, 0.02), shade(wood, 0.05))
  d.raw(`<clipPath id="gardenw"><polygon points="${pts(quad('right', x0, x1, z0, z1, 0.03))}"/></clipPath><g clip-path="url(#gardenw)">`)
  d.poly(quad('right', x0, x1, z0, z1, 0.03), 'url(#sky)')
  d.poly([onWall('right', x0, z0, 0.04), onWall('right', x0, 4.2, 0.04), onWall('right', 5.2, 4.9, 0.04), onWall('right', 6.9, 4.3, 0.04), onWall('right', 8.4, 5.1, 0.04), onWall('right', x1, 4.5, 0.04), onWall('right', x1, z0, 0.04)], '#9DC4A0', ' opacity=".9"')
  ;[4.2, 5.8, 7.4, 9.1].forEach((u, i) => { const c = P(...onWall('right', u, 4.7 + (i % 2) * 0.5, 0.05)); d.raw(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${10 + (i % 2) * 4}" fill="#7FB08A" opacity=".8"/>`) })
  d.flushWeather()
  d.raw('</g>')
  if (S.photo) wallImage(d, x0, x1, z0, z1, S.photo)
  spots.window = bounds([[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], 1)
  ;[5.65, 7.7].forEach((u) => d.poly(quad('right', u - 0.08, u + 0.08, z0, z1, 0.05), shade(wood, 0.05)))
  d.poly(quad('right', x0, x1, 6.1, 6.25, 0.05), shade(wood, 0.05))
  // two macramé planters hanging in the window
  ;[5.0, 8.7].forEach((x) => {
    const top = P(x, 0.7, 8.9), pot = P(x, 0.7, 7.0)
    d.raw(`<path d="M${top[0].toFixed(1)},${top[1].toFixed(1)} L${(pot[0] - 5).toFixed(1)},${(pot[1] - 3).toFixed(1)} M${top[0].toFixed(1)},${top[1].toFixed(1)} L${(pot[0] + 5).toFixed(1)},${(pot[1] - 3).toFixed(1)} M${top[0].toFixed(1)},${top[1].toFixed(1)} L${pot[0].toFixed(1)},${(pot[1] - 3).toFixed(1)}" stroke="#C9B79A" stroke-width=".7"/>`)
    d.raw(`<path d="M${(pot[0] - 6).toFixed(1)},${(pot[1] - 3).toFixed(1)} h12 l-2,6 h-8 z" fill="#E9DCC8"/>`)
    for (let i = 0; i < 8; i++) d.raw(`<ellipse cx="${(pot[0] + (i % 2 ? 5 : -5) + ((i % 3) - 1) * 1.5).toFixed(1)}" cy="${(pot[1] + 2 + i * 3).toFixed(1)}" rx="3" ry="1.7" fill="${i % 2 ? '#6FA287' : '#8DBB9B'}"/>`)
  })
  // the board: a picture above the bed and notes on a string with clips
  G('art'); art(d, room.art || 'plants', 'left', 3.2, 4.8, 4.4, 6.0, '#E6D3B5'); spots.art = bounds([[0, 3.0, 4.2], [0, 5.0, 4.2], [0, 5.0, 6.2], [0, 3.0, 6.2]], 1); E()
  d.line([onWall('left', 6.2, 6.7, 0.05), onWall('left', 9.2, 6.5, 0.05)], '#8C7A66', 0.8)
  ;[0, 1, 2, 3, 4].slice(0, Math.max(2, Math.min(notes + 1, 5))).forEach((i) => {
    const u = 6.4 + i * 0.58, z = 5.7
    d.poly([onWall('left', u, z, 0.06), onWall('left', u + 0.48, z, 0.06), onWall('left', u + 0.48, z + 0.72, 0.06), onWall('left', u, z + 0.72, 0.06)], ['#FBE7A6', '#D8EBD9', '#F7CFD9', '#CFE4F5', '#FFFFFF'][i])
    d.line([onWall('left', u + 0.24, z + 0.6, 0.07), onWall('left', u + 0.24, z + 0.95, 0.07)], '#B08A5A', 1.2)
  })
  spots.board = bounds([[0, 6.2, 5.5], [0, 9.3, 5.5], [0, 9.3, 6.9], [0, 6.2, 6.9]], 3)
  // ivy climbing in the corner
  for (let i = 0; i < 16; i++) { const c = P(...onWall('left', 0.35 + (i % 3) * 0.18, 0.4 + i * 0.5, 0.06)); d.raw(`<ellipse cx="${(c[0] + (i % 2 ? 3 : -3)).toFixed(1)}" cy="${c[1].toFixed(1)}" rx="3.2" ry="2" fill="${i % 2 ? '#6FA287' : '#8DBB9B'}" transform="rotate(${i % 2 ? 30 : -30} ${c[0].toFixed(1)} ${c[1].toFixed(1)})"/>`) }
  // rug in the middle of the room
  spots.rug = bounds([[4.6, 4.0, 0], [8.8, 4.0, 0], [8.8, 7.8, 0], [4.6, 7.8, 0]], 0)
  G('rug')
  d.poly([[4.6, 4.0, 0.01], [8.8, 4.0, 0.01], [8.8, 7.8, 0.01], [4.6, 7.8, 0.01]], room.rug === 'pink' || !rug ? '#A9CDB4' : rug)
  d.poly([[4.9, 4.3, 0.015], [8.5, 4.3, 0.015], [8.5, 7.5, 0.015], [4.9, 7.5, 0.015]], 'none', ' stroke="#FFFFFF" stroke-width=".9" opacity=".5"')
  ;[[5.8, 5.2], [7.4, 6.4], [6.2, 6.9], [7.8, 5.0]].forEach(([x, y]) => d.ring(x, y, 0.02, 0.32, '#FFFFFF', ' opacity=".3"', 12))
  E()
  // a dresser in the back corner with the calendar (opens the Calendar)
  G('desk')
  d.shadow(0.9, 0, 3.3, 1.3, 0.14)
  d.box(1.0, 0.05, 0, 2.2, 1.05, 2.2, [shade(dw, 0.18), dw, shade(dw, -0.12)])
  ;[0.22, 0.9, 1.55].forEach((z) => { d.poly([[1.15, 1.11, z], [3.05, 1.11, z], [3.05, 1.11, z + 0.52], [1.15, 1.11, z + 0.52]], shade(dw, -0.04)); const k = P(2.1, 1.12, z + 0.26); d.raw(`<ellipse cx="${k[0].toFixed(1)}" cy="${k[1].toFixed(1)}" rx="2" ry="1" fill="#8A6A48"/>`) })
  calendarFront(d, 2.35, 3.0, 0.9, 2.2, 0.95, events)
  moodJar(S, 2.05, 0.45, 2.2)
  d.cylinder(1.5, 0.5, 2.2, 0.28, 0.38, '#F2EBDD')
  const pp = P(1.5, 0.5, 2.58); ;[[-6, -6], [6, -7], [0, -12], [-3, -16], [4, -15]].forEach(([dx, dy], i) => d.raw(`<ellipse cx="${(pp[0] + dx).toFixed(1)}" cy="${(pp[1] + dy).toFixed(1)}" rx="5" ry="2.6" fill="${i % 2 ? '#6FA287' : '#8DBB9B'}" transform="rotate(${dx * 6} ${(pp[0] + dx).toFixed(1)} ${(pp[1] + dy).toFixed(1)})"/>`))
  spots.desk = tagAt(bounds([[1.0, 0, 0], [3.2, 0, 0], [3.2, 1.2, 0], [1.0, 1.2, 0], [1.0, 0, 3.4], [3.2, 1.2, 3.3]], 2), [2.65, 0.9, 3.45])
  E()
  // the long low bookcase under the window, with plants on top (opens Books)
  G('shelf')
  let placed = 0
  d.shadow(4.0, 0, 9.8, 1.6, 0.14)
  d.box(4.1, 0.05, 0, 5.6, 1.3, 2.1, [shade(wood, 0.2), wood, shade(wood, -0.12)])
  d.poly([[4.25, 1.36, 0.15], [9.55, 1.36, 0.15], [9.55, 1.36, 1.95], [4.25, 1.36, 1.95]], shade(wood, -0.3))
  d.box(4.1, 0.05, 1.0, 5.6, 1.3, 0.1, shade(wood, 0.08))
  ;[[0.18, 0], [1.1, 1]].forEach(([z, si]) => {
    let x = 4.35, k = si * 3
    while (x < 9.4) {
      const w = [0.24, 0.3, 0.27, 0.33, 0.25][k % 5]
      if (placed < books) {
        const h = [0.72, 0.65, 0.78, 0.58, 0.7][k % 5]
        d.box(x, 0.25, z, w, 1.05, h, bookAt(placed, BOOK_COLORS[(placed * 3 + si) % BOOK_COLORS.length]))
        noteBook(placed, [[x, 0.25, z], [x + w, 1.3, z], [x, 1.3, z + h], [x + w, 0.25, z + h]])
        placed++
      }
      x += w + 0.04; k++
    }
  })
  ;[[4.8, 'flower'], [6.3, 'trail'], [7.8, 'succulent'], [9.2, 'snake']].forEach(([x, kind], i) => {
    const lift = P(x, 0.6, 2.1)[1] - P(x, 0.6, 0)[1]
    d.raw(`<g transform="translate(0 ${lift.toFixed(1)})">`)
    pottedPlant(d, x, 0.6, kind, 0.8, ['#D98F72', '#F2EBDD', '#E9C46A', '#F2EBDD'][i])
    d.raw('</g>')
  })
  spots.shelf = bounds([[4.1, 0, 0], [9.7, 0, 0], [9.7, 1.4, 0], [4.1, 1.4, 0], [4.1, 0, 3.4], [9.7, 1.4, 3.0]], 0)
  E()
  // a wooden bed against the left wall, with a side table and a lamp (opens the Diary)
  G('bed')
  const by0 = 2.4, by1 = 5.7, bx1 = 4.1
  d.shadow(0, by0 - 0.1, bx1 + 0.2, by1 + 0.2, 0.18)
  d.box(0, by0, 0, 0.3, by1 - by0, 2.9, [shade(bw, 0.2), bw, shade(bw, -0.12)])
  ;[0.5, 1.15, 1.8, 2.45].forEach((t) => d.line([[0.31, by0 + t, 0.9], [0.31, by0 + t, 2.7]], shade(bw, -0.15), 0.8))
  d.box(0.3, by0, 0, bx1 - 0.3, by1 - by0, 0.85, [shade(bw, 0.2), bw, shade(bw, -0.12)])
  soft(d, 0.35, by0 + 0.06, 0.85, bx1 - 0.4, by1 - by0 - 0.12, 0.62, ['#FFFFFF', '#F2EEE6', '#E4DED3'], 0.3)
  const mt = 1.47
  soft(d, 0.45, by0 + 0.2, mt, 0.95, 1.4, 0.48, ['#FFFFFF', '#F4F0EA', '#E6E0D6'], 0.38, 2)
  soft(d, 0.45, by0 + 1.7, mt, 0.95, 1.4, 0.48, ['#FFFFFF', '#F4F0EA', '#E6E0D6'], 0.38, 2)
  duvet(d, 1.5, by0 + 0.1, bx1 - 0.02, by1 - 0.03, mt + 0.08, 0.72, blanket)
  openDiary(d, 2.1, by0 + 0.9, mt + 0.12, diaryToday)
  livePet(S, { bed: [3.4, by0 + 2.3, mt + 0.12], floor: [6.9, 6.4], sill: [6.6, 0.3, 2.45] })
  nightstand(d, 0.15, 6.05, bw, sky.lights, glow, '#C9C2B6')
  spots.bed = bounds([[0, by0 - 0.1, 0], [bx1 + 0.2, by0 - 0.1, 0], [bx1 + 0.2, by1 + 0.2, 0], [0, by1 + 0.2, 0], [0, by0, 3.0]], 0)
  E()
  // a low wooden bench in front of the rug (somewhere to sit)
  G('chair')
  d.shadow(5.2, 8.3, 7.4, 9.3, 0.12)
  ;[[5.35, 8.45], [7.05, 8.45], [5.35, 9.0], [7.05, 9.0]].forEach(([x, y]) => d.box(x, y, 0, 0.14, 0.14, 0.55, shade(bw, -0.2)))
  d.box(5.3, 8.4, 0.55, 2.0, 0.8, 0.14, [shade(bw, 0.2), bw, shade(bw, -0.12)])
  soft(d, 5.45, 8.5, 0.69, 1.7, 0.6, 0.16, ['#F2E6CF', '#E6D7BA', '#D7C6A6'], 0.2)
  spots.chair = bounds([[5.2, 8.3, 0], [7.4, 8.3, 0], [7.4, 9.3, 0], [5.2, 9.3, 0], [5.2, 8.3, 1.0]], 2)
  E()
  // plants, each with its own spot on the floor
  ;[[1.4, 8.4, 'leafy', 1.2, '#D98F72'], [3.3, 9.3, 'snake', 1.2, '#F2EBDD'], [9.2, 8.9, 'flower', 1.0, '#C97F62'], [9.3, 6.4, 'trail', 1.0, '#E0A589']].forEach(([x, y, kind, k, c]) => pottedPlant(d, x, y, kind, k, c))
  plant(d, 9.1, 2.7, leaves)
  if (sky.beam) d.poly([[4.0, 1.5, 0.02], [9.6, 1.5, 0.02], [8.4, 6.6, 0.02], [2.8, 6.6, 0.02]], 'url(#beam)')
}

/* ---------- the lo-fi study: a desk by a big window at dusk ---------- */

function headphones(d, x, y, z) {
  const c = P(x, y, z)
  d.raw(`<path d="M${c[0] - 7},${c[1] - 1} q7,-12 14,0" stroke="#3A3350" stroke-width="2" fill="none"/><ellipse cx="${c[0] - 7}" cy="${c[1]}" rx="3" ry="3.6" fill="#E07A8F"/><ellipse cx="${c[0] + 7}" cy="${c[1]}" rx="3" ry="3.6" fill="#E07A8F"/>`)
}
function mug(d, x, y, z, color, steam) {
  d.cylinder(x, y, z, 0.2, 0.42, color)
  const m = P(x, y, z + 0.5)
  if (steam) d.raw(`<path d="M${(m[0] - 1.5).toFixed(1)},${(m[1] - 2).toFixed(1)} q2,-4 0,-8 M${(m[0] + 2).toFixed(1)},${(m[1] - 2).toFixed(1)} q2,-4 0,-8" fill="none" stroke="#FFF" stroke-opacity=".7" stroke-width="1"/>`)
}
function recordPlayer(d, x, y, z, wood) {
  d.box(x, y, z, 1.2, 1.1, 0.28, [shade(wood, 0.2), wood, shade(wood, -0.12)])
  const c = P(x + 0.55, y + 0.55, z + 0.29)
  d.raw(`<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="8.5" ry="4.6" fill="#1E1B26"/><ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="5.5" ry="3" fill="none" stroke="#3A3546" stroke-width=".6"/><ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="2.2" ry="1.2" fill="#E07A8F"/>`)
  d.raw(`<path d="M${(c[0] + 9).toFixed(1)},${(c[1] - 3).toFixed(1)} l-5,4" stroke="#C9C2D2" stroke-width="1.2" stroke-linecap="round"/>`)
}

function lofiScene(S) {
  const { d, room, sky, spots, G, E, glow, books, notes, events, diaryToday, leaves, blanket, shelfWood, deskWood, bedWood } = S
  const dk = room.deskWood === 'oak' ? '#8A5E40' : deskWood
  const sw = room.shelfWood === 'oak' ? '#7A5238' : shelfWood
  // the big window, the city at dusk outside
  cityWindow(d, sky, blanket, 2.9, 8.5, 2.9, 8.1, false, S.photo)
  spots.window = bounds([[2.9, 0, 2.9], [8.5, 0, 2.9], [8.5, 0, 8.1], [2.9, 0, 8.1]], 1)
  // fairy lights along the top of the window
  const fl = []
  for (let i = 0; i <= 14; i++) fl.push([2.8 + i * 0.41, 0.15, 8.35 - 0.3 * Math.sin((Math.PI * i) / 7)])
  d.line(fl, '#6E5A4A', 0.8)
  fl.slice(1, -1).forEach((l, i) => { const p = P(...l); d.raw(`<circle cx="${p[0].toFixed(1)}" cy="${(p[1] + 2).toFixed(1)}" r="7" fill="url(#halo)"/><circle class="twinkle" style="animation-delay:${((i % 5) * 0.3).toFixed(1)}s" cx="${p[0].toFixed(1)}" cy="${(p[1] + 2).toFixed(1)}" r="1.8" fill="${['#FFE29A', '#FFC9A8', '#FFE7C2'][i % 3]}"/>`) })
  // a hanging plant in the window
  const hp = P(7.7, 0.6, 8.6), pot = P(7.7, 0.6, 6.8)
  d.raw(`<path d="M${hp[0].toFixed(1)},${hp[1].toFixed(1)} L${(pot[0] - 5).toFixed(1)},${(pot[1] - 3).toFixed(1)} M${hp[0].toFixed(1)},${hp[1].toFixed(1)} L${(pot[0] + 5).toFixed(1)},${(pot[1] - 3).toFixed(1)}" stroke="#8C7A66" stroke-width=".6"/><path d="M${(pot[0] - 6).toFixed(1)},${(pot[1] - 3).toFixed(1)} h12 l-2,6 h-8 z" fill="#D98F72"/>`)
  for (let i = 0; i < 8; i++) d.raw(`<ellipse cx="${(pot[0] + (i % 2 ? 5 : -5)).toFixed(1)}" cy="${(pot[1] + 2 + i * 3).toFixed(1)}" rx="3" ry="1.7" fill="${i % 2 ? '#5E8F6E' : '#7AA886'}"/>`)
  // posters and the notes board on the left wall
  G('art'); art(d, room.art || 'moon', 'left', 4.3, 5.7, 4.2, 6.2, '#2E2A40'); spots.art = bounds([[0, 4.1, 4.0], [0, 5.9, 4.0], [0, 5.9, 6.4], [0, 4.1, 6.4]], 1); E()
  d.poly(quad('left', 6.4, 9.2, 4.6, 6.6, 0.02), '#6B4E3A')
  d.poly(quad('left', 6.52, 9.08, 4.72, 6.48, 0.025), '#B58C66')
  ;[[6.7, 5.5, '#FBE7A6', -4], [7.5, 5.7, '#F7CFD9', 5], [8.3, 5.4, '#CFE4F5', -3], [6.9, 4.85, '#D8EBD9', 3], [7.8, 4.9, '#FFFFFF', -5], [8.5, 4.85, '#FBE7A6', 4]].slice(0, Math.max(2, Math.min(notes + 1, 6))).forEach(([u, z, c]) => {
    d.poly(quad('left', u, u + 0.6, z, z + 0.62, 0.03), c)
    const pin = P(...onWall('left', u + 0.3, z + 0.52, 0.04)); d.raw(`<circle cx="${pin[0].toFixed(1)}" cy="${pin[1].toFixed(1)}" r="1.4" fill="#C2556B"/>`)
  })
  spots.board = bounds([[0, 6.4, 4.6], [0, 9.2, 4.6], [0, 9.2, 6.6], [0, 6.4, 6.6]], 3)
  // a warm rug
  spots.rug = bounds(Array.from({ length: 24 }, (_, i) => [5.6 + 2.2 * Math.cos((Math.PI * i) / 12), 6.2 + 1.9 * Math.sin((Math.PI * i) / 12), 0]), 0)
  G('rug')
  const rc = room.rug === 'none' ? null : '#E9B98A'
  if (rc) { d.ring(5.6, 6.2, 0.01, 2.2, rc); d.ring(5.6, 6.2, 0.02, 1.7, '#D99A6C'); d.ring(5.6, 6.2, 0.03, 1.1, rc); d.ring(5.6, 6.2, 0.04, 0.5, '#D99A6C') }
  E()
  // a full bookcase in the corner, with a record player on top (opens Books)
  G('shelf'); spots.shelf = bookcase(d, { y0: 0.4, len: 2.9, depth: 1.25, h: 4.4, levels: [0.25, 1.3, 2.35, 3.4], wood: sw, books }); E()
  recordPlayer(d, 0.05, 1.3, 4.52, '#C9A57E')
  // the desk under the window: lamp, books, notebook, tea, headphones, the calendar (opens the Calendar)
  G('desk')
  wallDesk(d, { x0: 2.6, x1: 8.8, depth: 2.0, top: 2.5, wood: dk, drawers: 'left' })
  deskLamp(d, 3.1, 0.5, 2.5, sky.lights, glow, '#E07A5F')
  if (sky.beam) d.poly([[3.0, 2.0, 0.02], [8.4, 2.0, 0.02], [7.2, 7.6, 0.02], [1.8, 7.6, 0.02]], 'url(#beam)')
  ;[0, 1, 2, 3, 4].forEach((i) => d.box(4.0 + i * 0.22, 0.15, 2.5, 0.2, 0.75, 0.7 + (i % 3) * 0.12, BOOK_COLORS[(i * 2 + 1) % BOOK_COLORS.length]))
  d.box(4.0, 1.1, 2.5, 0.9, 0.6, 0.12, '#7FA3C8'); d.box(4.05, 1.15, 2.62, 0.8, 0.5, 0.1, '#E9C46A')
  openDiary(d, 5.3, 0.9, 2.52, true)
  headphones(d, 6.5, 1.5, 2.55)
  mug(d, 7.0, 0.7, 2.5, '#F2EBDD', true)
  calendarFront(d, 7.6, 8.3, 1.65, 2.5, 1.15, events)
  spots.desk = tagAt(bounds([[2.6, 0, 0], [8.8, 0, 0], [8.8, 2.0, 0], [2.6, 2.0, 0], [2.6, 0, 4.4], [8.8, 2.0, 3.7]], 2), [7.95, 1.65, 3.9])
  E()
  // a cat on the desk looking out at the city
  // a soft desk chair
  G('chair'); spots.chair = chairFacingWall(d, 5.4, 3.0, { color: (FABRICS[room.chairColor] || FABRICS.lilac).c, wood: dk, style: 'swivel' }); E()
  // the bed under the notes board (opens the Diary)
  G('bed')
  const mt = wallBed(d, { y0: 5.9, len: 3.9, depth: 3.1, base: 0.45, blanket, wood: room.bedWood === 'oak' ? '#8A5E40' : bedWood, mattressZ: 1.25, cushions: [[0.5, '#E9C46A'], [1.5, '#B9A3E0']] })
  openDiary(d, 0.6, 7.9, mt + 0.02, diaryToday)
  livePet(S, { bed: [2.2, 8.6, mt + 0.05], floor: [6.0, 6.4], sill: [8.2, 0.5, 2.52] })
  spots.bed = bounds([[0, 5.6, 0], [3.2, 5.6, 0], [3.2, 9.8, 0], [0, 9.8, 0], [0, 5.6, 2.8], [3.2, 9.8, 1.7]], 0)
  E()
  // a little cabinet with plants and a speaker
  d.box(8.7, 2.7, 0, 1.1, 1.2, 1.4, [shade(sw, 0.2), sw, shade(sw, -0.12)])
  d.box(8.85, 2.9, 1.4, 0.6, 0.5, 0.75, ['#4A4558', '#3A3546', '#2E2A3A'])
  const sp = P(9.46, 3.15, 1.75); d.raw(`<circle cx="${sp[0].toFixed(1)}" cy="${sp[1].toFixed(1)}" r="2.6" fill="#1E1B26"/>`)
  moodJar(S, 9.35, 3.6, 1.4)
  plant(d, 9.0, 8.6, leaves)
}

/* ---------- textures for walls and floor, drawn on the isometric grid ---------- */

const C = COS * K
const ISO = {
  left: `matrix(${-C} ${0.5 * K} 0 ${-K} ${OX} ${OY})`,
  right: `matrix(${C} ${0.5 * K} 0 ${-K} ${OX} ${OY})`,
  floor: `matrix(${C} ${0.5 * K} ${-C} ${0.5 * K} ${OX} ${OY})`,
}
function wallPattern(id, side, style, ink) {
  const t = ISO[side]
  if (style === 'boards') return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="1.4" height="10" patternTransform="${t}"><rect width=".7" height="10" fill="#fff" opacity=".08"/><rect x="1.36" width=".04" height="10" fill="${ink}" opacity=".35"/><rect x=".66" width=".04" height="10" fill="${ink}" opacity=".3"/><circle cx=".35" cy="2" r=".05" fill="${ink}" opacity=".4"/><circle cx="1.05" cy="6" r=".05" fill="${ink}" opacity=".4"/></pattern>`
  if (style === 'stripes') return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="1.2" height="10" patternTransform="${t}"><rect width=".6" height="10" fill="${ink}" opacity=".09"/><rect x=".58" width=".04" height="10" fill="#fff" opacity=".35"/></pattern>`
  if (style === 'dots') return `<pattern id="${id}" patternUnits="userSpaceOnUse" width=".9" height=".9" patternTransform="${t}"><circle cx=".22" cy=".22" r=".07" fill="${ink}" opacity=".22"/><circle cx=".67" cy=".67" r=".07" fill="#fff" opacity=".55"/></pattern>`
  if (style === 'brick') return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="1.4" height=".9" patternTransform="${t}"><path d="M0,.45 H1.4 M0,.9 H1.4 M.7,0 V.45 M0,.45 V.9 M1.4,.45 V.9" stroke="#fff" stroke-width=".06" opacity=".5"/><rect x=".05" y=".05" width=".6" height=".35" fill="${ink}" opacity=".05"/></pattern>`
  if (style === 'floral') return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="1.6" height="1.6" patternTransform="${t}"><g opacity=".38"><circle cx=".4" cy=".4" r=".1" fill="#fff"/><circle cx=".4" cy=".26" r=".07" fill="#fff"/><circle cx=".4" cy=".54" r=".07" fill="#fff"/><circle cx=".26" cy=".4" r=".07" fill="#fff"/><circle cx=".54" cy=".4" r=".07" fill="#fff"/><circle cx=".4" cy=".4" r=".05" fill="${ink}"/></g><path d="M1.1,1.0 q.15,.2 .3,.05 M1.15,1.2 q.12,-.15 .25,.05" stroke="${ink}" stroke-width=".04" fill="none" opacity=".25"/></pattern>`
  return ''
}
function floorPattern(id, style, ink, light) {
  const t = ISO.floor
  if (style === 'herringbone') return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="1.2" height=".6" patternTransform="${t}"><path d="M0,0 L.6,.3 L1.2,0 V.3 L.6,.6 L0,.3 Z" fill="${light}" opacity=".45"/><path d="M0,0 L.6,.3 L1.2,0 M0,.3 L.6,.6 L1.2,.3 M.6,.3 V.6" stroke="${ink}" stroke-width=".035" fill="none" opacity=".65"/></pattern>`
  if (style === 'tiles') return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="2" height="2" patternTransform="${t}"><rect width="1" height="1" fill="${light}" opacity=".55"/><rect x="1" y="1" width="1" height="1" fill="${light}" opacity=".55"/><path d="M0,0 H2 M0,1 H2 M0,0 V2 M1,0 V2" stroke="${ink}" stroke-width=".04" opacity=".6"/></pattern>`
  if (style === 'carpet') return `<pattern id="${id}" patternUnits="userSpaceOnUse" width=".5" height=".5" patternTransform="${t}"><circle cx=".12" cy=".18" r=".035" fill="${ink}" opacity=".3"/><circle cx=".37" cy=".4" r=".03" fill="#fff" opacity=".35"/></pattern>`
  return ''
}

export function drawRoom(o) {
  SHELF = { list: o.bookList || [], spots: [] }
  const { room: given, tod = timeOfDay(), books = 0, notes = 0, events = 0, diaryToday = false, leaves = 3 } = o
  // a room from before gets the look of the new room it became
  const room = THEMES[given.theme] ? given : { ...given, blanket: THEME_PRESETS[roomTheme(given.theme)].blanket, art: THEME_PRESETS[roomTheme(given.theme)].art }
  const wall = WALLS[room.wall] || WALLS.lavender
  const floor = FLOORS[room.floor] || FLOORS.oak
  const theme = roomTheme(room.theme)
  const sky = weatherSky(SKIES[tod], o.weather)
  const glows = []   // lamp lights, drawn again on top in the night room
  const glow = (x, y, r) => { glows.push([x, y, r]); d.raw(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="url(#glow)"/>`) }
  const blanket = (FABRICS[room.blanket] || FABRICS.lilac).c
  const shelfWood = (WOODS[room.shelfWood] || WOODS.oak).c
  const deskWood = (WOODS[room.deskWood] || WOODS.oak).c
  const bedWood = (WOODS[room.bedWood] || WOODS.oak).c
  const rug = (RUGS[room.rug] || RUGS.pink).c
  const trim = shade(wall.l[1], 0.55)
  const dark = room.wall === 'night'
  const d = painter()
  d.weather = o.weather || null
  d.weatherNight = !!SKIES[tod].lights
  const spots = {}
  // each piece is a group, so the one being decorated can glow
  const G = (id) => d.raw(`<g class="part part-${id}${o.selected === id ? ' sel' : ''}">`)
  const E = () => d.raw('</g>')

  d.raw(`<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.stops[0]}"/><stop offset=".55" stop-color="${sky.stops[1]}"/><stop offset="1" stop-color="${sky.stops[2]}"/></linearGradient>
    <linearGradient id="wallL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${wall.l[0]}"/><stop offset="1" stop-color="${wall.l[1]}"/></linearGradient>
    <linearGradient id="wallR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${wall.r[0]}"/><stop offset="1" stop-color="${wall.r[1]}"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${floor.a}"/><stop offset="1" stop-color="${floor.b}"/></linearGradient>
    <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE3A8" stop-opacity=".55"/><stop offset="1" stop-color="#FFE3A8" stop-opacity="0"/></radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.6"/></filter>
    <radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE7B0" stop-opacity=".7"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></radialGradient>
    <radialGradient id="sunwash" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4DC" stop-opacity="${sky.beam ? 0.5 : 0.18}"/><stop offset="1" stop-color="#FFF4DC" stop-opacity="0"/></radialGradient>
    <linearGradient id="slabL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(floor.b, -0.12)}"/><stop offset="1" stop-color="${shade(floor.b, -0.28)}"/></linearGradient>
    <linearGradient id="slabR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(floor.b, -0.2)}"/><stop offset="1" stop-color="${shade(floor.b, -0.36)}"/></linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6DD" stop-opacity="${sky.beam}"/><stop offset="1" stop-color="#FFF6DD" stop-opacity="0"/></linearGradient>
  </defs>`)

  /* walls and floor */
  const W = 10, D = 10, H = 9
  // the room sits on a thick base, like a little diorama, and the walls have thickness
  const T = 0.32, B = 0.55
  // the attic has a sloping roof: the right wall gets lower towards the front
  const HR = theme === 'attic' ? 6.4 : H
  const roofZ = (x) => H - ((H - HR) * x) / W
  const rightWall = [[0, 0, 0], [W, 0, 0], [W, 0, HR], [0, 0, H]]
  if (!NEW_ROOMS[theme]) {
  d.raw(`<ellipse cx="${P(W / 2, D / 2, 0)[0].toFixed(1)}" cy="${(P(W, D, -B)[1] - 4).toFixed(1)}" rx="120" ry="9" fill="#000" opacity=".25" filter="url(#soft)"/>`)
  d.poly([[-T, D, 0], [W, D, 0], [W, D, -B], [-T, D, -B]], 'url(#slabL)')
  d.poly([[W, -T, 0], [W, D, 0], [W, D, -B], [W, -T, -B]], 'url(#slabR)')
  G('walls')
  d.poly([[-T, -T, H], [-T, D, H], [0, D, H], [0, 0, H], [W, 0, HR], [W, -T, HR]], shade(wall.l[0], 0.35))
  d.poly([[-T, D, 0], [0, D, 0], [0, D, H], [-T, D, H]], shade(wall.l[1], -0.12))
  d.poly([[W, -T, 0], [W, 0, 0], [W, 0, HR], [W, -T, HR]], shade(wall.r[1], -0.08))
  d.poly([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], 'url(#wallL)')
  d.poly(rightWall, 'url(#wallR)')
  const ws = room.wallStyle || 'plain', wink = shade(wall.r[1], -0.35)
  if (ws === 'panels') {
    // wainscoting: wooden panels on the lower part of both walls, with a rail on top
    const pc = shade(wall.l[0], 0.45), ps = shade(wall.r[1], 0.35)
    d.poly([[0.02, 0, 0], [0.02, D, 0], [0.02, D, 2.9], [0.02, 0, 2.9]], pc)
    d.poly([[0, 0.02, 0], [W, 0.02, 0], [W, 0.02, 2.9], [0, 0.02, 2.9]], ps)
    for (let i = 0; i < 6; i++) {
      const y0 = 0.35 + i * 1.6
      d.poly([[0.03, y0, 0.55], [0.03, y0 + 1.25, 0.55], [0.03, y0 + 1.25, 2.4], [0.03, y0, 2.4]], 'none', ` stroke="${shade(pc, -0.12)}" stroke-width=".9"`)
      d.poly([[y0, 0.03, 0.55], [y0 + 1.25, 0.03, 0.55], [y0 + 1.25, 0.03, 2.4], [y0, 0.03, 2.4]], 'none', ` stroke="${shade(ps, -0.12)}" stroke-width=".9"`)
    }
    d.box(0, 0, 2.85, 0.14, D, 0.14, [shade(pc, 0.1), shade(pc, -0.05), shade(pc, -0.1)])
    d.box(0, 0, 2.85, W, 0.14, 0.14, [shade(ps, 0.1), shade(ps, -0.05), shade(ps, -0.1)])
  } else if (ws !== 'plain') {
    d.raw(`<defs>${wallPattern('wpL', 'left', ws, wink)}${wallPattern('wpR', 'right', ws, wink)}</defs>`)
    d.poly([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], 'url(#wpL)')
    d.poly(rightWall, 'url(#wpR)')
  }
  E()
  G('floor')
  d.poly([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], 'url(#floor)')
  const fs = room.floorStyle || 'planks'
  if (fs === 'planks') {
    for (let i = 1; i < 10; i++) d.line([[0, i, 0], [W, i, 0]], floor.line, 1, ' opacity=".55"')
    for (let i = 0; i < 10; i++) d.line([[2 + (i % 3) * 3 + (i % 2), i, 0], [2 + (i % 3) * 3 + (i % 2), i + 1, 0]], floor.line, 1, ' opacity=".4"')
  } else {
    d.raw(`<defs>${floorPattern('fp', fs, floor.line, floor.b)}</defs>`)
    d.poly([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], 'url(#fp)')
  }
  E()
  d.poly([[0, 0, 0], [0, 0.6, 0], [0, 0.6, H], [0, 0, H]], '#000', ' opacity=".05"')
  d.poly([[0, 0, 0], [0.6, 0, 0], [0.6, 0, H], [0, 0, H]], '#000', ' opacity=".06"')
  d.box(0, 0, 0, 0.12, D, 0.35, [trim, shade(trim, -0.04), shade(trim, -0.08)])
  d.box(0, 0, 0, W, 0.12, 0.35, [trim, shade(trim, -0.06), shade(trim, -0.08)])

  }
  const S = { d, room, sky, tod, photo: o.windowPhoto, memories: o.memories || 0, moods: o.moods || [], spots, G, E, glow, books, notes, events, diaryToday, leaves, blanket, shelfWood, deskWood, bedWood, rug }
  if (NEW_ROOMS[theme]) NEW_ROOMS[theme](S)
  else if (theme === 'attic') atticScene(S)
  else if (theme === 'study') studyScene(S)
  else if (theme === 'japanese') japaneseScene(S)
  else if (theme === 'plants') plantScene(S)
  else if (theme === 'lofi') lofiScene(S)
  else {
  /* right wall: picture, little wall shelf, window, string lights */
  G('art')
  art(d, room.art || 'mountains', 'right', 1.6, 3.5, 5.0, 6.8)
  spots.art = bounds([[1.4, 0, 4.8], [3.7, 0, 4.8], [3.7, 0, 7.0], [1.4, 0, 7.0]], 1)
  E()

  d.box(4.1, 0, 5.0, 1.9, 0.55, 0.14, shade(shelfWood, 0.05))
  d.cylinder(4.55, 0.3, 5.14, 0.17, 0.5, '#FBF3E6')
  const flame = P(4.55, 0.3, 5.75)
  d.raw(`<ellipse cx="${flame[0].toFixed(1)}" cy="${flame[1].toFixed(1)}" rx="1.3" ry="2.4" fill="#F6C46B" opacity="${sky.lights ? 1 : 0.5}"/>`)
  if (sky.lights) glow(flame[0], flame[1], 11)
  d.cylinder(5.15, 0.3, 5.14, 0.22, 0.32, '#D98F72')
  const cac = P(5.15, 0.3, 5.46)
  d.raw(`<path d="M${(cac[0] - 2.5).toFixed(1)},${cac[1].toFixed(1)} q2.5,-9 5,0 z" fill="#7FAF8E"/>`)
  moodJar({ d, spots, moods: o.moods }, 5.7, 0.3, 5.14)

  const wx0 = 6.6, wx1 = 9.2, wz0 = 4.0, wz1 = 7.5
  const wash = P(7.9, 0, 5.6)
  d.raw(`<clipPath id="rwall"><polygon points="${pts(rightWall)}"/></clipPath><ellipse clip-path="url(#rwall)" cx="${wash[0].toFixed(1)}" cy="${wash[1].toFixed(1)}" rx="70" ry="60" fill="url(#sunwash)"/>`)
  if (theme === 'attic') roundWindow(d, sky, blanket)
  else if (theme === 'city') cityWindow(d, sky, blanket)
  else {
    d.poly([[wx0 - 0.15, 0.01, wz0 - 0.15], [wx1 + 0.15, 0.01, wz0 - 0.15], [wx1 + 0.15, 0.01, wz1 + 0.15], [wx0 - 0.15, 0.01, wz1 + 0.15]], '#FBF8FD')
    d.poly([[wx0, 0.02, wz0], [wx1, 0.02, wz0], [wx1, 0.02, wz1], [wx0, 0.02, wz1]], 'url(#sky)')
    const orb = P(8.4, 0.03, sky.orbZ)
    d.raw(`<circle cx="${orb[0].toFixed(1)}" cy="${orb[1].toFixed(1)}" r="11" fill="${sky.orb}" opacity=".2"/><circle cx="${orb[0].toFixed(1)}" cy="${orb[1].toFixed(1)}" r="5.5" fill="${sky.orb}"/>`)
    if (sky.stars) {
      ;[[7.0, 7.1, 0], [7.5, 6.6, 1.2], [9.0, 7.2, 0.6], [7.2, 6.0, 1.8], [8.0, 7.3, 0.9]].forEach(([x, z, delay]) => {
        const s = P(x, 0.03, z)
        d.raw(`<circle class="twinkle" style="animation-delay:${delay}s" cx="${s[0].toFixed(1)}" cy="${s[1].toFixed(1)}" r="1.1" fill="#FFF"/>`)
      })
    }
    d.poly([[wx0, 0.03, wz0], [7.0, 0.03, 4.6], [7.7, 0.03, 4.35], [8.4, 0.03, 4.8], [wx1, 0.03, 4.4], [wx1, 0.03, wz0]], sky.hills, ' opacity=".6"')
    d.flushWeather()
    if (o.windowPhoto) wallImage(d, wx0, wx1, wz0, wz1, o.windowPhoto)
    spots.window = bounds([[wx0, 0, wz0], [wx1, 0, wz0], [wx1, 0, wz1], [wx0, 0, wz1]], 1)
    const mid = (wx0 + wx1) / 2
    d.poly([[mid - 0.06, 0.04, wz0], [mid + 0.06, 0.04, wz0], [mid + 0.06, 0.04, wz1], [mid - 0.06, 0.04, wz1]], '#FBF8FD')
    d.poly([[wx0, 0.04, 5.75], [wx1, 0.04, 5.75], [wx1, 0.04, 5.87], [wx0, 0.04, 5.87]], '#FBF8FD')
    d.box(wx0 - 0.3, 0, wz0 - 0.32, wx1 - wx0 + 0.6, 0.45, 0.14, ['#FFFFFF', '#EEE8F2', '#E4DCEB'])
    const curtain = shade(blanket, 0.62)
    ;[wx0 - 0.75, wx1 + 0.15].forEach((cx0) => {
      d.poly([[cx0, 0.25, 3.0], [cx0 + 0.6, 0.25, 3.0], [cx0 + 0.6, 0.25, 8.0], [cx0, 0.25, 8.0]], curtain)
      d.poly([[cx0 + 0.2, 0.26, 3.0], [cx0 + 0.32, 0.26, 3.0], [cx0 + 0.32, 0.26, 8.0], [cx0 + 0.2, 0.26, 8.0]], shade(curtain, -0.06))
    })
    d.line([[wx0 - 1.0, 0.28, 8.05], [wx1 + 1.0, 0.28, 8.05]], '#B9A3C9', 2, ' stroke-linecap="round"')
  }

  const lights = []
  for (let i = 0; i < 13; i++) {
    const x = 0.4 + i * 0.75
    lights.push([x, 0.05, Math.min(8.55, roofZ(x) - 0.9) - 0.45 * Math.sin((Math.PI * ((x * 1.3) % 3.0)) / 3.0)])
  }
  d.line(lights, '#8C7FA6', 1)
  const bulbs = ['#FFE29A', '#FFC9D6', '#C9E6FF']
  lights.slice(1, -1).forEach((l, i) => {
    const p = P(...l)
    if (sky.lights) d.raw(`<circle cx="${p[0].toFixed(1)}" cy="${(p[1] + 2).toFixed(1)}" r="9" fill="url(#halo)"/>`)
    d.raw(`<circle class="twinkle" style="animation-delay:${((i % 5) * 0.35).toFixed(2)}s" cx="${p[0].toFixed(1)}" cy="${(p[1] + 2).toFixed(1)}" r="2.4" fill="${bulbs[i % 3]}" opacity="${sky.lights ? 1 : 0.55}"/>`)
  })

  /* left wall: clock and corkboard with notes */
  wallClock(d, 9.0, room.shelfStyle === 'low' ? 4.6 : room.shelfStyle === 'cube' ? 5.9 : 7.55)
  d.poly([[0.02, 1.6, 4.5], [0.02, 4.8, 4.5], [0.02, 4.8, 7.1], [0.02, 1.6, 7.1]], '#B88D6C')
  d.poly([[0.03, 1.75, 4.65], [0.03, 4.65, 4.65], [0.03, 4.65, 6.95], [0.03, 1.75, 6.95]], '#D9B48F')
  const stickies = [[2.0, 5.6, '#FBE7A6'], [3.0, 6.0, '#F7CFD9'], [3.7, 5.5, '#CFE4F5'], [2.4, 4.95, '#D8EBD9'], [3.5, 4.85, '#FBE7A6'], [3.9, 6.05, '#E6DCF5'], [3.0, 5.15, '#F7CFD9'], [2.0, 6.15, '#CFE4F5']]
  stickies.slice(0, Math.min(notes, stickies.length)).forEach(([ny, nz, col], i) => {
    d.poly([[0.04, ny, nz], [0.04, ny + 0.8, nz], [0.04, ny + 0.8, nz + 0.8], [0.04, ny, nz + 0.8]], col)
    const pin = P(0.05, ny + 0.4, nz + 0.72)
    d.raw(`<circle cx="${pin[0].toFixed(1)}" cy="${pin[1].toFixed(1)}" r="1.6" fill="${i % 2 ? '#3F6B9A' : '#C2556B'}"/>`)
  })
  spots.board = bounds([[0, 1.6, 4.5], [0, 4.8, 4.5], [0, 4.8, 7.1], [0, 1.6, 7.1]], 3)
  if (theme === 'cozy') sconce(d, 'left', 5.35, 4.55, sky.lights, glow)
  if (theme === 'attic') atticDetails(d)

  /* light from the window on the floor */
  if (sky.beam) d.poly([[6.6, 0.2, 0.02], [9.2, 0.2, 0.02], [8.0, 5.2, 0.02], [5.4, 5.2, 0.02]], 'url(#beam)')

  /* rug */
  spots.rug = bounds(Array.from({ length: 24 }, (_, i) => [5.4 + 2.7 * Math.cos((Math.PI * i) / 12), 6.0 + 2.7 * Math.sin((Math.PI * i) / 12), 0]), 0)
  G('rug')
  if (rug) {
    d.ring(5.4, 6.0, 0.01, 2.7, rug)
    d.ring(5.4, 6.0, 0.02, 2.15, shade(rug, -0.06))
    d.ring(5.4, 6.0, 0.03, 1.6, rug)
    d.ring(5.4, 6.0, 0.04, 0.9, shade(rug, -0.06))
    for (let i = 0; i < 48; i++) { const a = (Math.PI * 2 * i) / 48; d.line([[5.4 + 2.7 * Math.cos(a), 6.0 + 2.7 * Math.sin(a), 0.01], [5.4 + 2.92 * Math.cos(a), 6.0 + 2.92 * Math.sin(a), 0.01]], shade(rug, -0.04), 0.8) }
  }
  E()

  /* a big potted plant in the corner: grows with your diary streak */
  plant(d, 0.85, 0.85, leaves)

  /* ================= desk ================= */
  G('desk')
  d.shadow(0, 1.5, 2.7, 5.9)
  const dw = deskWood, dws = room.deskStyle
  if (dws === 'simple') {
    ;[[0.15, 1.75], [2.05, 1.75], [0.15, 5.35], [2.05, 5.35]].forEach(([x, y]) => d.box(x, y, 0, 0.16, 0.16, 2.4, shade(dw, -0.05)))
    d.box(0.1, 1.85, 0.9, 2.1, 3.6, 0.08, shade(dw, 0.05))
    d.box(0.2, 2.1, 0.98, 1.1, 0.5, 0.25, '#7FA3C8')
    d.box(0.25, 2.65, 0.98, 1.0, 0.45, 0.2, '#E28FA3')
  } else if (dws === 'trestle') {
    // two A-shaped side frames joined by a bar
    ;[1.75, 5.3].forEach((y) => {
      d.poly([[0.2, y, 0], [0.38, y, 0], [1.3, y, 2.4], [1.12, y, 2.4]], shade(dw, -0.08))
      d.poly([[2.2, y, 0], [2.02, y, 0], [1.12, y, 2.4], [1.3, y, 2.4]], shade(dw, -0.02))
      d.poly([[0.2, y + 0.16, 0], [0.38, y + 0.16, 0], [1.3, y + 0.16, 2.4], [1.12, y + 0.16, 2.4]], shade(dw, -0.12))
      d.poly([[2.2, y + 0.16, 0], [2.02, y + 0.16, 0], [1.12, y + 0.16, 2.4], [1.3, y + 0.16, 2.4]], dw)
    })
    d.box(1.15, 1.8, 0.7, 0.14, 3.65, 0.14, shade(dw, -0.06))
    // a basket under the desk
    d.box(0.3, 3.1, 0, 1.2, 1.1, 0.75, ['#E6D3B5', '#D9C29E', '#CBB28C'])
    for (let i = 1; i < 4; i++) d.line([[1.5, 3.1 + i * 0.28, 0.05], [1.5, 3.1 + i * 0.28, 0.7]], '#BFA27A', 0.7)
  } else {
    d.box(0.15, 4.2, 0, 2.1, 1.3, 2.4, dw)
    ;[1.55, 0.75].forEach((z) => d.poly([[2.26, 4.4, z], [2.26, 5.3, z], [2.26, 5.3, z + 0.65], [2.26, 4.4, z + 0.65]], shade(dw, -0.04)))
    ;[1.9, 1.1].forEach((z) => { const k = P(2.27, 4.85, z); d.raw(`<circle cx="${k[0].toFixed(1)}" cy="${k[1].toFixed(1)}" r="1.2" fill="${shade(dw, -0.35)}"/>`) })
    d.box(2.05, 1.8, 0, 0.18, 0.18, 2.4, dw)
  }
  d.box(0, 1.6, 2.4, 2.45, 4.1, 0.22, [shade(dw, 0.2), dw, shade(dw, -0.1)])
  // laptop
  d.box(0.6, 2.3, 2.62, 1.3, 1.5, 0.07, ['#E9E6EF', '#D5D1DE', '#C9C4D4'])
  d.poly([[0.6, 2.3, 2.69], [0.6, 3.8, 2.69], [0.45, 3.8, 3.85], [0.45, 2.3, 3.85]], '#D5D1DE')
  d.poly([[0.62, 2.4, 2.8], [0.62, 3.7, 2.8], [0.48, 3.7, 3.75], [0.48, 2.4, 3.75]], sky.lights ? '#BFD8EE' : '#A9B9CC')
  // desk calendar (opens the Calendar)
  deskCalendar(d, 1.15, 3.95, 5.15, 2.62, 1.25, events)
  if (theme === 'attic') flowers(d, 1.25, 2.0, 2.62)
  // mug and lamp
  d.cylinder(1.85, 5.25, 2.62, 0.2, 0.42, '#E9A3B4')
  const mug = P(1.85, 5.25, 3.1)
  d.raw(`<path d="M${(mug[0] - 1.5).toFixed(1)},${(mug[1] - 2).toFixed(1)} q2,-4 0,-8 M${(mug[0] + 2).toFixed(1)},${(mug[1] - 2).toFixed(1)} q2,-4 0,-8" fill="none" stroke="#FFF" stroke-opacity=".6" stroke-width="1"/>`)
  spots.desk = tagAt(bounds([[0, 1.6, 0], [2.5, 1.6, 0], [2.5, 5.7, 0], [0, 5.7, 0], [0, 1.6, 3.9], [1.2, 5.15, 3.9]], 2), [1.15, 4.55, 4.5])
  E()

  /* ================= chair (faces the desk) ================= */
  G('chair')
  const chair = (FABRICS[room.chairColor] || FABRICS.lilac).c
  const cs = room.chairStyle
  d.shadow(2.5, 2.6, 4.2, 4.3, 0.12)
  if (cs === 'stool') {
    ;[[2.85, 2.95], [3.85, 2.95], [2.85, 3.95], [3.85, 3.95]].forEach(([x, y]) => d.box(x, y, 0, 0.1, 0.1, 1.35, shade(deskWood, -0.1)))
    d.box(2.95, 3.05, 0.55, 0.9, 0.06, 0.06, shade(deskWood, -0.1))
    d.cylinder(3.4, 3.5, 1.35, 0.72, 0.3, chair)
  } else if (cs === 'office') {
    // five legs on little wheels, a column, a soft seat and a rounded back
    const cx = 3.35, cy = 3.4
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5 + 0.3
      const ex = cx + 0.75 * Math.cos(a), ey = cy + 0.75 * Math.sin(a)
      d.line([[cx, cy, 0.25], [ex, ey, 0.18]], '#55506A', 2.4, ' stroke-linecap="round"')
      const w = P(ex, ey, 0.08)
      d.raw(`<circle cx="${w[0].toFixed(1)}" cy="${w[1].toFixed(1)}" r="1.6" fill="#3E3A4E"/>`)
    }
    d.cylinder(cx, cy, 0.25, 0.08, 1.1, '#6E6884')
    d.box(2.7, 2.8, 1.35, 1.3, 1.25, 0.3, chair)
    d.line([[3.9, 3.42, 1.5], [4.05, 3.42, 1.9]], '#55506A', 2)
    d.box(3.95, 2.85, 1.9, 0.2, 1.15, 1.55, chair)
    d.box(3.95, 2.85, 3.45, 0.2, 1.15, 0.0, chair)
  } else if (cs === 'armchair') {
    // a soft armchair: low base, far arm, seat with a cushion, high back, near arm
    d.box(2.55, 2.6, 0, 1.6, 1.6, 0.18, shade(chair, -0.3))
    d.box(2.55, 2.6, 0.18, 1.3, 0.24, 1.1, chair)
    d.box(2.55, 2.84, 0.18, 1.2, 1.12, 0.8, shade(chair, -0.06))
    d.box(2.6, 2.86, 0.98, 1.1, 1.08, 0.22, [shade(chair, 0.22), shade(chair, 0.08), shade(chair, -0.02)])
    d.box(3.75, 2.6, 0.18, 0.4, 1.6, 2.2, [shade(chair, 0.12), chair, shade(chair, -0.12)])
    d.box(2.55, 3.96, 0.18, 1.3, 0.24, 1.1, [shade(chair, 0.12), chair, shade(chair, -0.12)])
  } else {
    // a wooden chair with four legs, a seat and a back
    const wood = shade(deskWood, -0.12)
    const leg = (x, y, h = 1.45) => d.box(x, y, 0, 0.12, 0.12, h, wood)
    leg(2.75, 2.85); leg(2.75, 3.85)
    d.box(3.85, 2.85, 0, 0.12, 0.12, 3.35, wood)
    d.box(2.8, 2.9, 0.55, 0.06, 1.0, 0.06, wood)
    d.box(2.65, 2.75, 1.45, 1.35, 1.3, 0.12, [shade(deskWood, 0.15), deskWood, shade(deskWood, -0.08)])
    d.box(2.75, 2.85, 1.57, 1.1, 1.1, 0.14, [shade(chair, 0.15), chair, shade(chair, -0.1)])
    leg(3.85, 3.85)
    d.box(3.85, 3.85, 1.45, 0.12, 0.12, 1.9, wood)
    d.box(3.86, 2.95, 2.45, 0.1, 0.9, 0.7, [shade(deskWood, 0.15), deskWood, shade(deskWood, -0.08)])
    d.box(3.88, 3.05, 1.95, 0.06, 0.7, 0.12, wood)
  }
  spots.chair = bounds([[2.6, 2.6, 0], [4.15, 2.6, 0], [4.15, 4.2, 0], [2.6, 4.2, 0], [2.6, 2.75, 3.4], [4.1, 4.05, 3.4]], 2)
  E()

  /* bedside table with a little lamp */
  nightstand(d, 4.55, 0.35, bedWood, sky.lights, glow)

  /* ================= bed ================= */
  G('bed')
  const bs = room.bedStyle
  const canopy = bs === 'canopy', platform = bs === 'platform'
  d.shadow(5.6, 0.1, 10, 5.6, 0.18)
  if (canopy) ;[[5.85, 0.05], [9.6, 0.05]].forEach(([x, y]) => d.box(x, y, 0, 0.14, 0.14, 7.6, bedWood))
  let mt // top of the mattress
  const whites = ['#FFFFFF', '#F2EDF6', '#E4DCEC']
  if (platform) {
    // a low wooden platform with a soft, rounded headboard
    headboard(d, 5.85, 9.75, 0.3, 2.5, shade(blanket, 0.25))
    d.box(5.65, 0.3, 0, 4.3, 5.1, 0.42, [shade(bedWood, 0.15), bedWood, shade(bedWood, -0.12)])
    soft(d, 5.85, 0.4, 0.42, 3.9, 4.75, 0.72, whites, 0.32)
    mt = 1.14
  } else {
    headboard(d, 5.85, 9.75, 0.38, canopy ? 2.5 : 3.4, shade(blanket, canopy ? 0.05 : 0.22))
    ;[[5.95, 0.45], [9.5, 0.45], [5.95, 5.0], [9.5, 5.0]].forEach(([x, y]) => d.box(x, y, 0, 0.16, 0.16, 0.3, shade(bedWood, -0.2)))
    d.box(5.9, 0.4, 0.3, 3.8, 4.8, 0.55, [shade(bedWood, 0.15), bedWood, shade(bedWood, -0.12)])
    soft(d, 5.98, 0.45, 0.85, 3.64, 4.7, 0.85, whites, 0.34)
    mt = 1.7
  }
  // two puffy pillows and a small cushion
  soft(d, 6.2, 0.55, mt, 1.6, 1.05, 0.55, ['#FFFFFF', '#F4F0F8', '#E6DFEE'], 0.42, 2)
  soft(d, 7.95, 0.55, mt, 1.6, 1.05, 0.55, ['#FFFFFF', '#F4F0F8', '#E6DFEE'], 0.42, 2)
  soft(d, 7.25, 1.35, mt, 1.0, 0.5, 0.52, [shade(blanket, 0.35), shade(blanket, 0.25), shade(blanket, 0.12)], 0.22, 1)
  // a soft duvet over the rest of the bed
  duvet(d, 5.96, 2.25, 9.66, 5.18, mt + 0.08, platform ? 0.55 : 0.8, blanket)
  // open diary on the blanket
  const dz = mt + 0.1
  d.poly([[6.5, 3.0, dz], [7.4, 3.0, dz], [7.4, 4.3, dz], [6.5, 4.3, dz]], '#FFFDF8')
  d.poly([[7.4, 3.0, dz], [8.3, 3.0, dz], [8.3, 4.3, dz], [7.4, 4.3, dz]], '#FBF6EC')
  d.line([[7.4, 3.0, dz + 0.01], [7.4, 4.3, dz + 0.01]], '#CDBFAE', 1)
  const lines = diaryToday ? 4 : 2
  for (let j = 0; j < lines; j++) d.line([[6.65, 3.25 + j * 0.25, dz + 0.01], [7.25, 3.25 + j * 0.25, dz + 0.01]], diaryToday ? '#9C86C9' : '#DCD3C6', 0.8)
  const pen = P(8.0, 3.6, dz + 0.02)
  d.raw(`<path d="M${(pen[0] - 7).toFixed(1)},${(pen[1] + 4).toFixed(1)} l12,-7" stroke="#E07A8F" stroke-width="2" stroke-linecap="round"/>`)
  // the pet sleeping on the bed
  livePet(S, { bed: [9.0, 3.3, mt + 0.1], floor: [4.6, 6.6], sill: [7.9, 0.25, 3.84] })
  if (canopy) {
    ;[[5.85, 5.1], [9.6, 5.1]].forEach(([x, y]) => d.box(x, y, 0, 0.14, 0.14, 7.6, bedWood))
    d.box(5.85, 0.05, 7.6, 3.9, 0.12, 0.12, bedWood)
    d.box(5.85, 0.05, 7.6, 0.12, 5.2, 0.12, bedWood)
    d.box(9.6, 0.05, 7.6, 0.14, 5.2, 0.12, bedWood)
    d.box(5.85, 5.1, 7.6, 3.9, 0.14, 0.12, bedWood)
    d.poly([[6.0, 5.15, 7.6], [6.9, 5.15, 7.6], [6.25, 5.15, 4.0], [6.05, 5.15, 0.8], [6.0, 5.15, 0.8]], '#FFFFFF', ' opacity=".55"')
    d.poly([[9.65, 4.2, 7.6], [9.65, 5.2, 7.6], [9.65, 5.2, 0.8], [9.65, 4.95, 0.8], [9.65, 4.6, 4.0]], '#FFFFFF', ' opacity=".5"')
    const cl = []
    for (let i = 0; i <= 10; i++) cl.push([5.9 + i * 0.37, 5.2, 7.5 - 0.35 * Math.sin((Math.PI * i) / 5)])
    d.line(cl, '#8C7FA6', 0.8)
    cl.slice(1, -1).forEach((l, i) => {
      const p = P(...l)
      d.raw(`<circle class="twinkle" style="animation-delay:${((i % 4) * 0.4).toFixed(1)}s" cx="${p[0].toFixed(1)}" cy="${(p[1] + 1.5).toFixed(1)}" r="1.9" fill="${bulbs[i % 3]}" opacity="${sky.lights ? 1 : 0.6}"/>`)
    })
  }
  const bedTop = canopy ? 7.7 : platform ? 2.4 : 3.3
  spots.bed = bounds([[5.65, 0, 0], [9.95, 0, bedTop], [9.95, 5.4, 0], [5.65, 5.4, 0], [5.65, 0, bedTop]], 0)
  E()

  /* a soft round pouf to sit on */
  pouf(d, 6.6, 8.0, (FABRICS[room.chairColor] || FABRICS.lilac).c)

  /* ================= bookshelf (opens Books) ================= */
  G('shelf')
  const sw = shelfWood, ss = room.shelfStyle
  const bookRow = (x0, depth, y0, y1, z, maxH, si) => {
    let y = y0, k = si * 3
    while (y < y1 - 0.25) {
      const w = [0.24, 0.29, 0.34, 0.26, 0.31, 0.27][k % 6]
      if (placed < books) {
        const h = Math.min(maxH, [0.95, 0.8, 1.05, 0.72, 0.9, 1.0, 0.85][k % 7])
        d.box(x0, y, z, depth, w, h, bookAt(placed, BOOK_COLORS[(placed * 3 + si) % BOOK_COLORS.length]))
        noteBook(placed, [[x0, y, z], [x0 + depth, y + w, z], [x0 + depth, y, z + h], [x0, y + w, z + h]])
        placed++
      }
      y += w + 0.04; k++
    }
  }
  let placed = 0
  let sy0 = 6.8, sdy = 2.7, sh = 5.4, sx = 1.45
  if (ss === 'low') {
    sy0 = 6.3; sdy = 3.4; sh = 2.7
    d.shadow(0, sy0 - 0.2, sx + 0.35, sy0 + sdy + 0.3, 0.18)
    d.poly([[0.08, sy0, 0], [0.08, sy0 + sdy, 0], [0.08, sy0 + sdy, sh], [0.08, sy0, sh]], shade(sw, -0.28))
    d.box(0, sy0, 0, sx, 0.12, sh, sw)
    ;[0.25, 1.45].forEach((z, si) => { d.box(0, sy0, z - 0.12, sx, sdy, 0.12, shade(sw, 0.06)); bookRow(0.2, 1.05, sy0 + 0.2, sy0 + sdy, z, 1.05, si) })
    d.box(0, sy0 + sdy - 0.12, 0, sx, 0.12, sh + 0.14, sw)
    d.box(0, sy0, sh, sx, sdy, 0.14, shade(sw, 0.1))
  } else if (ss === 'ladder') {
    // a ladder shelf leaning on the wall: shelves get deeper towards the floor
    sy0 = 6.9; sdy = 2.5; sh = 6.0
    d.shadow(0, sy0 - 0.2, 1.9, sy0 + sdy + 0.3, 0.16)
    const rail = (y) => d.poly([[0.05, y, sh], [0.15, y, sh], [1.75, y, 0], [1.6, y, 0]], shade(sw, -0.1))
    rail(sy0)
    const levels = [[0.2, 1.6], [1.6, 1.25], [3.0, 0.9], [4.4, 0.55]]
    levels.forEach(([z, depth], si) => {
      d.box(0.1, sy0 + 0.05, z, depth, sdy - 0.1, 0.1, shade(sw, 0.08))
      bookRow(0.15, Math.max(0.4, depth - 0.25), sy0 + 0.2, sy0 + sdy - 0.1, z + 0.1, 1.1, si)
    })
    rail(sy0 + sdy)
    d.poly([[0.05, sy0 + sdy, sh], [0.15, sy0 + sdy, sh], [1.75, sy0 + sdy, 0], [1.6, sy0 + sdy, 0]], sw)
  } else if (ss === 'cube') {
    // a grid of cubes, some with fabric baskets
    sy0 = 6.6; sdy = 3.0; sh = 4.2; sx = 1.3
    d.shadow(0, sy0 - 0.2, sx + 0.35, sy0 + sdy + 0.3, 0.18)
    d.poly([[0.08, sy0, 0], [0.08, sy0 + sdy, 0], [0.08, sy0 + sdy, sh], [0.08, sy0, sh]], shade(sw, -0.3))
    d.box(0, sy0, 0, sx, 0.12, sh, sw)
    const cw = (sdy - 0.12) / 3, chh = (sh - 0.12) / 3
    for (let r = 0; r < 3; r++) {
      const z = r * chh + 0.12
      d.box(0, sy0, z - 0.12, sx, sdy, 0.12, shade(sw, 0.06))
      for (let c = 0; c < 3; c++) {
        const y = sy0 + 0.12 + c * cw
        if ((r + c) % 3 === 1) d.box(0.15, y + 0.06, z, sx - 0.2, cw - 0.2, chh - 0.25, ['#E8DCCB', '#DCCBB4', '#CDB99E'].map((v) => r === 1 ? shade(blanket, 0.25 - (v === '#E8DCCB' ? 0 : 0.08)) : v))
        else bookRow(0.2, sx - 0.35, y + 0.04, y + cw - 0.1, z, chh - 0.2, r * 3 + c)
        if (c > 0) d.box(0, y - 0.06, z, sx, 0.08, chh - 0.12, sw)
      }
    }
    d.box(0, sy0 + sdy - 0.12, 0, sx, 0.12, sh + 0.12, sw)
    d.box(0, sy0, sh, sx, sdy, 0.12, shade(sw, 0.1))
  } else {
    d.shadow(0, sy0 - 0.2, sx + 0.35, sy0 + sdy + 0.3, 0.18)
    d.poly([[0.08, sy0, 0], [0.08, sy0 + sdy, 0], [0.08, sy0 + sdy, sh], [0.08, sy0, sh]], shade(sw, -0.28))
    d.box(0, sy0, 0, sx, 0.12, sh, sw)
    // the newest books stand with their covers facing the room on the top shelf
    const front = Math.min(2, books)
    ;[0.25, 1.55, 2.85, 4.15].forEach((z, si) => {
      d.box(0, sy0, z - 0.12, sx, sdy, 0.12, shade(sw, 0.06))
      if (si === 3) {
        for (let i = 0; i < front; i++) {
          const b = SHELF.list[i] || { color: BOOK_COLORS[i], title: '' }
          const y0 = sy0 + 0.25 + i * 1.2
          faceOutBook(d, 0.75, y0, y0 + 0.95, z, z + 1.12, { ...b, color: b.color || BOOK_COLORS[i] })
          noteBook(i, [[0.6, y0, z], [0.75, y0 + 0.95, z], [0.75, y0, z + 1.12], [0.6, y0 + 0.95, z + 1.12]])
        }
      } else {
        if (si === 0) placed = front
        bookRow(0.2, 1.05, sy0 + 0.2, sy0 + sdy, z, 1.05, si)
      }
    })
    d.box(0, sy0 + sdy - 0.12, 0, sx, 0.12, sh + 0.14, sw)
    d.box(0, sy0, sh, sx, sdy, 0.14, shade(sw, 0.1))
  }
  if (ss !== 'ladder' && theme === 'attic') {
    plush(d, 0.7, sy0 + 0.75, sh + 0.14, '#B9A3E0')
    plush(d, 0.75, sy0 + 1.7, sh + 0.14, '#F2B5C6')
  } else if (ss !== 'ladder') {
    // a vase of flowers and a little framed photo on top
    bouquet(d, 0.65, sy0 + 0.8, sh + 0.14)
    d.poly([[0.55, sy0 + sdy - 0.4, sh + 0.14], [0.55, sy0 + sdy - 1.2, sh + 0.14], [0.45, sy0 + sdy - 1.2, sh + 1.0], [0.45, sy0 + sdy - 0.4, sh + 1.0]], '#FFFFFF')
    d.poly([[0.56, sy0 + sdy - 0.5, sh + 0.26], [0.56, sy0 + sdy - 1.1, sh + 0.26], [0.47, sy0 + sdy - 1.1, sh + 0.9], [0.47, sy0 + sdy - 0.5, sh + 0.9]], '#E9B8A4')
  }
  spots.shelf = bounds([[0, sy0, 0], [sx + 0.4, sy0, 0], [sx + 0.4, sy0 + sdy, 0], [0, sy0 + sdy, sh + 1.2], [sx, sy0, sh + 1.2], [0, sy0, sh + 1.2]], 0)
  E()

  }

  if (theme === 'lofi') {
    // always the golden hour or night here: a warm dim room lit by the lamp and the lights
    if (tod === 'night') d.poly([[-T, -T, H], [-T, D, H], [-T, D, -B], [W, D, -B], [W, -T, -B], [W, -T, HR]], '#2A1838', ' opacity=".1" pointer-events="none"')
    glows.forEach(([x, y, r]) => d.raw(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r * 0.85}" fill="url(#glow)" opacity=".75" pointer-events="none"/>`))
    const win = P(5.7, 1.5, 3.5)
    d.raw(`<ellipse cx="${win[0].toFixed(1)}" cy="${win[1].toFixed(1)}" rx="70" ry="40" fill="#F3B98F" opacity=".12" pointer-events="none"/>`)
  }
  if (theme === 'japanese' && sky.lights) {
    // evening: the room goes soft and dim, the lantern and the shoji glow warm
    d.poly([[-T, -T, H], [-T, D, H], [-T, D, -B], [W, D, -B], [W, -T, -B], [W, -T, HR]], '#1A1838', ' opacity=".22" pointer-events="none"')
    glows.forEach(([x, y, r]) => d.raw(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r * 0.9}" fill="url(#glow)" opacity=".7" pointer-events="none"/>`))
    const sj = P(0.05, 8.0, 3.5)
    d.raw(`<ellipse cx="${sj[0].toFixed(1)}" cy="${sj[1].toFixed(1)}" rx="34" ry="50" fill="url(#halo)" opacity=".35" pointer-events="none"/>`)
  }
  if (o.season && SEASON_SPOT[theme]) seasonal(d, o.season, ...SEASON_SPOT[theme], sky.lights)
  if (theme === 'study') {
    // the room is dark; only the lamps and the window light it
    d.poly([[-T, -T, H], [-T, D, H], [-T, D, -B], [W, D, -B], [W, -T, -B], [W, -T, HR]], '#0E1338', ' opacity=".34" pointer-events="none"')
    glows.forEach(([x, y, r]) => d.raw(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r * 0.75}" fill="url(#glow)" opacity=".55" pointer-events="none"/>`))
    const wl = P(7.8, 2.5, 0)
    d.raw(`<ellipse cx="${wl[0].toFixed(1)}" cy="${wl[1].toFixed(1)}" rx="60" ry="24" fill="#8FB0FF" opacity=".08" pointer-events="none"/>`)
  }
  const svg = `<svg role="img" aria-label="Your room" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet">${d.out.join('')}</svg>`
  // walls and floor are not boxes, so they get exact outlines (in percent) for clicking
  const outline = (ps) => ps.map((c) => { const [x, y] = P(...c); return `${(((x - VB.x) / VB.w) * 100).toFixed(2)}% ${(((y - VB.y) / VB.h) * 100).toFixed(2)}%` }).join(', ')
  const shapes = {
    floor: [outline([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]])],
    walls: [outline([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]]), outline(rightWall)],
  }
  return { svg, spots, shapes, bookSpots: SHELF.spots }
}

/* =====================================================================
   The new rooms. Each one has its own shape, not only its own furniture:
   a cabin with a pointed roof, an observatory with a dome, a seaside studio
   with a deck, and a pastel room with a raised platform.
   ===================================================================== */

const f = (n) => n.toFixed(1)
const at2 = (x, y, z) => P(x, y, z).map(f).join(',')

// walls and floor of a room. left(y) and right(x) give the height of each wall's top edge.
function shell(S, { W = 10, D = 10, left, right, wallL, wallR, floor, floorLine, base = 0.55, t = 0.32, planks = 'floor' }) {
  const { d, G, E } = S
  const N = 24
  const topL = Array.from({ length: N + 1 }, (_, i) => { const y = D - (D * i) / N; return [0, y, left(y)] })       // front → back
  const topR = Array.from({ length: N + 1 }, (_, i) => { const x = (W * i) / N; return [x, 0, right(x)] })          // back → front
  d.raw(`<defs>
    <linearGradient id="nwL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wallL[0]}"/><stop offset="1" stop-color="${wallL[1]}"/></linearGradient>
    <linearGradient id="nwR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wallR[0]}"/><stop offset="1" stop-color="${wallR[1]}"/></linearGradient>
    <linearGradient id="nfl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(floor, 0.05)}"/><stop offset="1" stop-color="${shade(floor, -0.06)}"/></linearGradient></defs>`)
  d.raw(`<ellipse cx="${f(P(W / 2, D / 2, 0)[0])}" cy="${f(P(W, D, -base)[1] - 4)}" rx="125" ry="9" fill="#000" opacity=".25" filter="url(#soft)"/>`)
  d.poly([[-t, D, 0], [W, D, 0], [W, D, -base], [-t, D, -base]], shade(floor, -0.22))
  d.poly([[W, -t, 0], [W, D, 0], [W, D, -base], [W, -t, -base]], shade(floor, -0.32))
  G('walls')
  // wall thickness: the top edges, then the cut ends
  d.poly([...topL, ...topL.slice().reverse().map(([x, y, z]) => [x - t, y, z])], shade(wallL[0], 0.3))
  d.poly([...topR, ...topR.slice().reverse().map(([x, y, z]) => [x, y - t, z])], shade(wallR[0], 0.3))
  d.poly([[-t, -t, left(0)], [0, -t, left(0)], [0, 0, left(0)], [-t, 0, left(0)]], shade(wallL[0], 0.3))
  d.poly([[-t, D, 0], [0, D, 0], [0, D, left(D)], [-t, D, left(D)]], shade(wallL[1], -0.14))
  d.poly([[W, -t, 0], [W, 0, 0], [W, 0, right(W)], [W, -t, right(W)]], shade(wallR[1], -0.1))
  d.poly([[0, 0, 0], [0, D, 0], ...topL], 'url(#nwL)')
  d.poly([[0, 0, 0], ...topR, [W, 0, 0]], 'url(#nwR)')
  E()
  G('floor')
  d.poly([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], 'url(#nfl)')
  if (planks === 'floor') {
    for (let i = 1; i < D; i++) d.line([[0, i, 0], [W, i, 0]], floorLine, 1, ' opacity=".5"')
    for (let i = 0; i < D; i++) d.line([[2 + (i % 3) * 3 + (i % 2), i, 0], [2 + (i % 3) * 3 + (i % 2), i + 1, 0]], floorLine, 1, ' opacity=".35"')
  }
  E()
  // soft shadow in the corner
  d.poly([[0, 0, 0], [0, 0.7, 0], [0, 0.7, left(0.7)], [0, 0, left(0)]], '#000', ' opacity=".05"')
  d.poly([[0, 0, 0], [0.7, 0, 0], [0.7, 0, right(0.7)], [0, 0, right(0)]], '#000', ' opacity=".06"')
  return { topL, topR }
}

// a window on the right wall, with whatever view(x0,x1,z0,z1) draws behind the glass
function viewWindow(S, { x0, x1, z0, z1, frame, bars = [], arch = false, view }) {
  const { d, spots } = S
  const id = 'vw' + ++softN
  const outline = (k) => {
    if (!arch) return [[x0 - k, 0.02, z0 - k], [x1 + k, 0.02, z0 - k], [x1 + k, 0.02, z1 + k], [x0 - k, 0.02, z1 + k]]
    const r = (x1 - x0) / 2 + k, cx = (x0 + x1) / 2, top = z1 - r + k
    return [[x0 - k, 0.02, z0 - k], [x1 + k, 0.02, z0 - k], [x1 + k, 0.02, top], ...Array.from({ length: 17 }, (_, i) => { const a = (Math.PI * i) / 16; return [cx + r * Math.cos(a), 0.02, top + r * Math.sin(a)] }), [x0 - k, 0.02, top]]
  }
  d.poly(outline(0.18), frame)
  d.raw(`<clipPath id="${id}"><polygon points="${pts(outline(0))}"/></clipPath><g clip-path="url(#${id})">`)
  d.poly(outline(0), 'url(#sky)')
  view(x0, x1, z0, z1)
  d.flushWeather()
  if (S.photo) wallImage(d, x0, x1, z0, z1, S.photo)
  d.raw('</g>')
  bars.forEach(([a, b, c, e]) => d.poly([[a, 0.04, b], [c, 0.04, b], [c, 0.04, e], [a, 0.04, e]], frame))
  spots.window = bounds([[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], 1)
}
const sun = (d, sky, x, z) => { const o = P(x, 0.03, z); d.raw(`<circle cx="${f(o[0])}" cy="${f(o[1])}" r="10" fill="${sky.orb}" opacity=".22"/><circle cx="${f(o[0])}" cy="${f(o[1])}" r="5" fill="${sky.orb}"/>`) }
function stars(d, list, r = 1) { list.forEach(([x, y, z], i) => { const p = P(x, y, z); d.raw(`<circle class="twinkle" style="animation-delay:${(i % 5) * 0.4}s" cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" fill="#FFF6D8"/>`) }) }
function rugEllipse(d, cx, cy, rx, ry, fill, extra = '') {
  d.poly(Array.from({ length: 40 }, (_, i) => [cx + rx * Math.cos((Math.PI * 2 * i) / 40), cy + ry * Math.sin((Math.PI * 2 * i) / 40), 0.02]), fill, extra)
}


// a bed with its head against the left wall, from y0 to y1, reaching len into the room
function bedHeadLeft(d, { y0, y1, len, base, mattressZ, blanket, wood, head, pillow = '#FFFFFF' }) {
  const x1 = 0.3 + len, mt = mattressZ
  d.shadow(0, y0 - 0.2, x1 + 0.3, y1 + 0.3, 0.18)
  // the headboard against the wall, with a rounded top
  const r = 0.55, hh = mt + 1.5
  const prof = [[y0, 0], ...Array.from({ length: 7 }, (_, i) => { const a = Math.PI / 2 * (i / 6); return [y0 + r - r * Math.cos(a), hh - r + r * Math.sin(a)] }),
    ...Array.from({ length: 7 }, (_, i) => { const a = Math.PI / 2 * (i / 6); return [y1 - r + r * Math.sin(a), hh - r + r * Math.cos(a)] }), [y1, 0]]
  d.poly(prof.map(([y, z]) => [0.02, y, z]), shade(head, -0.2))
  d.poly([[0.02, y1, 0], [0.32, y1, 0], [0.32, y1, hh - r], [0.02, y1, hh - r]], shade(head, -0.12))
  d.poly(prof.map(([y, z]) => [0.32, y, z]), head)
  for (let i = 1; i < 6; i++) { const y = y0 + ((y1 - y0) * i) / 6; d.line([[0.33, y, 0.5], [0.33, y, hh - 0.25]], shade(head, -0.1), 0.9, ' opacity=".7"') }
  // frame, mattress, pillows, blanket
  d.box(0.32, y0, 0, len, y1 - y0, base, [shade(wood, 0.15), wood, shade(wood, -0.12)])
  soft(d, 0.36, y0 + 0.05, base, len - 0.08, y1 - y0 - 0.1, mt - base, ['#FFFFFF', '#F2EDF6', '#E4DCEC'], 0.3)
  const pw = (y1 - y0 - 0.5) / 2
  soft(d, 0.5, y0 + 0.2, mt, 0.95, pw, 0.5, [pillow, shade(pillow, -0.04), shade(pillow, -0.1)], 0.38, 2)
  soft(d, 0.5, y0 + 0.3 + pw, mt, 0.95, pw, 0.5, [pillow, shade(pillow, -0.04), shade(pillow, -0.1)], 0.38, 2)
  duvet(d, 1.55, y0 + 0.02, x1 - 0.02, y1 - 0.02, mt + 0.08, Math.min(0.75, mt - base - 0.05), blanket)
  return mt + 0.1
}

/* ---------- 1. the Scandinavian cabin: a pointed roof, a fireplace, snow outside ---------- */

function cabinScene(S) {
  const { d, room, sky, spots, G, E, glow, books, notes, events, diaryToday, leaves } = S
  const lit = sky.lights
  const pine = '#E9CFA6', pineD = '#D7B78B', beam = '#9C7650'
  const left = (y) => (y <= 5 ? 6.2 + (4.2 * y) / 5 : 6.2 + (4.2 * (10 - y)) / 5)
  const right = () => 6.2
  shell(S, { left, right, wallL: ['#F0DCBC', pine], wallR: ['#E8D0AA', pineD], floor: '#EADFCB', floorLine: '#D2C2A6' })
  // wooden boards on both walls
  for (let z = 0.6; z < 10.4; z += 0.55) {
    const yA = z <= 6.2 ? 0 : (5 * (z - 6.2)) / 4.2, yB = z <= 6.2 ? 10 : 10 - (5 * (z - 6.2)) / 4.2
    if (yB - yA > 0.2) d.line([[0.01, yA, z], [0.01, yB, z]], '#C9A77A', 0.7, ' opacity=".55"')
    if (z < 6.2) d.line([[0, 0.01, z], [10, 0.01, z]], '#C29E70', 0.7, ' opacity=".5"')
  }
  // the beams under the roof
  d.poly([[0.02, 0, 6.2], [0.02, 5, 10.4], [0.02, 10, 6.2], [0.02, 9.55, 6.2], [0.02, 5, 9.95], [0.02, 0.45, 6.2]], beam)
  d.poly([[0.03, 1.6, 7.55], [0.03, 8.4, 7.55], [0.03, 8.4, 7.85], [0.03, 1.6, 7.85]], beam)
  d.box(0, 0, 6.0, 10, 0.35, 0.3, [shade(beam, 0.15), beam, shade(beam, -0.1)])
  // a round paper star hanging in the gable
  const st = P(0.05, 5, 8.9)
  d.raw(`<path d="M${f(st[0])},${f(st[1] - 14)} V${f(st[1] - 6)}" stroke="#B89B78" stroke-width=".6"/><path transform="translate(${f(st[0])} ${f(st[1])})" d="M0,-6 L1.8,-1.8 L6,-1.5 L2.8,1.3 L3.8,5.6 L0,3.2 L-3.8,5.6 L-2.8,1.3 L-6,-1.5 L-1.8,-1.8z" fill="${lit ? '#FFE3A8' : '#FFF6E6'}"/>`)
  if (lit) glow(st[0], st[1], 22)

  // the window over the bed: a snowy pine forest
  G('window')
  viewWindow(S, { x0: 6.6, x1: 9.2, z0: 3.3, z1: 5.5, frame: '#FFFFFF', bars: [[7.85, 3.3, 7.95, 5.5], [6.6, 4.35, 9.2, 4.45]], view: (x0, x1, z0, z1) => {
    sun(d, sky, 8.6, 5.0)
    d.poly([[x0, 0.03, z0], [x1, 0.03, z0], [x1, 0.03, 3.9], [x0, 0.03, 4.2]], lit ? '#C9CFE6' : '#F4F7FB')
    ;[[6.8, 3.7, 1.1], [7.3, 3.6, 1.5], [7.9, 3.75, 1.0], [8.4, 3.55, 1.35], [8.95, 3.7, 1.15]].forEach(([x, z, h]) => {
      d.poly([[x - 0.32, 0.035, z], [x + 0.32, 0.035, z], [x, 0.035, z + h]], lit ? '#30485A' : '#4E7A68')
      d.poly([[x - 0.18, 0.036, z + h * 0.45], [x + 0.18, 0.036, z + h * 0.45], [x, 0.036, z + h * 0.82]], '#FFFFFF', ' opacity=".8"')
    })
  } })
  d.box(6.4, 0, 3.15, 3.0, 0.4, 0.1, ['#FFFFFF', '#EEE6DA', '#E2D8C8'])
  E()

  // the bed under the window, the head against the wall
  G('bed')
  const bw = '#C9A57E'
  d.shadow(5.9, 0.2, 9.9, 5.4, 0.18)
  d.box(6.0, 0.15, 0, 3.7, 0.35, 2.7, [shade(bw, 0.2), bw, shade(bw, -0.12)])
  for (let x = 6.4; x < 9.6; x += 0.45) d.line([[x, 0.51, 0.9], [x, 0.51, 2.5]], shade(bw, -0.16), 0.8)
  d.box(6.0, 0.5, 0, 3.7, 4.8, 0.75, [shade(bw, 0.2), bw, shade(bw, -0.12)])
  soft(d, 6.05, 0.55, 0.75, 3.6, 4.7, 0.6, ['#FFFFFF', '#F3EEE6', '#E6DED2'], 0.3)
  const mt = 1.35
  soft(d, 6.25, 0.7, mt, 1.55, 0.9, 0.5, ['#FFFFFF', '#F5F0E9', '#E7E0D5'], 0.38, 2)
  soft(d, 7.95, 0.7, mt, 1.55, 0.9, 0.5, ['#FFFFFF', '#F5F0E9', '#E7E0D5'], 0.38, 2)
  duvet(d, 6.0, 1.7, 9.68, 5.27, mt + 0.08, 0.7, S.blanket)
  // a red knitted throw across the foot of the bed
  d.poly([[6.0, 3.7, mt + 0.1], [9.68, 3.7, mt + 0.1], [9.68, 4.7, mt + 0.1], [6.0, 4.7, mt + 0.1]], '#C9564F')
  d.poly([[9.7, 3.7, mt + 0.1], [9.7, 4.7, mt + 0.1], [9.7, 4.7, mt - 0.7], [9.7, 3.7, mt - 0.7]], '#A84540')
  for (let x = 6.2; x < 9.6; x += 0.35) d.line([[x, 3.75, mt + 0.11], [x + 0.15, 4.65, mt + 0.11]], '#F5E6D8', 0.8, ' opacity=".7"')
  openDiary(d, 7.0, 2.2, mt + 0.12, diaryToday)
  spots.bed = bounds([[5.9, 0.2, 0], [9.9, 0.2, 0], [9.9, 5.4, 0], [5.9, 5.4, 0], [6.0, 0.2, 2.8]], 0)
  E()

  // a tall bookcase in the corner
  G('shelf')
  spots.shelf = bookcase(d, { y0: 0.4, len: 2.6, depth: 1.25, h: 5.0, levels: [0.12, 1.35, 2.55, 3.75], wood: '#D9BC93', books })
  E()
  // a writing desk on the right wall with a pinboard above it
  G('desk')
  wallDesk(d, { x0: 1.7, x1: 4.9, depth: 1.7, top: 2.5, wood: '#D6B48A', drawers: 'none' })
  calendarFront(d, 2.0, 2.7, 1.25, 2.5, 0.85, events)
  spots.desk = bounds([[1.9, 1.0, 2.5], [2.9, 1.0, 2.5], [2.9, 1.3, 3.4], [1.9, 1.3, 3.4]], 3)
  mug(d, 3.4, 1.0, 2.5, '#C9564F', !lit)
  deskLamp(d, 4.3, 0.4, 2.5, lit, glow, '#2F3A44')
  E()
  G('board')
  d.box(1.9, 0, 3.6, 2.8, 0.1, 1.7, ['#BC9A6E', '#C9A77A', '#AE8D62'])
  ;[0, 1, 2, 3].slice(0, Math.max(2, Math.min(notes + 1, 4))).forEach((i) => {
    const u = 2.1 + i * 0.62
    d.poly([[u, 0.12, 4.0 + (i % 2) * 0.25], [u + 0.48, 0.12, 4.0 + (i % 2) * 0.25], [u + 0.48, 0.12, 4.65 + (i % 2) * 0.25], [u, 0.12, 4.65 + (i % 2) * 0.25]], ['#FFFFFF', '#F7D9C4', '#E9EEF4', '#FBE7A6'][i])
  })
  spots.board = bounds([[1.9, 0, 3.6], [4.7, 0, 3.6], [4.7, 0, 5.3], [1.9, 0, 5.3]], 2)
  E()
  G('chair')
  spots.chair = chairFacingWall(d, 3.2, 2.4, { color: '#E7DCCB', wood: '#B98F63', style: 'classic' })
  E()


  // the stone fireplace, right under the top of the roof
  const fy0 = 3.6, fy1 = 6.4, fd = 1.4
  d.shadow(0, fy0 - 0.2, fd + 0.6, fy1 + 0.2, 0.2)
  d.box(0, fy0 + 0.45, 3.4, 0.9, fy1 - fy0 - 0.9, 5.6, ['#D9D3CB', '#CFC8BF', '#BEB6AC'])
  d.box(0, fy0, 0, fd, fy1 - fy0, 3.4, ['#DCD6CE', '#CDC6BD', '#BBB3A9'])
  // stones
  let r = 3
  const rr = () => (r = (r * 16807) % 2147483647) / 2147483647
  for (let z = 0.35; z < 8.6; z += 0.55) {
    const ya = z < 3.4 ? fy0 : fy0 + 0.45, yb = z < 3.4 ? fy1 : fy1 - 0.45, xf = z < 3.4 ? fd : 0.9
    for (let y = ya + 0.1 + rr() * 0.3; y < yb - 0.35; y += 0.55 + rr() * 0.25) d.raw(`<ellipse cx="${f(P(xf + 0.01, y + 0.2, z)[0])}" cy="${f(P(xf + 0.01, y + 0.2, z)[1])}" rx="${f(3.4 + rr() * 1.5)}" ry="${f(2.2 + rr())}" fill="${['#C4BDB3', '#D5CFC6', '#B9B1A6'][Math.floor(rr() * 3)]}" opacity=".85" transform="skewY(-30) translate(0 0)"/>`.replace(' transform="skewY(-30) translate(0 0)"', ''))
  }
  // the opening and the fire
  const o = [[fd + 0.01, fy0 + 0.6, 0.15], [fd + 0.01, fy1 - 0.6, 0.15], [fd + 0.01, fy1 - 0.6, 1.9], [fd + 0.01, (fy0 + fy1) / 2, 2.35], [fd + 0.01, fy0 + 0.6, 1.9]]
  d.poly(o, '#2B2220')
  const fc = P(fd + 0.02, (fy0 + fy1) / 2, 0.3)
  d.raw(`<g class="flame"><path d="M${f(fc[0] - 9)},${f(fc[1])} q2,-14 6,-18 q-1,8 4,10 q1,-9 6,-14 q2,10 -1,22 z" fill="#F29A3D"/><path d="M${f(fc[0] - 5)},${f(fc[1])} q2,-9 5,-11 q0,6 3,6 q1,-5 3,-7 q1,7 -2,12 z" fill="#FFD36B"/></g>`)
  d.raw(`<path d="M${f(fc[0] - 11)},${f(fc[1] + 1)} l18,-4 M${f(fc[0] - 9)},${f(fc[1] - 2)} l16,5" stroke="#6B4A33" stroke-width="2.4" stroke-linecap="round"/>`)
  glow(fc[0], fc[1] - 6, lit ? 60 : 34)
  d.raw(`<ellipse cx="${f(P(fd + 1.6, (fy0 + fy1) / 2, 0)[0])}" cy="${f(P(fd + 1.6, (fy0 + fy1) / 2, 0)[1])}" rx="46" ry="16" fill="#FFB86B" opacity="${lit ? 0.22 : 0.1}"/>`)
  // the mantel: a wooden shelf with candles, the mood jar and a little framed picture
  d.box(0, fy0 - 0.1, 3.4, fd + 0.15, fy1 - fy0 + 0.2, 0.22, [shade(beam, 0.25), beam, shade(beam, -0.1)])
  ;[[0.6, fy0 + 0.35, 0.55], [0.6, fy0 + 0.75, 0.35]].forEach(([x, y, h]) => { d.cylinder(x, y, 3.62, 0.13, h, '#FBF3E6'); const fl = P(x, y, 3.62 + h + 0.15); d.raw(`<ellipse cx="${f(fl[0])}" cy="${f(fl[1])}" rx="1.2" ry="2.2" fill="#F6C46B"/>`); if (lit) glow(fl[0], fl[1], 10) })
  moodJar(S, 0.65, fy1 - 0.6, 3.62)
  G('art'); art(d, room.art || 'mountains', 'left', fy0 + 1.05, fy1 - 1.05, 4.6, 5.8, '#E9DCC4'); spots.art = bounds([[0, fy0 + 0.9, 4.5], [0, fy1 - 0.9, 4.5], [0, fy1 - 0.9, 5.9], [0, fy0 + 0.9, 5.9]], 1); E()
  // logs stacked beside the fireplace
  ;[[0.3, 6.65], [0.75, 6.65], [0.52, 6.65]].forEach(([x, y], i) => { const z = i === 2 ? 0.42 : 0.2; const c = P(x, y, z); d.raw(`<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="4" ry="3.6" fill="#B08560"/><ellipse cx="${f(c[0] + 0.6)}" cy="${f(c[1])}" rx="2.4" ry="2.2" fill="#E3C79D"/>`) })

  // a sheepskin rug and an armchair by the fire
  G('rug')
  const rc = P(4.4, 6.6, 0.02)
  d.raw(`<path d="M${f(rc[0] - 40)},${f(rc[1])} q6,-14 22,-17 q10,-6 24,-2 q18,2 30,12 q4,8 -8,14 q-14,10 -34,9 q-22,0 -30,-6 q-8,-4 -4,-10z" fill="#FBF7F0"/><path d="M${f(rc[0] - 30)},${f(rc[1] - 2)} q10,-6 20,-4 M${f(rc[0])},${f(rc[1] - 8)} q12,2 18,8 M${f(rc[0] - 10)},${f(rc[1] + 6)} q12,2 24,-2" stroke="#E8E0D4" stroke-width="1.2" fill="none"/>`)
  E()
  soft(d, 0.1, 7.3, 0, 1.9, 2.1, 1.1, ['#7C8F7A', '#6F826D', '#5F715E'], 0.3)
  soft(d, 0.0, 7.2, 1.1, 0.55, 2.3, 1.9, ['#869985', '#7C8F7A', '#6A7D69'], 0.3)
  soft(d, 0.3, 7.15, 1.1, 1.7, 0.4, 0.9, ['#869985', '#7C8F7A', '#6A7D69'], 0.2)
  soft(d, 0.3, 9.15, 1.1, 1.7, 0.4, 0.9, ['#869985', '#7C8F7A', '#6A7D69'], 0.2)
  soft(d, 0.6, 7.6, 1.1, 1.3, 1.5, 0.35, ['#91A390', '#869985', '#73866F'], 0.3, 1)
  d.poly([[0.55, 8.6, 3.0], [0.55, 9.5, 3.0], [1.9, 9.5, 1.1], [1.9, 9.5, 0.4], [1.9, 8.7, 0.4], [1.9, 8.6, 1.5]], '#E8DCC8', ' opacity=".95"')
  // a floor lamp next to the armchair
  const fl = P(1.0, 9.85, 0)
  d.raw(`<path d="M${f(fl[0])},${f(fl[1])} V${f(fl[1] - 70)}" stroke="#2F3A44" stroke-width="1.6"/><path d="M${f(fl[0] - 9)},${f(fl[1] - 70)} h18 l-4,-12 h-10z" fill="${lit ? '#FDEBC4' : '#F3EADB'}"/>`)
  if (lit) glow(fl[0], fl[1] - 64, 40)
  nightstand(d, 5.0, 0.15, '#C9A57E', sky.lights, glow, '#F2E6D4')
  plant(d, 9.7, 8.1, leaves)
  if (sky.beam) d.poly([[6.4, 0.6, 0.02], [9.4, 0.6, 0.02], [8.6, 4.8, 0.02], [5.6, 4.8, 0.02]], 'url(#beam)')
  // a shelf over the armchair with plants and candles, books on the floor, a lantern by the fire
  d.box(0, 7.1, 4.5, 0.6, 2.4, 0.12, [shade('#C9A57E', 0.15), '#C9A57E', shade('#C9A57E', -0.1)])
  pottedPlant(d, 0.3, 7.5, 'trail', 0.6, '#F2EBDD')
  ;[[0.3, 8.3, 0.4], [0.3, 8.6, 0.28]].forEach(([x, y, h]) => { const lift = P(x, y, 4.62)[1] - P(x, y, 0)[1]; d.raw(`<g transform="translate(0 ${f(lift)})">`); d.cylinder(x, y, 0, 0.11, h, '#FBF3E6'); d.raw('</g>') })
  d.box(0.12, 9.0, 4.62, 0.4, 0.3, 0.5, '#8E7CC3')
  ;[['#C9564F', 0.18], ['#E9DCC5', 0.14], ['#7C8F7A', 0.16]].reduce((z, [c, h]) => { d.box(2.3, 9.1, z, 0.8, 0.55, h, c); return z + h }, 0)
  const lt = P(1.8, 6.95, 0)
  d.raw(`<rect x="${f(lt[0] - 4)}" y="${f(lt[1] - 14)}" width="8" height="12" rx="1.5" fill="#2F3A44"/><rect x="${f(lt[0] - 2.6)}" y="${f(lt[1] - 12)}" width="5.2" height="8" rx="1" fill="${sky.lights ? '#FFE3A8' : '#F3EADB'}"/><path d="M${f(lt[0] - 2)},${f(lt[1] - 14)} q2,-4 4,0" stroke="#2F3A44" stroke-width="1" fill="none"/>`)
  if (sky.lights) glow(lt[0], lt[1] - 8, 16)
  livePet(S, { bed: [8.6, 2.9, mt + 0.15], floor: [4.6, 6.5], sill: [7.4, 0.25, 3.25] })
}

/* ---------- 2. the night observatory: a dome, a round window and a telescope ---------- */

function observatoryScene(S) {
  const { d, room, sky, spots, G, E, glow, books, notes, events, diaryToday, leaves } = S
  const left = (y) => 7.6 + 3.2 * Math.cos((Math.PI / 2) * (y / 10))
  const right = (x) => 7.6 + 3.2 * Math.cos((Math.PI / 2) * (x / 10))
  shell(S, { left, right, wallL: ['#2C3566', '#232B55'], wallR: ['#26305D', '#1D2550'], floor: '#7A5A44', floorLine: '#5E4434' })
  // stars and a constellation painted on the walls
  let r = 9
  const rr = () => (r = (r * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < 70; i++) {
    const side = rr() < 0.5, u = 0.3 + rr() * 9.4, z = 3.5 + rr() * (side ? left(u) - 4 : right(u) - 4)
    const p = P(...onWall(side ? 'left' : 'right', u, z, 0.02))
    d.raw(`<circle ${i % 4 ? '' : 'class="twinkle" '}style="animation-delay:${(i % 6) * 0.5}s" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(0.4 + rr() * 0.8)}" fill="#FFF3C9" opacity="${f(0.5 + rr() * 0.5)}"/>`)
  }
  const cons = [[1.5, 8.6], [2.6, 9.0], [3.5, 8.4], [4.6, 8.8], [5.2, 9.5]].map(([u, z]) => P(...onWall('left', u, z, 0.02)))
  d.raw(`<polyline points="${cons.map((p) => p.map(f).join(',')).join(' ')}" fill="none" stroke="#E9D9A6" stroke-width=".5" opacity=".6"/>`)
  cons.forEach((p) => d.raw(`<circle cx="${f(p[0])}" cy="${f(p[1])}" r="1.3" fill="#FFE9A8"/>`))
  // a golden rail around the dome
  d.line(Array.from({ length: 21 }, (_, i) => onWall('left', 10 - i * 0.5, left(10 - i * 0.5) - 0.35, 0.03)), '#C9A55A', 1.2)
  d.line(Array.from({ length: 21 }, (_, i) => onWall('right', i * 0.5, right(i * 0.5) - 0.35, 0.03)), '#C9A55A', 1.2)

  // the big round window with the moon
  G('window')
  const cx = 6.6, cz = 6.2, rw = 2.2
  const circ = (k) => Array.from({ length: 40 }, (_, i) => [cx + (rw + k) * Math.cos((Math.PI * 2 * i) / 40), 0.02, cz + (rw + k) * Math.sin((Math.PI * 2 * i) / 40)])
  d.poly(circ(0.3), '#C9A55A')
  const id = 'obw'
  d.raw(`<clipPath id="${id}"><polygon points="${pts(circ(0))}"/></clipPath><g clip-path="url(#${id})">`)
  d.poly(circ(0), 'url(#sky)')
  const moon = P(cx + 0.7, 0.03, cz + 0.6)
  d.raw(`<circle cx="${f(moon[0])}" cy="${f(moon[1])}" r="16" fill="#FFF6D8" opacity=".18"/><circle cx="${f(moon[0])}" cy="${f(moon[1])}" r="9" fill="#FFF3D0"/><circle cx="${f(moon[0] + 3)}" cy="${f(moon[1] - 2)}" r="2" fill="#E9DDB8"/><circle cx="${f(moon[0] - 3)}" cy="${f(moon[1] + 3)}" r="1.4" fill="#E9DDB8"/>`)
  stars(d, [[5.2, 0.03, 7.1], [5.8, 0.03, 5.4], [7.6, 0.03, 4.8], [5.0, 0.03, 6.0], [8.0, 0.03, 7.3], [6.3, 0.03, 7.6]], 0.9)
  d.flushWeather()
  if (S.photo) wallImage(d, cx - rw, cx + rw, cz - rw, cz + rw, S.photo)
  d.raw('</g>')
  ;[0, 1, 2, 3].forEach((i) => { const a = (Math.PI / 2) * i + Math.PI / 4; d.line([[cx, 0.04, cz], [cx + rw * Math.cos(a), 0.04, cz + rw * Math.sin(a)]], '#C9A55A', 1.1) })
  const hub = P(cx, 0.04, cz); d.raw(`<circle cx="${f(hub[0])}" cy="${f(hub[1])}" r="2.6" fill="#C9A55A"/>`)
  spots.window = bounds([[cx - rw, 0, cz - rw], [cx + rw, 0, cz - rw], [cx + rw, 0, cz + rw], [cx - rw, 0, cz + rw]], 1)
  E()

  // a curved bookcase with a globe on top
  G('shelf')
  spots.shelf = bookcase(d, { y0: 0.4, len: 3.0, depth: 1.3, h: 4.4, levels: [0.12, 1.15, 2.2, 3.25], wood: '#5B4334', books })
  const gb = P(0.65, 1.9, 4.55)
  d.raw(`<path d="M${f(gb[0])},${f(gb[1])} v-4" stroke="#C9A55A" stroke-width="1.4"/><circle cx="${f(gb[0])}" cy="${f(gb[1] - 12)}" r="8" fill="#5F86B3"/><path d="M${f(gb[0] - 5)},${f(gb[1] - 16)} q3,2 2,6 q4,1 6,-2 M${f(gb[0] + 1)},${f(gb[1] - 7)} q3,-2 5,0" fill="#7FB08A" stroke="#7FB08A"/><path d="M${f(gb[0] - 9)},${f(gb[1] - 12)} a9,9 0 0 0 18,0" stroke="#C9A55A" stroke-width="1" fill="none"/>`)
  E()

  // the telescope on its tripod, looking at the moon
  const tb = P(6.8, 2.4, 0), tt = P(6.8, 2.4, 2.6)
  d.raw(`<ellipse cx="${f(tb[0])}" cy="${f(tb[1] + 1)}" rx="16" ry="5" fill="#000" opacity=".2" filter="url(#soft)"/>`)
  ;[[-13, 4], [12, 4], [2, 9]].forEach(([dx, dy]) => d.raw(`<path d="M${f(tt[0])},${f(tt[1])} L${f(tb[0] + dx)},${f(tb[1] + dy)}" stroke="#4A3A2E" stroke-width="1.6"/>`))
  d.raw(`<g transform="translate(${f(tt[0])} ${f(tt[1])}) rotate(-38)"><rect x="-10" y="-4" width="34" height="8" rx="2" fill="#C9A55A"/><rect x="22" y="-5.5" width="7" height="11" rx="2" fill="#B38F44"/><rect x="-14" y="-2.5" width="6" height="5" rx="1" fill="#3A3350"/><rect x="0" y="-4" width="3" height="8" fill="#9C7C3A"/></g>`)

  // a desk on the right wall with a glowing moon lamp and star charts
  G('desk')
  wallDesk(d, { x0: 1.6, x1: 4.6, depth: 1.8, top: 2.5, wood: '#5B4334', drawers: 'left' })
  calendarFront(d, 3.0, 3.7, 1.3, 2.5, 0.85, events)
  spots.desk = bounds([[2.9, 1.1, 2.5], [3.9, 1.1, 2.5], [3.9, 1.4, 3.4], [2.9, 1.4, 3.4]], 3)
  d.poly([[1.9, 0.3, 2.51], [2.8, 0.3, 2.51], [2.8, 1.3, 2.51], [1.9, 1.3, 2.51]], '#E9DFC6')
  d.line([[2.1, 0.6, 2.52], [2.4, 0.9, 2.52], [2.6, 0.5, 2.52]], '#5F86B3', 0.8)
  const ml = P(4.2, 0.6, 2.5)
  d.raw(`<circle cx="${f(ml[0])}" cy="${f(ml[1] - 8)}" r="8" fill="#FFF0C4"/><circle cx="${f(ml[0] + 2)}" cy="${f(ml[1] - 10)}" r="1.4" fill="#EADBA6"/><rect x="${f(ml[0] - 3)}" y="${f(ml[1] - 1)}" width="6" height="2" fill="#C9A55A"/>`)
  glow(ml[0], ml[1] - 8, 40)
  moodJar(S, 2.2, 1.35, 2.5)
  E()
  G('board')
  // a chart of the moon's phases above the desk
  d.box(1.6, 0, 3.7, 3.0, 0.08, 1.6, ['#1A2044', '#151B3B', '#11162F'])
  ;[0, 1, 2, 3, 4].forEach((i) => { const c = P(1.95 + i * 0.58, 0.1, 4.5); d.raw(`<circle cx="${f(c[0])}" cy="${f(c[1])}" r="3.6" fill="#3A4170"/><path d="M${f(c[0])},${f(c[1] - 3.6)} a3.6,3.6 0 0 ${i < 2 ? 1 : 0} 0,7.2 a${f(Math.abs(2 - i) * 1.8)},3.6 0 0 ${i < 2 ? 0 : 1} 0,-7.2" fill="#FFF3D0"/>`) })
  spots.board = bounds([[1.6, 0, 3.7], [4.6, 0, 3.7], [4.6, 0, 5.3], [1.6, 0, 5.3]], 2)
  E()
  G('chair')
  spots.chair = chairFacingWall(d, 3.1, 2.5, { color: '#3E4A86', wood: '#5B4334', style: 'classic' })
  E()

  // a daybed along the left wall with a star blanket
  G('bed')
  const mt = bedHeadLeft(d, { y0: 5.6, y1: 8.9, len: 4.4, base: 0.7, mattressZ: 1.45, blanket: S.blanket, wood: '#5B4334', head: '#4A5596' })
  for (let i = 0; i < 16; i++) { const p = P(1.9 + (i % 4) * 0.7, 5.9 + Math.floor(i / 4) * 0.75 + (i % 3) * 0.08, mt + 0.02); d.raw(`<circle cx="${f(p[0])}" cy="${f(p[1])}" r=".8" fill="#FFE9A8"/>`) }
  soft(d, 1.25, 7.0, mt, 0.5, 0.8, 0.5, ['#F2D27A', '#E9C46A', '#D6B058'], 0.25, 1)
  openDiary(d, 2.3, 6.0, mt + 0.03, diaryToday)
  spots.bed = bounds([[0, 5.4, 0], [5.0, 5.4, 0], [5.0, 9.2, 0], [0, 9.2, 0], [0, 5.6, 3.3]], 0)
  E()
  G('art'); art(d, room.art || 'moon', 'left', 5.6, 8.8, 4.0, 6.0, '#C9A55A'); spots.art = bounds([[0, 5.4, 3.8], [0, 9.0, 3.8], [0, 9.0, 6.2], [0, 5.4, 6.2]], 1); E()

  // a round rug with constellations, and planets hanging from the dome
  G('rug')
  rugEllipse(d, 7.3, 7.1, 2.2, 2.2, '#26305D')
  rugEllipse(d, 7.3, 7.1, 1.95, 1.95, 'none', ' stroke="#C9A55A" stroke-width="1"')
  stars(d, [[6.6, 6.4, 0.03], [8.0, 6.6, 0.03], [7.4, 8.0, 0.03], [6.4, 7.6, 0.03], [8.4, 7.7, 0.03]], 1.1)
  E()
  pouf(d, 8.2, 8.6, '#E9C46A')
  ;[[6.2, 5.0, 8.4, '#E9A8B4', 6], [7.6, 6.2, 9.0, '#E9C46A', 8], [8.6, 4.6, 8.2, '#8FB7E0', 5]].forEach(([x, y, z, c, rr2]) => {
    const p = P(x, y, z), top = P(x, y, 11)
    d.raw(`<path d="M${f(p[0])},${f(top[1])} V${f(p[1] - rr2)}" stroke="#C9A55A" stroke-width=".5" opacity=".7"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${rr2}" fill="${c}"/>${c === '#E9C46A' ? `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${rr2 + 5}" ry="2" fill="none" stroke="#F6E3B0" stroke-width="1.2"/>` : ''}`)
  })
  plant(d, 9.1, 1.4, leaves)
  // the room is always a little dark, lit by lamps and the moon
  if (!sky.lights) d.poly([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]], '#1D2550', ' opacity=".12" pointer-events="none"')
  // a bedside table with a moon lamp, a stack of books by the telescope
  nightstand(d, 0.12, 4.55, '#5B4334', sky.lights, glow, '#FFF0C4')
  ;[['#8FB7E0', 0.2], ['#E9C46A', 0.16], ['#E9A8B4', 0.18]].reduce((z, [c, h]) => { d.box(5.0, 9.0, z, 0.85, 0.6, h, c); return z + h }, 0)
  livePet(S, { bed: [3.6, 8.0, mt + 0.05], floor: [7.0, 6.9], sill: null })
}

/* ---------- 3. the seaside studio: a glass wall to the sea and a deck outside ---------- */

function seasideScene(S) {
  const { d, room, sky, spots, G, E, glow, books, notes, events, diaryToday, leaves } = S
  const lit = sky.lights
  const left = () => 8.4, right = () => 8.4
  shell(S, { left, right, wallL: ['#FBF9F4', '#F1ECE2'], wallR: ['#F6F2EA', '#EAE3D6'], floor: '#EFE4D0', floorLine: '#DCCDB2' })
  // the deck outside, in front of the room
  const dk = '#C9A27A'
  d.poly([[10, 0, 0], [12.1, 0, 0], [12.1, 7.6, 0], [10, 7.6, 0]], '#D8B48C')
  for (let y = 0.5; y < 7.6; y += 0.5) d.line([[10, y, 0.01], [12.1, y, 0.01]], shade(dk, -0.12), 0.8)
  d.poly([[10, 7.6, 0], [12.1, 7.6, 0], [12.1, 7.6, -0.4], [10, 7.6, -0.4]], shade(dk, -0.2))
  d.poly([[12.1, 0, 0], [12.1, 7.6, 0], [12.1, 7.6, -0.4], [12.1, 0, -0.4]], shade(dk, -0.3))
  // blue and white stripes on the lower part of the left wall
  for (let y = 0; y < 10; y += 0.8) d.poly([[0.02, y, 0], [0.02, y + 0.4, 0], [0.02, y + 0.4, 2.6], [0.02, y, 2.6]], '#CFE0EE', ' opacity=".8"')
  d.box(0, 0, 2.6, 0.12, 10, 0.14, ['#FFFFFF', '#F2EEE6', '#E6E0D4'])

  // the whole right wall is glass, looking at the sea
  G('window')
  viewWindow(S, { x0: 1.2, x1: 9.6, z0: 0.15, z1: 7.6, frame: '#FFFFFF', bars: [[5.35, 0.15, 5.45, 7.6], [3.25, 0.15, 3.3, 7.6], [7.5, 0.15, 7.55, 7.6]], view: (x0, x1, z0, z1) => {
    sun(d, sky, 7.0, 5.4)
    d.poly([[x0, 0.03, z0], [x1, 0.03, z0], [x1, 0.03, 3.6], [x0, 0.03, 3.6]], lit ? '#2D4A7A' : '#5FA3CF')
    d.poly([[x0, 0.03, 2.2], [x1, 0.03, 2.2], [x1, 0.03, 3.0], [x0, 0.03, 3.0]], lit ? '#3A5C8E' : '#7BBADC', ' opacity=".7"')
    d.poly([[x0, 0.03, z0], [x1, 0.03, z0], [x1, 0.03, 1.4], [x0, 0.03, 1.7]], '#F2E2C2')
    d.poly([[x0, 0.03, 3.6], [2.6, 0.03, 4.4], [3.6, 0.03, 4.0], [4.3, 0.03, 3.6]], lit ? '#25385C' : '#8FB2A0', ' opacity=".8"')
    for (let i = 0; i < 9; i++) { const p = P(2.0 + i * 0.85, 0.03, 2.4 + (i % 3) * 0.35); d.raw(`<path d="M${f(p[0] - 3)},${f(p[1])} q3,-1.6 6,0" stroke="#FFFFFF" stroke-width=".7" fill="none" opacity=".7"/>`) }
    const sb = P(6.2, 0.03, 3.65)
    d.raw(`<path d="M${f(sb[0])},${f(sb[1])} v-11 l6,9z" fill="#FFFFFF"/><path d="M${f(sb[0] - 5)},${f(sb[1])} h11 l-2,2.5 h-7z" fill="#C9564F"/>`)
  } })
  // light curtains on both sides of the glass
  ;[[0.5, 1.3], [9.5, 10]].forEach(([a, b]) => { d.poly([[a, 0.3, 0.1], [b, 0.3, 0.1], [b, 0.3, 8.0], [a, 0.3, 8.0]], '#FFFFFF', ' opacity=".85"'); for (let x = a + 0.15; x < b; x += 0.25) d.line([[x, 0.31, 0.2], [x, 0.31, 7.9]], '#E6E0D4', 0.6) })
  d.line([[0.3, 0.32, 8.1], [10, 0.32, 8.1]], '#C9A27A', 1.6)
  E()

  // a rattan egg chair hanging near the glass
  G('chair')
  const hc = P(7.4, 3.0, 1.6), top = P(7.4, 3.0, 8.4)
  d.raw(`<ellipse cx="${f(P(7.4, 3.0, 0)[0])}" cy="${f(P(7.4, 3.0, 0)[1] + 1)}" rx="16" ry="5" fill="#000" opacity=".15" filter="url(#soft)"/>`)
  d.raw(`<path d="M${f(hc[0])},${f(top[1])} V${f(hc[1] - 26)}" stroke="#8C6A4A" stroke-width="1.2"/>`)
  d.raw(`<path d="M${f(hc[0] - 15)},${f(hc[1] - 6)} q-2,-24 15,-22 q17,-2 15,22 q-1,14 -15,14 q-14,0 -15,-14z" fill="#D9B98C"/>`)
  for (let i = 0; i < 6; i++) d.raw(`<path d="M${f(hc[0] - 14 + i * 5.6)},${f(hc[1] - 24 + Math.abs(2.5 - i) * 2)} q${f(-1 + i * 0.4)},14 ${f(1 - i * 0.4)},28" stroke="#BF9C6E" stroke-width=".8" fill="none"/>`)
  d.raw(`<ellipse cx="${f(hc[0])}" cy="${f(hc[1] - 3)}" rx="11" ry="5" fill="#FFFFFF"/><ellipse cx="${f(hc[0] - 2)}" cy="${f(hc[1] - 10)}" rx="6" ry="5" fill="#8FB7E0"/>`)
  spots.chair = screenSpot(hc[0] - 17, hc[1] - 30, 34, 40)
  E()

  // low shelves with books and shells along the left wall
  G('shelf')
  spots.shelf = bookcase(d, { y0: 0.5, len: 3.2, depth: 1.2, h: 3.2, levels: [0.12, 1.15, 2.15], wood: '#E8DCC6', books })
  ;[[0.5, 1.1, '#F4D7C8'], [0.5, 2.3, '#FFFFFF']].forEach(([x, y, c]) => { const p = P(x, y, 3.32); d.raw(`<path d="M${f(p[0] - 5)},${f(p[1])} q5,-9 10,0 z" fill="${c}"/><path d="M${f(p[0] - 3)},${f(p[1])} l3,-6 l3,6" stroke="#D9B8A6" stroke-width=".5" fill="none"/>`) })
  moodJar(S, 0.6, 3.2, 3.32)
  E()
  // a calendar on the wall, and a driftwood string with photos above the bed
  G('desk')
  const cy0 = 0.9, cy1 = 2.4
  d.poly([[0.03, cy0, 4.2], [0.03, cy1, 4.2], [0.03, cy1, 6.0], [0.03, cy0, 6.0]], '#FFFFFF')
  d.poly([[0.04, cy0, 5.5], [0.04, cy1, 5.5], [0.04, cy1, 6.0], [0.04, cy0, 6.0]], '#4F86B8')
  const cd = P(0.05, (cy0 + cy1) / 2, 4.55)
  d.raw(`<text transform="translate(${f(cd[0])} ${f(cd[1])}) skewY(-30)" font-size="10" font-family="Fraunces, Georgia, serif" fill="#3A3350" text-anchor="middle">${new Date().getDate()}</text>`)
  if (events > 0) { const dt = P(0.05, cy1, 6.0); d.raw(`<circle cx="${f(dt[0])}" cy="${f(dt[1])}" r="3.4" fill="#E07A8F" stroke="#FFF" stroke-width="1.2"/><text x="${f(dt[0])}" y="${f(dt[1] + 1.6)}" font-size="4.4" font-family="Figtree, sans-serif" font-weight="700" fill="#FFF" text-anchor="middle">${Math.min(events, 9)}</text>`) }
  spots.desk = bounds([[0, cy0, 4.2], [0, cy1, 4.2], [0, cy1, 6.0], [0, cy0, 6.0]], 2)
  E()
  G('board')
  d.line([onWall('left', 4.6, 6.6, 0.05), onWall('left', 9.4, 6.6, 0.05)], '#A68A6A', 2.4, ' stroke-linecap="round"')
  ;[0, 1, 2, 3].slice(0, Math.max(2, Math.min(notes + 1, 4))).forEach((i) => {
    const u = 5.0 + i * 1.1, z = 5.3 + (i % 2) * 0.15
    d.line([onWall('left', u + 0.4, 6.6, 0.06), onWall('left', u + 0.4, z + 0.95, 0.06)], '#A68A6A', 0.6)
    d.poly([onWall('left', u, z, 0.06), onWall('left', u + 0.8, z, 0.06), onWall('left', u + 0.8, z + 1.0, 0.06), onWall('left', u, z + 1.0, 0.06)], '#FFFFFF')
    d.poly([onWall('left', u + 0.08, z + 0.25, 0.07), onWall('left', u + 0.72, z + 0.25, 0.07), onWall('left', u + 0.72, z + 0.92, 0.07), onWall('left', u + 0.08, z + 0.92, 0.07)], ['#8FB7E0', '#F2C46B', '#7FB08A', '#E9A8B4'][i])
  })
  spots.board = bounds([[0, 4.6, 5.2], [0, 9.4, 5.2], [0, 9.4, 6.8], [0, 4.6, 6.8]], 2)
  E()
  // the bed: white linen with a blue striped throw
  G('bed')
  const mt = bedHeadLeft(d, { y0: 5.0, y1: 8.5, len: 4.4, base: 0.55, mattressZ: 1.35, blanket: S.blanket, wood: '#E3D5BD', head: '#F4EEE4' })
  for (let x = 3.0; x < 4.6; x += 0.32) d.poly([[x, 5.03, mt + 0.02], [x + 0.14, 5.03, mt + 0.02], [x + 0.14, 8.47, mt + 0.02], [x, 8.47, mt + 0.02]], '#4F86B8', ' opacity=".8"')
  soft(d, 1.25, 6.4, mt, 0.5, 0.8, 0.5, ['#A9C9EA', '#8FB7E0', '#7BA3CD'], 0.25, 1)
  openDiary(d, 1.9, 5.3, mt + 0.03, diaryToday)
  spots.bed = bounds([[0, 4.8, 0], [5.0, 4.8, 0], [5.0, 8.8, 0], [0, 8.8, 0], [0, 5.0, 3.2]], 0)
  E()
  // a surfboard leaning on the wall by the door
  const sb0 = P(0.3, 9.5, 0), sb1 = P(0.1, 9.5, 6.2)
  d.raw(`<path d="M${f(sb0[0] - 3)},${f(sb0[1])} Q${f(sb0[0] - 9)},${f((sb0[1] + sb1[1]) / 2)} ${f(sb1[0])},${f(sb1[1])} Q${f(sb0[0] + 7)},${f((sb0[1] + sb1[1]) / 2)} ${f(sb0[0] + 4)},${f(sb0[1])} z" fill="#F2C46B"/><path d="M${f(sb0[0])},${f(sb0[1] - 2)} L${f(sb1[0])},${f(sb1[1] + 4)}" stroke="#E07A5F" stroke-width="1.4"/>`)
  // a jute rug
  G('rug')
  rugEllipse(d, 7.0, 7.0, 2.0, 1.8, '#E3CDA4')
  rugEllipse(d, 7.0, 7.0, 1.35, 1.2, 'none', ' stroke="#CBB085" stroke-width="1.2"')
  rugEllipse(d, 7.0, 7.0, 0.7, 0.6, 'none', ' stroke="#CBB085" stroke-width="1.2"')
  E()
  // the deck: a lounge chair, a palm and a lantern
  // a striped deck chair
  ;[[10.45, 1.6], [11.55, 1.6], [10.45, 3.6], [11.55, 3.6]].forEach(([x, y]) => d.box(x, y, 0, 0.1, 0.1, 0.55, '#A97F55'))
  d.poly([[10.4, 1.5, 1.9], [11.7, 1.5, 1.9], [11.7, 2.4, 0.6], [11.7, 3.8, 0.55], [10.4, 3.8, 0.55], [10.4, 2.4, 0.6]], '#FFFFFF')
  for (let k = 0; k < 4; k++) { const x = 10.5 + k * 0.32; d.poly([[x, 1.5, 1.91], [x + 0.16, 1.5, 1.91], [x + 0.16, 2.4, 0.61], [x + 0.16, 3.8, 0.56], [x, 3.8, 0.56], [x, 2.4, 0.61]], '#4F86B8') }
  d.line([[10.4, 1.5, 1.9], [11.7, 1.5, 1.9]], '#A97F55', 1.6)
  plant(d, 11.1, 6.2, leaves)
  const ln = P(11.6, 0.6, 0)
  d.raw(`<rect x="${f(ln[0] - 4)}" y="${f(ln[1] - 13)}" width="8" height="12" rx="1.5" fill="#FFFFFF" stroke="#3A3350" stroke-width=".8"/><circle cx="${f(ln[0])}" cy="${f(ln[1] - 7)}" r="2" fill="#F6C46B"/>`)
  if (lit) glow(ln[0], ln[1] - 7, 18)
  // a rope railing along the deck
  ;[0.2, 2.6, 5.0, 7.4].forEach((y) => d.box(12.0, y, 0, 0.14, 0.14, 1.9, '#B98F63'))
  d.line([[12.07, 0.2, 1.75], [12.07, 2.6, 1.6], [12.07, 5.0, 1.75], [12.07, 7.4, 1.6]], '#D9C29A', 1.2)
  if (sky.beam) d.poly([[1.6, 0.6, 0.02], [9.4, 0.6, 0.02], [8.0, 6.0, 0.02], [0.4, 6.0, 0.02]], 'url(#beam)')
  // a bedside table with a shell lamp, a monstera by the glass, lanterns on the floor
  nightstand(d, 0.12, 3.95, '#E3D5BD', sky.lights, glow, '#F4D7C8')
  pottedPlant(d, 9.25, 1.1, 'leafy', 1.3, '#E3D5BD')
  ;[[4.4, 9.4], [4.95, 9.55]].forEach(([x, y], i) => { const b2 = P(x, y, 0); d.raw(`<rect x="${f(b2[0] - 3.5)}" y="${f(b2[1] - 11 + i * 3)}" width="7" height="${10 - i * 3}" rx="1.5" fill="#FFFFFF" stroke="#C9A27A" stroke-width=".8"/><circle cx="${f(b2[0])}" cy="${f(b2[1] - 6 + i * 2)}" r="1.6" fill="#F6C46B"/>`); if (sky.lights) glow(b2[0], b2[1] - 6, 12) })
  livePet(S, { bed: [3.6, 7.6, mt + 0.05], floor: [7.0, 6.8], sill: null })
}

/* ---------- 4. the pastel room: a raised sleeping platform, a cloud mirror and a desk setup ---------- */

function pastelScene(S) {
  const { d, room, sky, spots, G, E, glow, books, notes, events, diaryToday, leaves } = S
  const lit = sky.lights
  const left = () => 8.2, right = () => 8.2
  shell(S, { left, right, wallL: ['#FCE5E2', '#F7D6D1'], wallR: ['#F9DCD6', '#F2CCC6'], floor: '#FBF4EE', floorLine: '#EEDFE6', planks: 'none' })
  // a pastel checkerboard floor
  for (let x = 0; x < 10; x++) for (let y = 4; y < 10; y++) if ((x + y) % 2) d.poly([[x, y, 0.005], [x + 1, y, 0.005], [x + 1, y + 1, 0.005], [x, y + 1, 0.005]], '#E8DEF5')
  // the raised platform at the back, with a soft light under its edge
  const ph = 0.9, py = 4.2
  d.box(0, 0, 0, 10, py, ph, ['#F1E4D6', '#E6D3C0', '#D9C4AE'])
  for (let x = 1; x < 10; x += 1.4) d.line([[x, 0, ph + 0.001], [x, py, ph + 0.001]], '#DCC8B2', 0.8, ' opacity=".6"')
  d.poly([[0, py + 0.01, 0.05], [10, py + 0.01, 0.05], [10, py + 0.01, 0.2], [0, py + 0.01, 0.2]], lit ? '#E9B8F2' : '#F2DDF6', ` opacity="${lit ? 1 : 0.7}"`)
  if (lit) d.poly([[0, py, 0.01], [10, py, 0.01], [10, py + 0.9, 0.01], [0, py + 0.9, 0.01]], '#E9B8F2', ' opacity=".25" filter="url(#soft)"')
  d.box(4.6, py, 0, 1.6, 0.6, 0.45, ['#F1E4D6', '#E6D3C0', '#D9C4AE'])

  // an arched window with sheer curtains and a curtain of fairy lights
  G('window')
  viewWindow(S, { x0: 6.3, x1: 9.1, z0: 3.0, z1: 7.2, frame: '#FFFFFF', arch: true, bars: [[7.65, 3.0, 7.75, 6.0]], view: (x0, x1, z0, z1) => {
    sun(d, sky, 8.4, 6.0)
    ;[[6.6, 3.0, 1.2], [7.2, 3.0, 1.8], [7.9, 3.0, 1.4], [8.5, 3.0, 2.1]].forEach(([x, z, h], i) => d.poly([[x - 0.3, 0.03, z], [x + 0.3, 0.03, z], [x + 0.3, 0.03, z + h], [x - 0.3, 0.03, z + h]], lit ? '#3B3466' : ['#D7CDEA', '#E6D6E8', '#CFC6E6', '#E2D3EC'][i]))
    if (lit) for (let i = 0; i < 10; i++) { const p = P(6.5 + (i % 4) * 0.6, 0.035, 3.4 + Math.floor(i / 4) * 0.6); d.raw(`<rect x="${f(p[0])}" y="${f(p[1])}" width="1.6" height="1.6" fill="#F6D58B"/>`) }
  } })
  ;[[5.7, 6.3], [9.1, 9.7]].forEach(([a, b]) => d.poly([[a, 0.3, 2.6], [b, 0.3, 2.6], [b, 0.3, 7.6], [a, 0.3, 7.6]], '#FFFFFF', ' opacity=".75"'))
  for (let i = 0; i < 9; i++) { const x = 5.9 + i * 0.45; for (let j = 0; j < 4; j++) { const p = P(x, 0.32, 7.3 - j * 1.1 - (i % 2) * 0.4); d.raw(`<circle class="twinkle" style="animation-delay:${((i + j) % 5) * 0.4}s" cx="${f(p[0])}" cy="${f(p[1])}" r="1.1" fill="${lit ? '#FFE29A' : '#FFF4D6'}"/>`) } }
  E()

  // a floor bed on the platform, with plush toys and a cloud pillow
  G('bed')
  const z0 = ph
  d.shadow(0.2, 0.2, 5.0, 4.0, 0.1)
  soft(d, 0.3, 0.3, z0, 4.4, 3.6, 0.55, ['#FFFFFF', '#F6F0F4', '#ECE4EC'], 0.35)
  const mt = z0 + 0.55
  soft(d, 0.5, 0.45, mt, 1.6, 1.0, 0.5, ['#FFFFFF', '#F8F2F6', '#ECE4EC'], 0.42, 2)
  soft(d, 2.3, 0.45, mt, 1.6, 1.0, 0.5, ['#FFFFFF', '#F8F2F6', '#ECE4EC'], 0.42, 2)
  duvet(d, 0.3, 1.6, 4.7, 3.88, mt + 0.06, 0.45, S.blanket)
  for (let i = 0; i < 10; i++) { const p = P(0.7 + (i % 5) * 0.8, 2.1 + Math.floor(i / 5) * 0.9, mt + 0.07); d.raw(`<circle cx="${f(p[0])}" cy="${f(p[1])}" r="1.2" fill="#FFFFFF" opacity=".8"/>`) }
  plush(d, 4.1, 0.9, mt + 0.1, '#F2B5C6')
  plush(d, 3.5, 0.6, mt + 0.1, '#B9A3E0')
  openDiary(d, 1.2, 2.3, mt + 0.08, diaryToday)
  spots.bed = bounds([[0.2, 0.2, 0], [5.0, 0.2, 0], [5.0, 4.2, 0], [0.2, 4.2, 0], [0.3, 0.3, 2.5]], 0)
  E()
  // a little low table on the platform with a lamp shaped like a cloud
  d.box(6.2, 1.4, ph, 2.4, 1.6, 0.6, ['#FFFFFF', '#F4EEF2', '#EAE2EA'])
  const cl = P(7.6, 2.1, ph + 0.6)
  d.raw(`<path d="M${f(cl[0] - 9)},${f(cl[1] - 2)} q-3,-9 5,-9 q3,-7 9,-2 q8,-2 7,6 q4,5 -3,6 h-15 q-6,-1 -3,-1z" fill="${lit ? '#FFF1D6' : '#EFE4FB'}" stroke="#D9C9EE" stroke-width=".6"/>`)
  if (lit) glow(cl[0], cl[1] - 6, 36)
  mug(d, 6.7, 1.9, ph + 0.6, '#B9A3E0', true)

  // a desk setup along the left wall: monitor, keyboard, calendar, a cloud mirror above
  G('desk')
  const dx = 1.9, dy0 = 5.0, dy1 = 8.4, top = 2.5
  d.shadow(0, dy0 - 0.1, dx + 0.3, dy1 + 0.2, 0.14)
  ;[[0.15, dy0 + 0.1], [dx - 0.25, dy0 + 0.1], [0.15, dy1 - 0.25], [dx - 0.25, dy1 - 0.25]].forEach(([x, y]) => d.box(x, y, 0, 0.12, 0.12, top - 0.15, '#FFFFFF'))
  d.box(0, dy0, top - 0.15, dx, dy1 - dy0, 0.15, ['#FFFFFF', '#F4EEF2', '#E8DFE8'])
  d.box(0.3, 6.0, top, 0.2, 1.6, 1.2, ['#3A3350', '#2E2840', '#25202F'])
  d.poly([[0.51, 6.08, top + 0.1], [0.51, 7.52, top + 0.1], [0.51, 7.52, top + 1.1], [0.51, 6.08, top + 1.1]], lit ? '#B9A3E0' : '#D7E6F5')
  d.box(0.9, 6.2, top, 0.6, 1.2, 0.06, '#F2EEF6')
  deskCalendar(d, 1.5, 5.25, 5.85, top, 0.85, events)
  spots.desk = bounds([[1.2, 5.2, top], [1.6, 5.9, top], [1.6, 5.9, top + 1.0], [1.2, 5.2, top + 1.0]], 3)
  moodJar(S, 1.2, 7.95, top)
  E()
  G('board')
  // a wavy cloud mirror and a pegboard with photos
  const mp = Array.from({ length: 40 }, (_, i) => { const a = (Math.PI * 2 * i) / 40, w = 1 + 0.08 * Math.sin(a * 6); return onWall('left', 6.6 + 1.2 * w * Math.cos(a), 5.4 + 1.3 * w * Math.sin(a), 0.03) })
  d.poly(mp, '#F2E9F4')
  d.poly(mp.map(([x, y, z]) => [x + 0.01, 6.6 + (y - 6.6) * 0.86, 5.4 + (z - 5.4) * 0.86]), 'url(#sky)', ' opacity=".55"')
  d.poly([onWall('left', 8.3, 4.0, 0.03), onWall('left', 9.7, 4.0, 0.03), onWall('left', 9.7, 6.6, 0.03), onWall('left', 8.3, 6.6, 0.03)], '#FFFFFF')
  for (let i = 0; i < 12; i++) { const p = P(...onWall('left', 8.5 + (i % 3) * 0.5, 4.3 + Math.floor(i / 3) * 0.6, 0.04)); d.raw(`<circle cx="${f(p[0])}" cy="${f(p[1])}" r=".6" fill="#E3D6E6"/>`) }
  ;[0, 1, 2].slice(0, Math.max(2, Math.min(notes + 1, 3))).forEach((i) => d.poly([onWall('left', 8.45 + i * 0.4, 4.6 + i * 0.6, 0.05), onWall('left', 8.95 + i * 0.4, 4.6 + i * 0.6, 0.05), onWall('left', 8.95 + i * 0.4, 5.2 + i * 0.6, 0.05), onWall('left', 8.45 + i * 0.4, 5.2 + i * 0.6, 0.05)], ['#FBE7A6', '#CFE4F5', '#F7CFD9'][i]))
  spots.board = bounds([[0, 8.3, 4.0], [0, 9.7, 4.0], [0, 9.7, 6.6], [0, 8.3, 6.6]], 2)
  E()
  G('chair')
  const ch = P(2.7, 6.7, 0)
  d.raw(`<ellipse cx="${f(ch[0])}" cy="${f(ch[1] + 1)}" rx="14" ry="5" fill="#000" opacity=".12" filter="url(#soft)"/>`)
  d.cylinder(2.7, 6.7, 0.2, 0.07, 1.0, '#E3D6E6')
  soft(d, 2.1, 6.1, 1.2, 1.3, 1.3, 0.35, ['#FFFFFF', '#F6EEF4', '#EADFEA'], 0.5, 1)
  soft(d, 3.25, 6.0, 1.3, 0.4, 1.5, 1.6, ['#FFFFFF', '#F6EEF4', '#EADFEA'], 0.25)
  spots.chair = screenSpot(ch[0] - 16, ch[1] - 40, 34, 44)
  E()
  // a white cube shelf by the door, full of books and toys
  G('shelf')
  spots.shelf = bookcase(d, { y0: 8.6, len: 1.3, depth: 1.1, h: 2.4, levels: [0.12, 1.25], wood: '#FFFFFF', books, plushTop: false })
  plush(d, 0.55, 9.25, 2.52, '#A7D3C0')
  E()
  // a fluffy cloud rug and a bean bag
  G('rug')
  const rc = P(6.0, 7.2, 0.02)
  d.raw(`<path d="M${f(rc[0] - 36)},${f(rc[1] + 4)} q-8,-12 6,-14 q4,-12 18,-8 q10,-10 24,-2 q16,-2 14,10 q10,8 -2,14 q-6,8 -20,5 q-10,6 -22,0 q-16,4 -18,-5z" fill="#FFFFFF"/><path d="M${f(rc[0] - 20)},${f(rc[1] - 2)} q8,-4 16,0 M${f(rc[0] + 6)},${f(rc[1] - 8)} q8,-2 12,4" stroke="#EFE7F2" stroke-width="1.2" fill="none"/>`)
  E()
  soft(d, 7.9, 5.1, 0, 1.6, 1.5, 1.0, ['#C7B4EC', '#B9A3E0', '#A892D2'], 0.75, 2)
  plant(d, 9.5, 4.6, leaves)
  if (sky.beam) d.poly([[6.2, 0.6, 0.92], [9.2, 0.6, 0.92], [8.6, 4.0, 0.92], [5.6, 4.0, 0.92]], 'url(#beam)')
  // a shelf over the bed with toys and books, and a little glowing heart sign
  d.box(0.6, 0, 4.6, 3.8, 0.55, 0.12, ['#FFFFFF', '#F4EEF2', '#EAE2EA'])
  plush(d, 1.1, 0.3, 4.72, '#B9A3E0'); plush(d, 2.0, 0.3, 4.72, '#F2B5C6')
  ;[0, 1, 2, 3].forEach((i) => d.box(2.7 + i * 0.28, 0.06, 4.72, 0.24, 0.42, 0.7 - (i % 2) * 0.12, ['#F7CFD9', '#CFE4F5', '#FBE7A6', '#D8EBD9'][i]))
  const hs = P(5.0, 0.03, 5.8)
  d.raw(`<path transform="translate(${f(hs[0])} ${f(hs[1])}) skewY(30) scale(1.2)" d="M0,5 C-8,-1 -6,-8 -2.5,-8 C-1,-8 0,-7 0,-6 C0,-7 1,-8 2.5,-8 C6,-8 8,-1 0,5z" fill="none" stroke="${sky.lights ? '#FF9EC4' : '#F4A6C4'}" stroke-width="1.6"/>`)
  if (sky.lights) glow(hs[0], hs[1] - 3, 22)
  livePet(S, { bed: [3.3, 2.9, mt + 0.1], floor: [6.1, 7.1], sill: [7.7, 0.3, 3.05] })
}

const NEW_ROOMS = { cabin: cabinScene, observatory: observatoryScene, seaside: seasideScene, pastel: pastelScene }
