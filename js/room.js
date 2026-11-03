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
}

export const RUGS = {
  pink: { name: 'Pink', c: '#F2D7DF' },
  cream: { name: 'Cream', c: '#F3EADB' },
  blue: { name: 'Blue', c: '#D9E5F3' },
  sage: { name: 'Sage', c: '#DAE7DA' },
  none: { name: 'No rug', c: null },
}

export const STYLES = {
  shelfStyle: { tall: 'Tall bookcase', low: 'Low shelf', ladder: 'Ladder shelf', cube: 'Cube shelf' },
  deskStyle: { drawers: 'Desk with drawers', simple: 'Light table', trestle: 'Trestle desk' },
  bedStyle: { classic: 'Cozy bed', canopy: 'Canopy bed', platform: 'Low platform bed' },
  chairStyle: { classic: 'Wooden chair', office: 'Office chair', armchair: 'Armchair', stool: 'Round stool' },
  pet: { cat: 'Cat', dog: 'Dog', none: 'No pet' },
  wallStyle: { plain: 'Plain paint', stripes: 'Stripes', dots: 'Polka dots', floral: 'Flowers', brick: 'Painted brick', panels: 'Wood panels' },
  floorStyle: { planks: 'Planks', herringbone: 'Herringbone', tiles: 'Tiles', carpet: 'Soft carpet' },
}

// Whole-room looks. Choosing one also sets matching colours, which can still be changed one by one.
export const THEMES = {
  cozy: { name: 'Cozy room', note: 'Lavender, light wood, fairy lights' },
  attic: { name: 'Attic studio', note: 'Round window, wooden beams, plushies' },
  city: { name: 'Rainy city night', note: 'Big window, city lights, rain' },
}
export const THEME_PRESETS = {
  cozy: { wall: 'lavender', wallStyle: 'plain', floor: 'oak', floorStyle: 'planks', rug: 'pink', blanket: 'lilac', shelfWood: 'oak', deskWood: 'oak', bedWood: 'oak', chairColor: 'lilac', chairStyle: 'classic' },
  attic: { wall: 'peach', wallStyle: 'panels', floor: 'honey', floorStyle: 'planks', rug: 'cream', blanket: 'rose', shelfWood: 'white', deskWood: 'white', bedWood: 'oak', chairColor: 'cream', chairStyle: 'armchair' },
  city: { wall: 'night', wallStyle: 'plain', floor: 'walnut', floorStyle: 'planks', rug: 'blue', blanket: 'blue', shelfWood: 'walnut', deskWood: 'walnut', bedWood: 'walnut', chairColor: 'blue', chairStyle: 'classic', pet: 'cat', petColor: 'black' },
}

export const DEFAULT_ROOM = {
  theme: 'cozy',
  wall: 'lavender', floor: 'oak', rug: 'pink',
  shelfStyle: 'tall', shelfWood: 'oak',
  deskStyle: 'drawers', deskWood: 'oak',
  bedStyle: 'classic', bedWood: 'oak', blanket: 'lilac',
  chairStyle: 'classic', chairColor: 'lilac',
  pet: 'cat', petColor: 'black', wallStyle: 'plain', floorStyle: 'planks',
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
    poly(ps, fill, extra = '') { out.push(`<polygon points="${pts(ps)}" fill="${fill}"${extra}/>`) },
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

/* ---------- the room ---------- */

const BOOK_COLORS = ['#8E7CC3', '#E99AAE', '#7DB4A1', '#E5C36B', '#7FA3C8', '#D98F72', '#B9A3D6', '#93BFAE', '#C9788C', '#6F97C2']

/* ---------- the pet: drawn in detail, then scaled down onto the bed ---------- */

export const PET_COLORS = {
  black: { name: 'Black', base: '#3B3646', light: '#5E5770', dark: '#211E29', muzzle: '#4D465A', stripes: false },
  ginger: { name: 'Ginger', base: '#E09A58', light: '#F4C38D', dark: '#B4692F', muzzle: '#F7DDBE', stripes: true },
  grey: { name: 'Grey', base: '#9C9AA8', light: '#C4C2CD', dark: '#6C6A79', muzzle: '#DCDAE2', stripes: true },
  white: { name: 'White', base: '#F1EDE8', light: '#FFFFFF', dark: '#CFC7C0', muzzle: '#FFFFFF', stripes: false },
  brown: { name: 'Brown', base: '#8D6446', light: '#B48A66', dark: '#5E4029', muzzle: '#D9BC9C', stripes: false },
  golden: { name: 'Golden', base: '#D9A862', light: '#F0CD93', dark: '#A97A3C', muzzle: '#F6E3C2', stripes: false },
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


/* ---------- room styles: windows and details ---------- */

const ring = (cx, cz, r, n = 48) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((2 * Math.PI * i) / n), 0.02, cz + r * Math.sin((2 * Math.PI * i) / n)])

function roundWindow(d, sky, blanket) {
  const cx = 7.9, cz = 5.7, r = 1.75
  const wood = '#7A5A44'
  d.poly(ring(cx, cz, r + 0.32), wood)
  d.poly(ring(cx, cz, r + 0.12), shade(wood, 0.18))
  d.raw(`<clipPath id="roundw"><polygon points="${pts(ring(cx, cz, r))}"/></clipPath><g clip-path="url(#roundw)">`)
  d.poly(ring(cx, cz, r), 'url(#sky)')
  const orb = P(8.6, 0.03, cz + 0.9)
  d.raw(`<circle cx="${orb[0].toFixed(1)}" cy="${orb[1].toFixed(1)}" r="10" fill="${sky.orb}" opacity=".25"/><circle cx="${orb[0].toFixed(1)}" cy="${orb[1].toFixed(1)}" r="5" fill="${sky.orb}"/>`)
  d.poly([[cx - r, 0.03, cz - r], [cx - r, 0.03, cz - 0.6], [cx - 0.8, 0.03, cz - 0.2], [cx, 0.03, cz - 0.7], [cx + 0.9, 0.03, cz - 0.1], [cx + r, 0.03, cz - 0.5], [cx + r, 0.03, cz - r]], sky.hills, ' opacity=".7"')
  d.raw('</g>')
  d.poly([[cx - 0.07, 0.04, cz - r], [cx + 0.07, 0.04, cz - r], [cx + 0.07, 0.04, cz + r], [cx - 0.07, 0.04, cz + r]], wood)
  d.poly([[cx - r, 0.04, cz - 0.07], [cx + r, 0.04, cz - 0.07], [cx + r, 0.04, cz + 0.07], [cx - r, 0.04, cz + 0.07]], wood)
  // one soft curtain tied to the side
  const c = shade(blanket, 0.6)
  d.poly([[9.75, 0.25, 8.3], [9.95, 0.25, 8.3], [9.95, 0.25, 2.6], [9.3, 0.25, 2.6], [9.6, 0.25, 4.6]], c)
  d.line([[9.45, 0.26, 4.6], [9.95, 0.26, 4.6]], shade(c, -0.15), 1.6)
}

let seed = 7
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
function cityWindow(d, sky, blanket) {
  const x0 = 6.0, x1 = 9.6, z0 = 3.2, z1 = 8.0
  const frame = '#3A3350'
  d.poly([[x0 - 0.18, 0.01, z0 - 0.18], [x1 + 0.18, 0.01, z0 - 0.18], [x1 + 0.18, 0.01, z1 + 0.18], [x0 - 0.18, 0.01, z1 + 0.18]], frame)
  d.raw(`<clipPath id="cityw"><polygon points="${pts([[x0, 0.02, z0], [x1, 0.02, z0], [x1, 0.02, z1], [x0, 0.02, z1]])}"/></clipPath><g clip-path="url(#cityw)">`)
  d.poly([[x0, 0.02, z0], [x1, 0.02, z0], [x1, 0.02, z1], [x0, 0.02, z1]], 'url(#sky)')
  const moon = P(9.0, 0.03, 7.3)
  d.raw(`<circle cx="${moon[0].toFixed(1)}" cy="${moon[1].toFixed(1)}" r="9" fill="#E9ECF7" opacity=".18"/><circle cx="${moon[0].toFixed(1)}" cy="${moon[1].toFixed(1)}" r="4" fill="#E9ECF7"/>`)
  seed = 7
  // far buildings, then near ones with lit windows
  ;[['#283062', 0.6, 1.4], ['#1A2048', 0.0, 1.0]].forEach(([col, lift, lit]) => {
    let x = x0
    while (x < x1) {
      const w = 0.35 + rnd() * 0.35, h = 1.0 + rnd() * 2.6 + lift
      d.poly([[x, 0.03, z0], [x + w, 0.03, z0], [x + w, 0.03, z0 + h], [x, 0.03, z0 + h]], col)
      for (let wz = z0 + 0.2; wz < z0 + h - 0.2; wz += 0.28) for (let wx = x + 0.07; wx < x + w - 0.1; wx += 0.16) {
        if (rnd() < 0.32 * lit) d.poly([[wx, 0.04, wz], [wx + 0.07, 0.04, wz], [wx + 0.07, 0.04, wz + 0.1], [wx, 0.04, wz + 0.1]], rnd() < 0.7 ? '#F6C46B' : '#FBE3B4', ' opacity=".9"')
      }
      x += w + 0.04
    }
  })
  // rain: thin lines falling down the glass
  const a = P(x0, 0.03, z1), b = P(x1, 0.03, z0)
  let rain = ''
  for (let i = 0; i < 46; i++) {
    const rx = a[0] + rnd() * (b[0] - a[0] + 30) - 10, ry = a[1] - 40 + rnd() * (b[1] - a[1] + 60)
    rain += `<path d="M${rx.toFixed(1)},${ry.toFixed(1)} l-1.2,6" />`
  }
  d.raw(`<g class="rain" stroke="#BFD0FF" stroke-width=".6" opacity=".55" stroke-linecap="round">${rain}</g>`)
  d.raw(`<g class="rain rain2" stroke="#BFD0FF" stroke-width=".6" opacity=".55" stroke-linecap="round">${rain}</g>`)
  d.raw('</g>')
  const mid = (x0 + x1) / 2
  d.poly([[mid - 0.07, 0.04, z0], [mid + 0.07, 0.04, z0], [mid + 0.07, 0.04, z1], [mid - 0.07, 0.04, z1]], frame)
  d.poly([[x0, 0.04, 6.3], [x1, 0.04, 6.3], [x1, 0.04, 6.42], [x0, 0.04, 6.42]], frame)
  d.box(x0 - 0.3, 0, z0 - 0.32, x1 - x0 + 0.6, 0.55, 0.16, [shade(frame, 0.3), frame, shade(frame, -0.1)])
}

function atticDetails(d) {
  // dark wooden beams under the roof and in the corner
  const beam = '#6E4F3A'
  d.box(0, 0, 8.45, 0.35, 10, 0.4, [shade(beam, 0.15), beam, shade(beam, -0.1)])
  d.box(0, 0, 8.45, 10, 0.35, 0.4, [shade(beam, 0.15), beam, shade(beam, -0.1)])
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

/* ---------- textures for walls and floor, drawn on the isometric grid ---------- */

const C = COS * K
const ISO = {
  left: `matrix(${-C} ${0.5 * K} 0 ${-K} ${OX} ${OY})`,
  right: `matrix(${C} ${0.5 * K} 0 ${-K} ${OX} ${OY})`,
  floor: `matrix(${C} ${0.5 * K} ${-C} ${0.5 * K} ${OX} ${OY})`,
}
function wallPattern(id, side, style, ink) {
  const t = ISO[side]
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
  const { room, tod = timeOfDay(), books = 0, notes = 0, events = 0, diaryToday = false, leaves = 3 } = o
  const wall = WALLS[room.wall] || WALLS.lavender
  const floor = FLOORS[room.floor] || FLOORS.oak
  const theme = THEMES[room.theme] ? room.theme : 'cozy'
  const sky = theme === 'city' ? SKIES.night : SKIES[tod]
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
  d.raw(`<ellipse cx="${P(W / 2, D / 2, 0)[0].toFixed(1)}" cy="${(P(W, D, -B)[1] - 4).toFixed(1)}" rx="120" ry="9" fill="#000" opacity=".25" filter="url(#soft)"/>`)
  d.poly([[-T, D, 0], [W, D, 0], [W, D, -B], [-T, D, -B]], 'url(#slabL)')
  d.poly([[W, -T, 0], [W, D, 0], [W, D, -B], [W, -T, -B]], 'url(#slabR)')
  G('walls')
  d.poly([[-T, -T, H], [-T, D, H], [0, D, H], [0, 0, H], [W, 0, H], [W, -T, H]], shade(wall.l[0], 0.35))
  d.poly([[-T, D, 0], [0, D, 0], [0, D, H], [-T, D, H]], shade(wall.l[1], -0.12))
  d.poly([[W, -T, 0], [W, 0, 0], [W, 0, H], [W, -T, H]], shade(wall.r[1], -0.08))
  d.poly([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], 'url(#wallL)')
  d.poly([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]], 'url(#wallR)')
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
    d.poly([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]], 'url(#wpR)')
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

  /* right wall: picture, little wall shelf, window, string lights */
  d.poly([[1.4, 0.02, 4.8], [3.7, 0.02, 4.8], [3.7, 0.02, 7.0], [1.4, 0.02, 7.0]], '#FFFFFF')
  d.poly([[1.6, 0.03, 5.0], [3.5, 0.03, 5.0], [3.5, 0.03, 6.8], [1.6, 0.03, 6.8]], '#F3D9CB')
  d.poly([[1.6, 0.04, 5.0], [2.6, 0.04, 6.2], [3.5, 0.04, 5.0]], '#E5A99A')
  d.poly([[2.3, 0.05, 5.0], [3.0, 0.05, 5.8], [3.5, 0.05, 5.35], [3.5, 0.05, 5.0]], '#C98A8E')
  const sunPic = P(2.0, 0.05, 6.3)
  d.raw(`<circle cx="${sunPic[0].toFixed(1)}" cy="${sunPic[1].toFixed(1)}" r="2.6" fill="#F6C46B"/>`)

  d.box(4.1, 0, 5.0, 1.9, 0.55, 0.14, shade(shelfWood, 0.05))
  d.cylinder(4.55, 0.3, 5.14, 0.17, 0.5, '#FBF3E6')
  const flame = P(4.55, 0.3, 5.75)
  d.raw(`<ellipse cx="${flame[0].toFixed(1)}" cy="${flame[1].toFixed(1)}" rx="1.3" ry="2.4" fill="#F6C46B" opacity="${sky.lights ? 1 : 0.5}"/>`)
  if (sky.lights) glow(flame[0], flame[1], 11)
  d.cylinder(5.15, 0.3, 5.14, 0.22, 0.32, '#D98F72')
  const cac = P(5.15, 0.3, 5.46)
  d.raw(`<path d="M${(cac[0] - 2.5).toFixed(1)},${cac[1].toFixed(1)} q2.5,-9 5,0 z" fill="#7FAF8E"/>`)
  d.box(5.5, 0.08, 5.14, 0.3, 0.38, 0.6, '#E28FA3')
  d.box(5.82, 0.08, 5.14, 0.24, 0.38, 0.5, '#7FA3C8')

  const wx0 = 6.6, wx1 = 9.2, wz0 = 4.0, wz1 = 7.5
  const wash = P(7.9, 0, 5.6)
  d.raw(`<clipPath id="rwall"><polygon points="${pts([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]])}"/></clipPath><ellipse clip-path="url(#rwall)" cx="${wash[0].toFixed(1)}" cy="${wash[1].toFixed(1)}" rx="70" ry="60" fill="url(#sunwash)"/>`)
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
    lights.push([x, 0.05, 8.55 - 0.45 * Math.sin((Math.PI * ((x * 1.3) % 3.0)) / 3.0)])
  }
  d.line(lights, '#8C7FA6', 1)
  const bulbs = ['#FFE29A', '#FFC9D6', '#C9E6FF']
  lights.slice(1, -1).forEach((l, i) => {
    const p = P(...l)
    if (sky.lights) d.raw(`<circle cx="${p[0].toFixed(1)}" cy="${(p[1] + 2).toFixed(1)}" r="9" fill="url(#halo)"/>`)
    d.raw(`<circle class="twinkle" style="animation-delay:${((i % 5) * 0.35).toFixed(2)}s" cx="${p[0].toFixed(1)}" cy="${(p[1] + 2).toFixed(1)}" r="2.4" fill="${bulbs[i % 3]}" opacity="${sky.lights ? 1 : 0.55}"/>`)
  })

  /* left wall: clock and corkboard with notes */
  const ck = P(0.02, 0.9, 7.6)
  d.raw(`<ellipse cx="${ck[0].toFixed(1)}" cy="${ck[1].toFixed(1)}" rx="9.5" ry="11.5" fill="#FBF8FD"/><path d="M${ck[0].toFixed(1)},${ck[1].toFixed(1)} l0,-7 M${ck[0].toFixed(1)},${ck[1].toFixed(1)} l5,3" stroke="#4A4260" stroke-width="1.6" stroke-linecap="round"/>`)
  d.poly([[0.02, 1.6, 4.5], [0.02, 5.4, 4.5], [0.02, 5.4, 7.1], [0.02, 1.6, 7.1]], '#B88D6C')
  d.poly([[0.03, 1.75, 4.65], [0.03, 5.25, 4.65], [0.03, 5.25, 6.95], [0.03, 1.75, 6.95]], '#D9B48F')
  const stickies = [[2.0, 5.6, '#FBE7A6'], [3.0, 6.0, '#F7CFD9'], [4.1, 5.5, '#CFE4F5'], [2.4, 4.95, '#D8EBD9'], [3.7, 4.9, '#FBE7A6'], [4.4, 6.0, '#E6DCF5'], [3.2, 5.15, '#F7CFD9'], [2.0, 6.15, '#CFE4F5']]
  stickies.slice(0, Math.min(notes, stickies.length)).forEach(([ny, nz, col], i) => {
    d.poly([[0.04, ny, nz], [0.04, ny + 0.8, nz], [0.04, ny + 0.8, nz + 0.8], [0.04, ny, nz + 0.8]], col)
    const pin = P(0.05, ny + 0.4, nz + 0.72)
    d.raw(`<circle cx="${pin[0].toFixed(1)}" cy="${pin[1].toFixed(1)}" r="1.6" fill="${i % 2 ? '#3F6B9A' : '#C2556B'}"/>`)
  })
  spots.board = bounds([[0, 1.6, 4.5], [0, 5.4, 4.5], [0, 5.4, 7.1], [0, 1.6, 7.1]], 3)
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
  d.box(1.35, 4.15, 2.62, 0.55, 0.8, 0.7, ['#FFFFFF', '#F7F4FA', '#ECE7F2'])
  d.poly([[1.35, 4.95, 3.12], [1.9, 4.95, 3.12], [1.9, 4.95, 3.32], [1.35, 4.95, 3.32]], '#E07A8F')
  const cal = P(1.62, 4.95, 2.85)
  d.raw(`<text x="${cal[0].toFixed(1)}" y="${(cal[1] + 1.5).toFixed(1)}" font-size="5.5" font-family="Figtree, sans-serif" font-weight="700" fill="#4A4260" text-anchor="middle">${new Date().getDate()}</text>`)
  if (events > 0) {
    const dot = P(1.92, 4.2, 3.4)
    d.raw(`<circle cx="${dot[0].toFixed(1)}" cy="${dot[1].toFixed(1)}" r="3.2" fill="#E07A8F" stroke="#FFF" stroke-width="1"/>`)
  }
  if (theme === 'attic') flowers(d, 1.25, 2.0, 2.62)
  // mug and lamp
  d.cylinder(1.85, 5.25, 2.62, 0.2, 0.42, '#E9A3B4')
  const mug = P(1.85, 5.25, 3.1)
  d.raw(`<path d="M${(mug[0] - 1.5).toFixed(1)},${(mug[1] - 2).toFixed(1)} q2,-4 0,-8 M${(mug[0] + 2).toFixed(1)},${(mug[1] - 2).toFixed(1)} q2,-4 0,-8" fill="none" stroke="#FFF" stroke-opacity=".6" stroke-width="1"/>`)
  const lb = P(0.6, 5.0, 2.62), lt = P(0.6, 5.0, 4.5)
  d.raw(`<ellipse cx="${lb[0].toFixed(1)}" cy="${lb[1].toFixed(1)}" rx="6" ry="3" fill="#4A4260"/><path d="M${lb[0].toFixed(1)},${lb[1].toFixed(1)} L${lt[0].toFixed(1)},${lt[1].toFixed(1)}" stroke="#4A4260" stroke-width="2"/>`)
  d.raw(`<path d="M${(lt[0] - 6).toFixed(1)},${lt[1].toFixed(1)} L${(lt[0] + 6).toFixed(1)},${lt[1].toFixed(1)} L${(lt[0] + 9).toFixed(1)},${(lt[1] + 9).toFixed(1)} L${(lt[0] - 9).toFixed(1)},${(lt[1] + 9).toFixed(1)} Z" fill="${sky.lights ? '#F6C46B' : '#E3C48A'}"/>`)
  if (sky.lights) glow(lt[0] + 6, lt[1] + 22, 70)
  spots.desk = bounds([[0, 1.6, 0], [2.5, 1.6, 0], [2.5, 5.7, 0], [0, 5.7, 0], [0, 1.6, 4.0], [0, 5.7, 4.6]], 2)
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

  /* floor lamp in the corner next to the bed */
  d.ring(5.2, 0.75, 0.02, 0.45, '#5B4536', ' opacity=".18"')
  d.cylinder(5.2, 0.75, 0, 0.32, 0.08, '#4A4260')
  d.box(5.16, 0.71, 0.08, 0.08, 0.08, 4.0, '#4A4260')
  const fl = P(5.2, 0.75, 4.25)
  d.raw(`<path d="M${(fl[0] - 7).toFixed(1)},${(fl[1] - 6).toFixed(1)} L${(fl[0] + 7).toFixed(1)},${(fl[1] - 6).toFixed(1)} L${(fl[0] + 11).toFixed(1)},${(fl[1] + 8).toFixed(1)} L${(fl[0] - 11).toFixed(1)},${(fl[1] + 8).toFixed(1)} Z" fill="${sky.lights ? '#FBE3B4' : '#F3E6D2'}"/>`)
  if (sky.lights) glow(fl[0], fl[1] + 14, 46)

  /* ================= bed ================= */
  G('bed')
  const bs = room.bedStyle
  const canopy = bs === 'canopy', platform = bs === 'platform'
  d.shadow(5.6, 0.1, 10, 5.6, 0.18)
  if (canopy) ;[[5.85, 0.05], [9.6, 0.05]].forEach(([x, y]) => d.box(x, y, 0, 0.14, 0.14, 7.6, bedWood))
  let mt // top of the mattress
  if (platform) {
    // a low wooden platform with a soft, tufted headboard
    d.box(5.85, 0, 0, 3.9, 0.3, 2.4, shade(blanket, 0.25))
    for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) { const b = P(6.3 + j * 0.75, 0.31, 1.1 + i * 0.45); d.raw(`<circle cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r=".9" fill="${shade(blanket, 0.05)}"/>`) }
    d.box(5.65, 0.3, 0, 4.3, 5.1, 0.42, bedWood)
    d.box(5.85, 0.4, 0.42, 3.9, 4.75, 0.7, ['#FFFFFF', '#F1ECF6', '#E6DFEF'])
    mt = 1.12
  } else {
    d.box(5.9, 0, 0, 3.8, 0.35, canopy ? 2.4 : 3.3, shade(blanket, canopy ? -0.1 : 0.2))
    if (!canopy) {
      d.poly([[6.2, 0.36, 1.4], [9.4, 0.36, 1.4], [9.4, 0.36, 3.0], [6.2, 0.36, 3.0]], shade(blanket, 0.1))
      ;[6.9, 7.8, 8.7].forEach((x) => { const b = P(x, 0.37, 2.4); d.raw(`<circle cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r="1.2" fill="${shade(blanket, -0.12)}"/>`) })
    }
    d.box(5.9, 0.35, 0, 3.8, 4.85, 1.05, bedWood)
    d.box(6.0, 0.4, 1.05, 3.6, 4.7, 0.75, ['#FFFFFF', '#F1ECF6', '#E6DFEF'])
    mt = 1.8
  }
  d.box(6.4, 0.55, mt, 1.4, 1.1, 0.45, ['#FFFFFF', '#F3EEF8', '#EAE3F1'])
  d.box(8.0, 0.55, mt, 1.4, 1.1, 0.45, ['#FFFFFF', '#F3EEF8', '#EAE3F1'])
  d.box(7.3, 1.25, mt, 0.9, 0.5, 0.42, shade(blanket, 0.35))
  d.box(5.85, 2.3, mt - 0.8, 3.9, 2.95, 0.88, blanket)
  for (let i = 1; i < 4; i++) d.line([[5.85, 2.3 + i * 0.75, mt + 0.09], [9.75, 2.3 + i * 0.75, mt + 0.09]], shade(blanket, -0.1), 1.2)
  // a soft throw folded over the foot of the bed
  const throwC = shade(blanket, 0.45)
  d.poly([[5.82, 4.55, mt + 0.1], [9.78, 4.55, mt + 0.1], [9.78, 5.27, mt + 0.1], [5.82, 5.27, mt + 0.1]], throwC)
  d.poly([[5.82, 5.27, mt + 0.1], [9.78, 5.27, mt + 0.1], [9.78, 5.27, mt - 0.9], [5.82, 5.27, mt - 0.9]], shade(throwC, -0.06))
  for (let i = 0; i < 16; i++) { const x = 6.0 + i * 0.24; d.line([[x, 5.28, mt - 0.9], [x, 5.28, mt - 1.08]], shade(throwC, -0.12), 1) }
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
  if (room.pet === 'cat' || room.pet === 'dog') {
    const at = P(9.0, 3.3, mt + 0.1)
    d.raw(pet(room.pet, PET_COLORS[room.petColor] || PET_COLORS.black, at[0] - 21, at[1] - 21, 0.42))
  }
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

  /* knitted pouf on the rug */
  d.ring(6.6, 8.0, 0.02, 0.85, '#5B4536', ' opacity=".14"')
  const pc = dark ? '#E9C46A' : '#EBC77A'
  d.cylinder(6.6, 8.0, 0, 0.75, 0.8, pc)
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.05 + (i / 8) * 0.9) - Math.PI * 0.25
    const x = 6.6 + 0.75 * Math.cos(a + Math.PI / 4), y = 8.0 + 0.75 * Math.sin(a + Math.PI / 4)
    d.line([[x, y, 0.06], [x, y, 0.76]], shade(pc, -0.12), 0.7, ' opacity=".7"')
  }
  const pb = P(6.6, 8.0, 0.81)
  d.raw(`<circle cx="${pb[0].toFixed(1)}" cy="${pb[1].toFixed(1)}" r="1.4" fill="${shade(pc, -0.15)}"/>`)

  /* ================= bookshelf (opens Books) ================= */
  G('shelf')
  const sw = shelfWood, ss = room.shelfStyle
  const bookRow = (x0, depth, y0, y1, z, maxH, si) => {
    let y = y0, k = si * 3
    while (y < y1 - 0.25) {
      const w = [0.24, 0.29, 0.34, 0.26, 0.31, 0.27][k % 6]
      if (placed < books) {
        const h = Math.min(maxH, [0.95, 0.8, 1.05, 0.72, 0.9, 1.0, 0.85][k % 7])
        d.box(x0, y, z, depth, w, h, BOOK_COLORS[(placed * 3 + si) % BOOK_COLORS.length])
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
    ;[0.25, 1.55, 2.85, 4.15].forEach((z, si) => { d.box(0, sy0, z - 0.12, sx, sdy, 0.12, shade(sw, 0.06)); bookRow(0.2, 1.05, sy0 + 0.2, sy0 + sdy, z, 1.05, si) })
    d.box(0, sy0 + sdy - 0.12, 0, sx, 0.12, sh + 0.14, sw)
    d.box(0, sy0, sh, sx, sdy, 0.14, shade(sw, 0.1))
  }
  if (ss !== 'ladder' && theme === 'attic') {
    plush(d, 0.7, sy0 + 0.75, sh + 0.14, '#B9A3E0')
    plush(d, 0.75, sy0 + 1.7, sh + 0.14, '#F2B5C6')
  } else if (ss !== 'ladder') {
    // little things on top
    d.cylinder(0.65, sy0 + 0.7, sh + 0.14, 0.26, 0.4, '#E9E2EF')
    const pp = P(0.65, sy0 + 0.7, sh + 0.54)
    d.raw(`<path d="M${pp[0].toFixed(1)},${pp[1].toFixed(1)} c-3,4 -8,6 -12,14 M${pp[0].toFixed(1)},${pp[1].toFixed(1)} c2,5 2,10 6,16" stroke="#6FA287" stroke-width="1.2" fill="none"/>`)
    ;[[-9, 9], [-5, 5], [3, 10], [5, 15], [-11, 13]].forEach(([x, y]) => d.raw(`<ellipse cx="${(pp[0] + x).toFixed(1)}" cy="${(pp[1] + y).toFixed(1)}" rx="2.2" ry="1.4" fill="#7FB495"/>`))
    d.box(0.25, sy0 + sdy - 0.95, sh + 0.14, 0.9, 0.6, 0.18, '#E28FA3')
    d.box(0.3, sy0 + sdy - 0.9, sh + 0.32, 0.8, 0.5, 0.15, '#7FA3C8')
  }
  spots.shelf = bounds([[0, sy0, 0], [sx + 0.4, sy0, 0], [sx + 0.4, sy0 + sdy, 0], [0, sy0 + sdy, sh + 1.2], [sx, sy0, sh + 1.2], [0, sy0, sh + 1.2]], 0)
  E()

  /* ================= a big potted plant: grows with your diary streak ================= */
  plant(d, 8.9, 7.3, leaves)

  if (theme === 'city') {
    // the room is dark; only the lamps and the window light it
    d.poly([[-T, -T, H], [-T, D, H], [-T, D, -B], [W, D, -B], [W, -T, -B], [W, -T, H]], '#0E1338', ' opacity=".34" pointer-events="none"')
    glows.forEach(([x, y, r]) => d.raw(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r * 0.75}" fill="url(#glow)" opacity=".55" pointer-events="none"/>`))
    const wl = P(7.8, 2.5, 0)
    d.raw(`<ellipse cx="${wl[0].toFixed(1)}" cy="${wl[1].toFixed(1)}" rx="60" ry="24" fill="#8FB0FF" opacity=".08" pointer-events="none"/>`)
  }
  const svg = `<svg role="img" aria-label="Your room" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet">${d.out.join('')}</svg>`
  // walls and floor are not boxes, so they get exact outlines (in percent) for clicking
  const outline = (ps) => ps.map((c) => { const [x, y] = P(...c); return `${(((x - VB.x) / VB.w) * 100).toFixed(2)}% ${(((y - VB.y) / VB.h) * 100).toFixed(2)}%` }).join(', ')
  const shapes = {
    floor: [outline([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]])],
    walls: [outline([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]]), outline([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]])],
  }
  return { svg, spots, shapes }
}
