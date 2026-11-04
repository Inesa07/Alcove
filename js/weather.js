// Real weather outside the window, from Open-Meteo (free, no key).
// Your location is asked once, only when you turn this on, and stays on this device.

const KEY = 'planner.weather'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }

export const weatherOn = () => !!read().on

// WMO weather codes → what we draw
function kindOf(code) {
  if (code === 0) return 'clear'
  if (code <= 2) return 'partly'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'storm'
  return 'rain'
}
export const WEATHER_NAMES = { clear: 'Clear sky', partly: 'A few clouds', cloudy: 'Cloudy', fog: 'Fog', rain: 'Rain', storm: 'Thunderstorm', snow: 'Snow' }

function locate() {
  return new Promise((ok, no) => {
    if (!navigator.geolocation) return no(new Error('This browser cannot share your location'))
    navigator.geolocation.getCurrentPosition(
      (p) => ok({ lat: +p.coords.latitude.toFixed(2), lon: +p.coords.longitude.toFixed(2) }),
      () => no(new Error('Location is blocked, so I cannot see your weather')),
      { timeout: 15000, maximumAge: 6 * 3600 * 1000 },
    )
  })
}

export async function turnOnWeather() {
  const at = await locate()
  write({ on: true, ...at })
  return currentWeather(true)
}
export function turnOffWeather() { write({ ...read(), on: false, data: null }) }

// { kind, temp, name } or null; asks the internet at most every 30 minutes
export async function currentWeather(force = false) {
  const w = read()
  if (!w.on || w.lat == null) return null
  if (!force && w.data && Date.now() - w.data.at < 30 * 60 * 1000) return w.data
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${w.lat}&longitude=${w.lon}&current=temperature_2m,weather_code`)
    const j = await r.json()
    const kind = kindOf(j.current.weather_code)
    const data = { kind, temp: Math.round(j.current.temperature_2m), name: WEATHER_NAMES[kind], at: Date.now() }
    write({ ...read(), data })
    return data
  } catch {
    return w.data || null // offline: keep the last one
  }
}
