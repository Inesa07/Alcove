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
  shelfStyle: { tall: 'Tall bookcase', low: 'Low shelf' },
  deskStyle: { drawers: 'Desk with drawers', simple: 'Light table' },
  bedStyle: { classic: 'Cozy bed', canopy: 'Canopy bed' },
  chairStyle: { classic: 'Desk chair', stool: 'Round stool' },
}

export const DEFAULT_ROOM = {
  wall: 'lavender', floor: 'oak', rug: 'pink',
  shelfStyle: 'tall', shelfWood: 'oak',
  deskStyle: 'drawers', deskWood: 'oak',
  bedStyle: 'classic', bedWood: 'oak', blanket: 'lilac',
  chairStyle: 'classic', chairColor: 'lilac',
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
    shadow(x0, y0, x1, y1, op = 0.16) { d.poly([[x0, y0, 0.01], [x1, y0, 0.01], [x1, y1, 0.01], [x0, y1, 0.01]], '#5B4536', ` opacity="${op}"`) },
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

export function drawRoom(o) {
  const { room, tod = timeOfDay(), books = 0, notes = 0, events = 0, diaryToday = false, leaves = 3 } = o
  const wall = WALLS[room.wall] || WALLS.lavender
  const floor = FLOORS[room.floor] || FLOORS.oak
  const sky = SKIES[tod]
  const blanket = (FABRICS[room.blanket] || FABRICS.lilac).c
  const shelfWood = (WOODS[room.shelfWood] || WOODS.oak).c
  const deskWood = (WOODS[room.deskWood] || WOODS.oak).c
  const bedWood = (WOODS[room.bedWood] || WOODS.oak).c
  const rug = (RUGS[room.rug] || RUGS.pink).c
  const trim = shade(wall.l[1], 0.55)
  const dark = room.wall === 'night'
  const d = painter()
  const spots = {}

  d.raw(`<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.stops[0]}"/><stop offset=".55" stop-color="${sky.stops[1]}"/><stop offset="1" stop-color="${sky.stops[2]}"/></linearGradient>
    <linearGradient id="wallL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${wall.l[0]}"/><stop offset="1" stop-color="${wall.l[1]}"/></linearGradient>
    <linearGradient id="wallR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${wall.r[0]}"/><stop offset="1" stop-color="${wall.r[1]}"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${floor.a}"/><stop offset="1" stop-color="${floor.b}"/></linearGradient>
    <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE3A8" stop-opacity=".55"/><stop offset="1" stop-color="#FFE3A8" stop-opacity="0"/></radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6DD" stop-opacity="${sky.beam}"/><stop offset="1" stop-color="#FFF6DD" stop-opacity="0"/></linearGradient>
  </defs>`)

  /* walls and floor */
  const W = 10, D = 10, H = 9
  d.poly([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], 'url(#wallL)')
  d.poly([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]], 'url(#wallR)')
  d.poly([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], 'url(#floor)')
  for (let i = 1; i < 10; i++) d.line([[0, i, 0], [W, i, 0]], floor.line, 1, ' opacity=".55"')
  for (let i = 0; i < 10; i++) d.line([[2 + (i % 3) * 3 + (i % 2), i, 0], [2 + (i % 3) * 3 + (i % 2), i + 1, 0]], floor.line, 1, ' opacity=".4"')
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
  if (sky.lights) d.raw(`<circle cx="${flame[0].toFixed(1)}" cy="${flame[1].toFixed(1)}" r="11" fill="url(#glow)"/>`)
  d.cylinder(5.15, 0.3, 5.14, 0.22, 0.32, '#D98F72')
  const cac = P(5.15, 0.3, 5.46)
  d.raw(`<path d="M${(cac[0] - 2.5).toFixed(1)},${cac[1].toFixed(1)} q2.5,-9 5,0 z" fill="#7FAF8E"/>`)
  d.box(5.5, 0.08, 5.14, 0.3, 0.38, 0.6, '#E28FA3')
  d.box(5.82, 0.08, 5.14, 0.24, 0.38, 0.5, '#7FA3C8')

  const wx0 = 6.6, wx1 = 9.2, wz0 = 4.0, wz1 = 7.5
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

  const lights = []
  for (let i = 0; i < 13; i++) {
    const x = 0.4 + i * 0.75
    lights.push([x, 0.05, 8.55 - 0.45 * Math.sin((Math.PI * ((x * 1.3) % 3.0)) / 3.0)])
  }
  d.line(lights, '#8C7FA6', 1)
  const bulbs = ['#FFE29A', '#FFC9D6', '#C9E6FF']
  lights.slice(1, -1).forEach((l, i) => {
    const p = P(...l)
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

  /* light from the window on the floor */
  if (sky.beam) d.poly([[6.6, 0.2, 0.02], [9.2, 0.2, 0.02], [8.0, 5.2, 0.02], [5.4, 5.2, 0.02]], 'url(#beam)')

  /* rug */
  spots.rug = bounds(Array.from({ length: 24 }, (_, i) => [5.4 + 2.7 * Math.cos((Math.PI * i) / 12), 6.0 + 2.7 * Math.sin((Math.PI * i) / 12), 0]), 0)
  if (rug) {
    d.ring(5.4, 6.0, 0.01, 2.7, rug)
    d.ring(5.4, 6.0, 0.02, 2.15, shade(rug, -0.06))
    d.ring(5.4, 6.0, 0.03, 1.6, rug)
    d.ring(5.4, 6.0, 0.04, 0.9, shade(rug, -0.06))
  }

  /* desk */
  d.shadow(0, 1.5, 2.7, 5.9)
  if (room.deskStyle === 'simple') {
    ;[[0.15, 1.75], [2.05, 1.75], [0.15, 5.35], [2.05, 5.35]].forEach(([x, y]) => d.box(x, y, 0, 0.16, 0.16, 2.4, shade(deskWood, -0.05)))
    d.box(0.1, 1.85, 0.9, 2.1, 3.6, 0.08, shade(deskWood, 0.05))
    d.box(0.2, 2.1, 0.98, 1.1, 0.5, 0.25, '#7FA3C8')
    d.box(0.25, 2.65, 0.98, 1.0, 0.45, 0.2, '#E28FA3')
  } else {
    d.box(0.15, 4.2, 0, 2.1, 1.3, 2.4, deskWood)
    ;[1.55, 0.75].forEach((z) => d.poly([[2.26, 4.4, z], [2.26, 5.3, z], [2.26, 5.3, z + 0.65], [2.26, 4.4, z + 0.65]], shade(deskWood, -0.04)))
    ;[1.9, 1.1].forEach((z) => { const k = P(2.27, 4.85, z); d.raw(`<circle cx="${k[0].toFixed(1)}" cy="${k[1].toFixed(1)}" r="1.2" fill="${shade(deskWood, -0.35)}"/>`) })
    d.box(2.05, 1.8, 0, 0.18, 0.18, 2.4, deskWood)
  }
  d.box(0, 1.6, 2.4, 2.45, 4.1, 0.22, [shade(deskWood, 0.2), deskWood, shade(deskWood, -0.1)])
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
  // mug and lamp
  d.cylinder(1.85, 5.25, 2.62, 0.2, 0.42, '#E9A3B4')
  const mug = P(1.85, 5.25, 3.1)
  d.raw(`<path d="M${(mug[0] - 1.5).toFixed(1)},${(mug[1] - 2).toFixed(1)} q2,-4 0,-8 M${(mug[0] + 2).toFixed(1)},${(mug[1] - 2).toFixed(1)} q2,-4 0,-8" fill="none" stroke="#FFF" stroke-opacity=".6" stroke-width="1"/>`)
  const lb = P(0.6, 5.0, 2.62), lt = P(0.6, 5.0, 4.5)
  d.raw(`<ellipse cx="${lb[0].toFixed(1)}" cy="${lb[1].toFixed(1)}" rx="6" ry="3" fill="#4A4260"/><path d="M${lb[0].toFixed(1)},${lb[1].toFixed(1)} L${lt[0].toFixed(1)},${lt[1].toFixed(1)}" stroke="#4A4260" stroke-width="2"/>`)
  d.raw(`<path d="M${(lt[0] - 6).toFixed(1)},${lt[1].toFixed(1)} L${(lt[0] + 6).toFixed(1)},${lt[1].toFixed(1)} L${(lt[0] + 9).toFixed(1)},${(lt[1] + 9).toFixed(1)} L${(lt[0] - 9).toFixed(1)},${(lt[1] + 9).toFixed(1)} Z" fill="${sky.lights ? '#F6C46B' : '#E3C48A'}"/>`)
  if (sky.lights) d.raw(`<circle cx="${(lt[0] + 6).toFixed(1)}" cy="${(lt[1] + 22).toFixed(1)}" r="70" fill="url(#glow)"/>`)
  spots.desk = bounds([[0, 1.6, 0], [2.5, 1.6, 0], [2.5, 5.7, 0], [0, 5.7, 0], [0, 1.6, 4.0], [0, 5.7, 4.6]], 2)

  /* chair */
  const chair = (FABRICS[room.chairColor] || FABRICS.lilac).c
  d.shadow(2.5, 2.6, 4.1, 4.2, 0.12)
  if (room.chairStyle === 'stool') {
    ;[[2.85, 2.95], [3.85, 2.95], [2.85, 3.95], [3.85, 3.95]].forEach(([x, y]) => d.box(x, y, 0, 0.1, 0.1, 1.35, shade(deskWood, -0.1)))
    d.cylinder(3.4, 3.5, 1.35, 0.72, 0.38, chair)
  } else {
    d.box(2.75, 2.85, 0, 0.12, 0.12, 1.45, shade(chair, -0.15))
    d.box(3.75, 3.85, 0, 0.12, 0.12, 1.45, shade(chair, -0.15))
    d.box(2.65, 2.75, 1.45, 1.35, 1.3, 0.28, chair)
    d.box(3.85, 2.75, 1.73, 0.18, 1.3, 1.6, chair)
  }
  spots.chair = bounds([[2.65, 2.75, 0], [4.05, 2.75, 0], [4.05, 4.05, 0], [2.65, 4.05, 0], [2.65, 2.75, 3.33], [4.05, 4.05, 3.33]], 2)

  /* floor lamp in the corner next to the bed */
  d.ring(5.2, 0.75, 0.02, 0.45, '#5B4536', ' opacity=".18"')
  d.cylinder(5.2, 0.75, 0, 0.32, 0.08, '#4A4260')
  d.box(5.16, 0.71, 0.08, 0.08, 0.08, 4.0, '#4A4260')
  const fl = P(5.2, 0.75, 4.25)
  d.raw(`<path d="M${(fl[0] - 7).toFixed(1)},${(fl[1] - 6).toFixed(1)} L${(fl[0] + 7).toFixed(1)},${(fl[1] - 6).toFixed(1)} L${(fl[0] + 11).toFixed(1)},${(fl[1] + 8).toFixed(1)} L${(fl[0] - 11).toFixed(1)},${(fl[1] + 8).toFixed(1)} Z" fill="${sky.lights ? '#FBE3B4' : '#F3E6D2'}"/>`)
  if (sky.lights) d.raw(`<circle cx="${fl[0].toFixed(1)}" cy="${(fl[1] + 14).toFixed(1)}" r="46" fill="url(#glow)"/>`)

  /* bed */
  d.shadow(5.7, 0.1, 10, 5.5, 0.18)
  const canopy = room.bedStyle === 'canopy'
  if (canopy) {
    ;[[5.85, 0.05], [9.6, 0.05]].forEach(([x, y]) => d.box(x, y, 0, 0.14, 0.14, 7.6, bedWood))
  }
  d.box(5.9, 0, 0, 3.8, 0.35, canopy ? 2.4 : 3.3, shade(blanket, canopy ? -0.1 : 0.2))
  if (!canopy) {
    d.poly([[6.2, 0.36, 1.4], [9.4, 0.36, 1.4], [9.4, 0.36, 3.0], [6.2, 0.36, 3.0]], shade(blanket, 0.1))
    ;[6.9, 7.8, 8.7].forEach((x) => { const b = P(x, 0.37, 2.4); d.raw(`<circle cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r="1.2" fill="${shade(blanket, -0.12)}"/>`) })
  }
  d.box(5.9, 0.35, 0, 3.8, 4.85, 1.05, bedWood)
  d.box(6.0, 0.4, 1.05, 3.6, 4.7, 0.75, ['#FFFFFF', '#F1ECF6', '#E6DFEF'])
  d.box(6.4, 0.55, 1.8, 1.4, 1.1, 0.45, ['#FFFFFF', '#F3EEF8', '#EAE3F1'])
  d.box(8.0, 0.55, 1.8, 1.4, 1.1, 0.45, ['#FFFFFF', '#F3EEF8', '#EAE3F1'])
  d.box(7.3, 1.25, 1.8, 0.9, 0.5, 0.42, shade(blanket, 0.35))
  d.box(5.85, 2.3, 1.0, 3.9, 2.95, 0.88, blanket)
  for (let i = 1; i < 4; i++) d.line([[5.85, 2.3 + i * 0.75, 1.89], [9.75, 2.3 + i * 0.75, 1.89]], shade(blanket, -0.1), 1.2)
  // open diary on the blanket
  d.poly([[6.5, 3.0, 1.9], [7.4, 3.0, 1.9], [7.4, 4.3, 1.9], [6.5, 4.3, 1.9]], '#FFFDF8')
  d.poly([[7.4, 3.0, 1.9], [8.3, 3.0, 1.9], [8.3, 4.3, 1.9], [7.4, 4.3, 1.9]], '#FBF6EC')
  d.line([[7.4, 3.0, 1.91], [7.4, 4.3, 1.91]], '#CDBFAE', 1)
  const lines = diaryToday ? 4 : 2
  for (let j = 0; j < lines; j++) d.line([[6.65, 3.25 + j * 0.25, 1.91], [7.25, 3.25 + j * 0.25, 1.91]], diaryToday ? '#9C86C9' : '#DCD3C6', 0.8)
  const pen = P(8.0, 3.6, 1.92)
  d.raw(`<path d="M${(pen[0] - 7).toFixed(1)},${(pen[1] + 4).toFixed(1)} l12,-7" stroke="#E07A8F" stroke-width="2" stroke-linecap="round"/>`)
  // sleeping cat
  const cat = P(8.95, 3.5, 1.95)
  d.raw(`<g fill="#4A4260"><ellipse cx="${cat[0].toFixed(1)}" cy="${(cat[1] - 6).toFixed(1)}" rx="13" ry="7.5"/><circle cx="${(cat[0] - 11).toFixed(1)}" cy="${(cat[1] - 9).toFixed(1)}" r="5.5"/>
    <path d="M${(cat[0] - 16).toFixed(1)},${(cat[1] - 13).toFixed(1)} l2,-5 l2,4 M${(cat[0] - 11).toFixed(1)},${(cat[1] - 14).toFixed(1)} l2,-5 l2,4" stroke="#4A4260" stroke-width="1.5" stroke-linejoin="round"/></g>
    <path d="M${(cat[0] - 6).toFixed(1)},${(cat[1] - 1).toFixed(1)} q8,6 16,0" fill="none" stroke="#4A4260" stroke-width="3" stroke-linecap="round"/>`)
  if (canopy) {
    ;[[5.85, 5.1], [9.6, 5.1]].forEach(([x, y]) => d.box(x, y, 0, 0.14, 0.14, 7.6, bedWood))
    d.box(5.85, 0.05, 7.6, 3.9, 0.12, 0.12, bedWood)
    d.box(5.85, 0.05, 7.6, 0.12, 5.2, 0.12, bedWood)
    d.box(9.6, 0.05, 7.6, 0.14, 5.2, 0.12, bedWood)
    d.box(5.85, 5.1, 7.6, 3.9, 0.14, 0.12, bedWood)
    // sheer curtains gathered at the front posts
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
  spots.bed = bounds([[5.9, 0, 0], [9.7, 0, canopy ? 7.7 : 3.3], [9.7, 5.2, 0], [5.9, 5.2, 0], [5.9, 0, canopy ? 7.7 : 3.3]], 0)

  /* pouf on the rug */
  d.ring(6.6, 8.0, 0.02, 0.85, '#5B4536', ' opacity=".14"')
  d.cylinder(6.6, 8.0, 0, 0.75, 0.85, dark ? '#E9C46A' : '#EBC77A')

  /* bookshelf (opens Books) */
  const sx = 1.45
  const tall = room.shelfStyle !== 'low'
  const sy0 = tall ? 6.8 : 6.3, sdy = tall ? 2.7 : 3.4, sh = tall ? 5.4 : 2.7
  const shelves = tall ? [0.25, 1.55, 2.85, 4.15] : [0.25, 1.45]
  d.shadow(0, sy0 - 0.2, sx + 0.35, sy0 + sdy + 0.3, 0.18)
  d.poly([[0.08, sy0, 0], [0.08, sy0 + sdy, 0], [0.08, sy0 + sdy, sh], [0.08, sy0, sh]], shade(shelfWood, -0.28))
  d.box(0, sy0, 0, sx, 0.12, sh, shelfWood)
  let placed = 0
  const widths = [0.24, 0.29, 0.34, 0.26, 0.31, 0.27]
  const heights = [0.95, 0.8, 1.05, 0.72, 0.9, 1.0, 0.85]
  shelves.forEach((z, si) => {
    d.box(0, sy0, z - 0.12, sx, sdy, 0.12, shade(shelfWood, 0.06))
    let y = sy0 + 0.2
    let k = si * 3
    while (y < sy0 + sdy - 0.4) {
      const w = widths[k % widths.length]
      if (placed < books) {
        const lean = 0
        d.box(0.2, y, z, 1.05, w, heights[k % heights.length] - lean, BOOK_COLORS[(placed * 3 + si) % BOOK_COLORS.length])
        placed++
      }
      y += w + 0.04
      k++
    }
  })
  d.box(0, sy0 + sdy - 0.12, 0, sx, 0.12, sh + 0.14, shelfWood)
  d.box(0, sy0, sh, sx, sdy, 0.14, shade(shelfWood, 0.1))
  // little things on top of the shelf
  d.cylinder(0.7, sy0 + 0.75, sh + 0.14, 0.28, 0.42, '#E0A589')
  const pp = P(0.7, sy0 + 0.75, sh + 0.56)
  d.raw(`<path d="M${pp[0].toFixed(1)},${pp[1].toFixed(1)} c-6,-6 -10,-14 -4,-20 c4,6 6,12 4,20 z M${(pp[0] + 1).toFixed(1)},${pp[1].toFixed(1)} c4,-8 10,-12 16,-10 c-4,6 -10,10 -16,10 z M${pp[0].toFixed(1)},${pp[1].toFixed(1)} c-2,4 -3,10 -8,14 c1,-6 4,-10 8,-14 z" fill="#7FAF8E"/>`)
  d.box(0.25, sy0 + sdy - 0.95, sh + 0.14, 0.9, 0.6, 0.18, '#E28FA3')
  d.box(0.3, sy0 + sdy - 0.9, sh + 0.32, 0.8, 0.5, 0.15, '#7FA3C8')
  spots.shelf = bounds([[0, sy0, 0], [sx, sy0, 0], [sx, sy0 + sdy, 0], [0, sy0 + sdy, sh + 1.2], [sx, sy0, sh + 1.2], [0, sy0, sh + 1.2]], 0)

  /* plant in the front corner: grows with your diary streak */
  const [px, py] = P(3.6, 9.0, 0)
  d.raw(`<ellipse cx="${px.toFixed(1)}" cy="${(py + 1).toFixed(1)}" rx="17" ry="6" fill="#5B4536" opacity=".16"/>`)
  const LEAVES = [
    [-14, -38, -2, -26, '#7FAF8E'], [0, -48, 3, -24, '#5E937A'], [16, -40, 4, -25, '#8DBB9B'], [-20, -28, -4, -22, '#5E937A'],
    [22, -30, 6, -22, '#7FAF8E'], [6, -56, 1, -30, '#8DBB9B'], [-10, -54, -1, -30, '#6FA287'], [14, -58, 2, -32, '#7DB497'],
    [-24, -44, -3, -28, '#8DBB9B'], [26, -46, 5, -28, '#6FA287'],
  ]
  LEAVES.slice(0, Math.max(3, Math.min(leaves, LEAVES.length))).forEach(([lx, ly, bx, by, c]) => {
    d.raw(`<path d="M${(px + bx).toFixed(1)},${(py + by).toFixed(1)} Q${(px + lx - 6).toFixed(1)},${(py + (ly + by) / 2).toFixed(1)} ${(px + lx).toFixed(1)},${(py + ly).toFixed(1)} Q${(px + lx + 6).toFixed(1)},${(py + (ly + by) / 2 + 4).toFixed(1)} ${(px + bx).toFixed(1)},${(py + by).toFixed(1)} Z" fill="${c}"/>`)
  })
  d.raw(`<path d="M${(px + 12).toFixed(1)},${py.toFixed(1)} l-24,0 l-3,-21 l30,0 z" fill="#E0A589"/><path d="M${(px - 16).toFixed(1)},${(py - 22).toFixed(1)} l32,0 l-1,5 l-30,0 z" fill="#C98C72"/>`)

  const svg = `<svg role="img" aria-label="Your room" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet">${d.out.join('')}</svg>`
  // walls and floor are not boxes, so they get exact outlines (in percent) for clicking
  const outline = (ps) => ps.map((c) => { const [x, y] = P(...c); return `${(((x - VB.x) / VB.w) * 100).toFixed(2)}% ${(((y - VB.y) / VB.h) * 100).toFixed(2)}%` }).join(', ')
  const shapes = {
    floor: [outline([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]])],
    walls: [outline([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]]), outline([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]])],
  }
  return { svg, spots, shapes }
}
