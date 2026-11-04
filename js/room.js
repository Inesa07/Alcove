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
  cozy: { name: 'Cozy room', note: 'Lavender, light wood, fairy lights' },
  attic: { name: 'Attic studio', note: 'Round window, wooden beams, plushies' },
  study: { name: 'Night study', note: 'A desk by the big window, city lights, a reading lamp' },
}
export const THEME_PRESETS = {
  cozy: { wall: 'lavender', wallStyle: 'plain', floor: 'oak', floorStyle: 'planks', rug: 'pink', blanket: 'lilac', shelfWood: 'oak', deskWood: 'oak', bedWood: 'oak', chairColor: 'lilac', chairStyle: 'classic' },
  attic: { wall: 'peach', wallStyle: 'boards', floor: 'honey', floorStyle: 'planks', rug: 'cream', blanket: 'rose', shelfWood: 'white', deskWood: 'white', bedWood: 'oak', chairColor: 'cream', pet: 'cat', petColor: 'ginger', art: 'flowers' },
  study: { wall: 'night', wallStyle: 'plain', floor: 'walnut', floorStyle: 'planks', rug: 'blue', blanket: 'blue', shelfWood: 'walnut', deskWood: 'walnut', bedWood: 'walnut', chairColor: 'blue', pet: 'cat', petColor: 'black', art: 'moon' },
}

export const DEFAULT_ROOM = {
  theme: 'cozy',
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

// the books on the shelf: their colours and covers, and where each one is drawn (for the little label on hover)
let SHELF = { list: [], spots: [] }
const bookAt = (i, fallback) => SHELF.list[i]?.color || fallback
const noteBook = (i, corners) => { if (SHELF.list[i]) SHELF.spots.push({ id: SHELF.list[i].id, ...bounds(corners, 0) }) }
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
function cityWindow(d, sky, blanket, x0 = 6.0, x1 = 9.6, z0 = 3.2, z1 = 8.0, rainy = true) {
  const frame = '#3A3350'
  d.poly([[x0 - 0.18, 0.01, z0 - 0.18], [x1 + 0.18, 0.01, z0 - 0.18], [x1 + 0.18, 0.01, z1 + 0.18], [x0 - 0.18, 0.01, z1 + 0.18]], frame)
  d.raw(`<clipPath id="cityw"><polygon points="${pts([[x0, 0.02, z0], [x1, 0.02, z0], [x1, 0.02, z1], [x0, 0.02, z1]])}"/></clipPath><g clip-path="url(#cityw)">`)
  d.poly([[x0, 0.02, z0], [x1, 0.02, z0], [x1, 0.02, z1], [x0, 0.02, z1]], 'url(#sky)')
  const moon = P(x1 - 0.7, 0.03, z1 - 0.8)
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
  if (rainy) d.raw(`<g class="rain" stroke="#BFD0FF" stroke-width=".6" opacity=".55" stroke-linecap="round">${rain}</g>`)
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
  const { room, tod = timeOfDay(), books = 0, notes = 0, events = 0, diaryToday = false, leaves = 3 } = o
  const wall = WALLS[room.wall] || WALLS.lavender
  const floor = FLOORS[room.floor] || FLOORS.oak
  const theme = room.theme === 'city' ? 'study' : THEMES[room.theme] ? room.theme : 'cozy'
  const sky = theme === 'study' ? SKIES.night : SKIES[tod]
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
  // the attic has a sloping roof: the right wall gets lower towards the front
  const HR = theme === 'attic' ? 6.4 : H
  const roofZ = (x) => H - ((H - HR) * x) / W
  const rightWall = [[0, 0, 0], [W, 0, 0], [W, 0, HR], [0, 0, H]]
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

  const S = { d, room, sky, spots, G, E, glow, books, notes, events, diaryToday, leaves, blanket, shelfWood, deskWood, bedWood, rug }
  if (theme === 'attic') atticScene(S)
  else if (theme === 'study') studyScene(S)
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
  d.box(5.5, 0.08, 5.14, 0.3, 0.38, 0.6, '#E28FA3')
  d.box(5.82, 0.08, 5.14, 0.24, 0.38, 0.5, '#7FA3C8')

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
  if (theme === 'city' && room.pet === 'cat') {
    const at = P(7.2, 0.3, 3.05)
    d.raw(sittingCat(PET_COLORS[room.petColor] || PET_COLORS.black, at[0], at[1]))
  } else if (room.pet === 'cat' || room.pet === 'dog') {
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
