// Decides where a quick note belongs: calendar, books, diary or notes.
// Simple word rules for now; later an AI model will make this decision.

import { todayISO } from './store.js'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAY_RE = /\b(today|tonight|tomorrow|mon(day)?|tue(s|sday)?|wed(nesday)?|thu(rs|rsday)?|fri(day)?|sat(urday)?|sun(day)?)\b/i
const TIME_RE = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|\b(\d{1,2}):(\d{2})\b/i
const BOOK_RE = /^(read|reading|finished|book)\s*[:\-–]?\s+\S/i
const FEEL_RE = /\b(i feel|i felt|i'm feeling|feeling|today was|it was|happy|sad|tired|proud|grateful|lonely|excited|angry|anxious|dear diary)\b/i

function findDate(text) {
  const m = text.match(DAY_RE)
  if (!m) return null
  const word = m[1].toLowerCase()
  const d = new Date()
  if (word === 'today' || word === 'tonight') return todayISO(d)
  if (word === 'tomorrow') { d.setDate(d.getDate() + 1); return todayISO(d) }
  const target = DAYS.findIndex((day) => day.startsWith(word.slice(0, 3)))
  let diff = (target - d.getDay() + 7) % 7
  if (diff === 0) diff = 7
  d.setDate(d.getDate() + diff)
  return todayISO(d)
}

export function findTime(text) {
  const m = text.match(TIME_RE)
  if (!m) return ''
  let h, min
  if (m[3]) {
    h = (Number(m[1]) % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0)
    min = Number(m[2] || 0)
  } else {
    h = Number(m[4]); min = Number(m[5])
  }
  if (h > 23 || min > 59) return ''
  return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0')
}

// "call grandma tomorrow at 18:00" -> "Call grandma" (date and time are kept separately)
function eventTitle(text) {
  const out = text.replace(TIME_RE, '').replace(DAY_RE, '').replace(/\s{2,}/g, ' ').replace(/\s+(at|on|by|for)(\s|$)/gi, ' ').replace(/\s+(at|on|by|for)$/i, '').trim()
  return out ? out[0].toUpperCase() + out.slice(1) : text
}

export function classify(raw) {
  const text = raw.trim()
  if (BOOK_RE.test(text)) {
    return { kind: 'book', title: text.replace(/^(read|reading|finished|book)\s*[:\-–]?\s*/i, '').trim() }
  }
  const date = findDate(text)
  const time = findTime(text)
  // "today I feel happy" is a diary line, not a plan, unless it has a time
  if (FEEL_RE.test(text) && !time) return { kind: 'diary', text }
  if (date || time) {
    return { kind: 'event', item: { title: eventTitle(text), date: date || todayISO(), time, remind: !!time, notified: false } }
  }
  return { kind: 'note', text: text.replace(/^(idea|note|remember)\s*[:\-–]\s*/i, '') }
}
