// Quiet sounds for the room, made right in the browser (Web Audio), so there are no audio files to load.

export const SOUNDS = { rain: 'Rain', fire: 'Fireplace', birds: 'Birds', waves: 'Sea waves', crickets: 'Summer night' }
const KEY = 'planner.sound'
const saved = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }

let ctx = null, master = null, bus = null, timer = null, now = null
let live = []   // looping sources of the sound playing now
let volume = saved().vol ?? 0.5

export const playing = () => now
export const getVolume = () => volume

function noise(kind) {
  const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), ch = buf.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, last = 0
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1
    if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; ch[i] = last * 3.5 }
    else if (kind === 'pink') { b0 = 0.997 * b0 + w * 0.029591; b1 = 0.985 * b1 + w * 0.032534; b2 = 0.95 * b2 + w * 0.048056; ch[i] = (b0 + b1 + b2 + w * 0.05) * 1.6 }
    else ch[i] = w
  }
  const src = ctx.createBufferSource()
  src.buffer = buf; src.loop = true
  return src
}
const filter = (type, f, q = 0.7) => { const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; return n }
const gain = (v) => { const g = ctx.createGain(); g.gain.value = v; return g }
function chain(...nodes) { for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]); return nodes[nodes.length - 1] }

// a steady bed of noise
function bed(kind, nodes, v) { const s = noise(kind); live.push(s); chain(s, ...nodes, gain(v), bus); s.start() }

// short sounds now and then
function every(minMs, maxMs, fn) {
  const loop = () => { fn(ctx.currentTime + 0.05); timer = setTimeout(loop, minMs + Math.random() * (maxMs - minMs)) }
  timer = setTimeout(loop, 300)
}
function blip(t, f0, f1, dur, v, type = 'sine', pan = 0) {
  const o = ctx.createOscillator(), g = gain(0), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null
  o.type = type
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur)
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dur * 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  if (p) { p.pan.value = pan; chain(o, g, p, bus) } else chain(o, g, bus)
  o.start(t); o.stop(t + dur + 0.05)
}
function crackle(t) {
  const s = noise('white'), g = gain(0), f = filter('bandpass', 1500 + Math.random() * 2500, 1.2)
  g.gain.setValueAtTime(0.5 + Math.random() * 0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02 + Math.random() * 0.05)
  chain(s, f, g, bus); s.start(t, Math.random() * 3); s.stop(t + 0.1)
}

const BUILD = {
  rain() { bed('pink', [filter('highpass', 400), filter('lowpass', 6000)], 0.55); bed('brown', [filter('lowpass', 300)], 0.4) },
  fire() { bed('brown', [filter('lowpass', 450)], 0.7); every(40, 260, (t) => crackle(t)) },
  birds() {
    bed('pink', [filter('bandpass', 900, 0.4)], 0.05)
    every(500, 2600, (t) => {
      const base = 2200 + Math.random() * 2000, n = 2 + Math.floor(Math.random() * 4), pan = Math.random() * 1.6 - 0.8
      for (let i = 0; i < n; i++) blip(t + i * 0.11, base, base * (1.3 + Math.random() * 0.4), 0.08, 0.08, 'sine', pan)
    })
  },
  waves() {
    const s = noise('brown'), f = filter('lowpass', 900), g = gain(0.35)
    const lfo = ctx.createOscillator(), depth = gain(0.3)
    lfo.frequency.value = 0.09
    chain(lfo, depth); depth.connect(g.gain)
    live.push(s, lfo); chain(s, f, g, bus); s.start(); lfo.start()
    bed('pink', [filter('highpass', 2500)], 0.03)
  },
  crickets() {
    bed('brown', [filter('lowpass', 200)], 0.08)
    every(350, 900, (t) => {
      const pan = Math.random() * 1.4 - 0.7, f = 4200 + Math.random() * 500
      for (let i = 0; i < 3; i++) blip(t + i * 0.045, f, f, 0.03, 0.025, 'sine', pan)
    })
  },
}

export function play(id) {
  stop()
  if (!id || !BUILD[id]) return
  if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = gain(volume); master.connect(ctx.destination) }
  ctx.resume()
  bus = gain(0); bus.connect(master)
  bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2) // fade in
  BUILD[id]()
  now = id
  try { localStorage.setItem(KEY, JSON.stringify({ id, vol: volume })) } catch {}
}

export function stop() {
  clearTimeout(timer)
  if (bus) {
    const b = bus
    b.gain.cancelScheduledValues(ctx.currentTime)
    b.gain.setValueAtTime(b.gain.value, ctx.currentTime)
    b.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
    const old = live; live = []
    setTimeout(() => { old.forEach((n) => { try { n.stop() } catch {} }); b.disconnect() }, 700)
    bus = null
  }
  now = null
  try { localStorage.setItem(KEY, JSON.stringify({ id: null, vol: volume })) } catch {}
}

export function setVolume(v) {
  volume = v
  if (master) master.gain.value = v
  try { localStorage.setItem(KEY, JSON.stringify({ id: now, vol: v })) } catch {}
}
