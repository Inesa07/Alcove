// Real furniture in the drawn rooms.
// The furniture comes from the free Kenney "Furniture Kit" (3D models, CC0).
// Each piece is drawn once with three.js from exactly the same angle as the room,
// in the room's own colours, and becomes a small picture that the room places
// on its floor like any other drawn thing. The pictures are kept, so this happens once.

import * as db from './db.js'

const cache = new Map()   // key → picture and size
const wanted = new Map()  // key → what to draw
let three = null

const key = (name, rot, colors, s) => `${name}|${rot}|${s}|${Object.entries(colors).map(([k, v]) => k + v).join(',')}`

// The room asks for a piece while it draws. It gets the picture, or null the first time.
export function kitSprite(name, rot = 0, colors = {}, s = 4.4) {
  const k = key(name, rot, colors, s)
  if (cache.has(k)) return cache.get(k)
  wanted.set(k, { name, rot, colors, s })
  return null
}
export const kitPending = () => wanted.size > 0

// Pictures drawn before are kept on this device, so the room opens at once next time
// and three.js is only loaded when something new is needed. They never go to the cloud.
const STORE = 'kitcache-v1'
let stored = {}
const primed = db.get(STORE).then((m) => { stored = m || {}; for (const [k, v] of Object.entries(stored)) if (!cache.has(k)) cache.set(k, v) }).catch(() => {})
let saveTimer = null
function keep(k, v) {
  if (!v) return
  stored[k] = { ...v, used: Date.now() }
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const keys = Object.keys(stored).sort((a, b) => stored[b].used - stored[a].used)
    for (const k2 of keys.slice(120)) delete stored[k2] // keep the newest 120 pieces
    db.set(STORE, stored, true).catch(() => {})
  }, 800)
}
export const kitPrimed = () => primed

// Draws everything the room asked for. Afterwards the room draws itself again.
let busy = null
export function kitLoad() {
  if (busy) return busy
  busy = (async () => {
    try {
      await primed
      for (const k of [...wanted.keys()]) if (cache.has(k)) wanted.delete(k)
      const t = wanted.size ? await setup() : null
      while (wanted.size) {
        const jobs = [...wanted.entries()]
        wanted.clear()
        const roots = new Map(await Promise.all([...new Set(jobs.map(([, j]) => j.name))].map(async (n) => [n, await model(t, n)])))
        for (const [k, j] of jobs) { const v = render(t, j, roots.get(j.name)); cache.set(k, v); keep(k, v) }
      }
    } catch (e) {
      console.warn('Furniture could not be drawn', e)
      for (const k of wanted.keys()) cache.set(k, false)
      wanted.clear()
    }
    busy = null
    window.dispatchEvent(new CustomEvent('planner:kit'))
  })()
  return busy
}

async function setup() {
  if (three) return three
  const THREE = await import('./vendor/three.module.min.js')
  const { GLTFLoader } = await import('./vendor/GLTFLoader.js')
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  // light like in the drawn room: tops are lightest, the sides that face right are darkest
  scene.add(new THREE.AmbientLight('#ffffff', 1.7))
  const sun = new THREE.DirectionalLight('#fff3e6', 1.5)
  sun.position.set(-0.3, 1, 0.6)
  scene.add(sun)
  // true isometric: the camera looks along the diagonal, like the room's drawing
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100)
  cam.position.set(10, 10, 10)
  cam.lookAt(0, 0, 0)
  cam.updateMatrixWorld()
  three = { THREE, renderer, scene, cam, loader: new GLTFLoader(), models: new Map() }
  return three
}

async function model(t, name) {
  if (!t.models.has(name)) t.models.set(name, t.loader.loadAsync(`assets/kit/${name}.glb`).then((g) => g.scene))
  return t.models.get(name)
}

// The parts of each model are named (wood, carpet…), so the room's colours can go on them.
function paint(THREE, root, colors) {
  root.traverse((o) => {
    if (!o.isMesh) return
    const src = o.userData.src || (o.userData.src = o.material)
    const n = src.name
    const m = new THREE.MeshLambertMaterial({ color: src.color.clone(), flatShading: true })
    const c = colors[n] || (n === 'carpetBlue' ? colors.carpet : null) || (n === 'woodDark' && colors.wood ? '#' + new THREE.Color(colors.wood).offsetHSL(0, 0, -0.12).getHexString() : null) ||
      (n === 'carpetDarker' && colors.carpet ? '#' + new THREE.Color(colors.carpet).offsetHSL(0, 0, -0.08).getHexString() : null)
    if (c) m.color.set(c)
    if (n === 'lamp') m.emissive = new THREE.Color('#fff1c9'), m.emissiveIntensity = 0.5
    o.material = m
  })
}

const PPU = 90 // pixels per step of the room in the pictures: sharp on big screens

function render(t, { rot, colors, s }, root) {
  const { THREE, renderer, scene, cam } = t
  const g = root.clone(true)
  paint(THREE, g, colors)
  const inner = new THREE.Group(), pivot = new THREE.Group()
  inner.add(g)
  inner.scale.setScalar(s)
  inner.rotation.y = -rot * Math.PI / 2
  pivot.add(inner)
  scene.add(pivot)
  pivot.updateMatrixWorld(true)
  // the footprint starts at (0, 0): that corner is where the room puts it
  const b = new THREE.Box3().setFromObject(pivot)
  inner.position.set(-b.min.x, -b.min.y, -b.min.z)
  pivot.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(pivot)
  // fit the camera tightly around the piece
  const inv = cam.matrixWorldInverse
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
    const v = new THREE.Vector3(x, y, z).applyMatrix4(inv)
    x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y)
  }
  const pad = 0.04
  x0 -= pad; x1 += pad; y0 -= pad; y1 += pad
  Object.assign(cam, { left: x0, right: x1, top: y1, bottom: y0 })
  cam.updateProjectionMatrix()
  renderer.setSize(Math.ceil((x1 - x0) * PPU), Math.ceil((y1 - y0) * PPU), false)
  renderer.render(scene, cam)
  const url = renderer.domElement.toDataURL('image/png')
  scene.remove(pivot)
  const o = new THREE.Vector3(0, 0, 0).applyMatrix4(inv)
  // sizes in camera steps; the room turns them into its own screen size
  return { url, l: o.x - x0, t: y1 - o.y, w: x1 - x0, h: y1 - y0, fw: box.max.x, fd: box.max.z, fh: box.max.y }
}
