// Decides where a quick note belongs in the room.
// Simple word rules for now; later an AI model will make this decision.

import { todayISO } from './store.js'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAY_RE = /\b(today|tomorrow|mon(day)?|tue(s|sday)?|wed(nesday)?|thu(rs|rsday)?|fri(day)?|sat(urday)?|sun(day)?)\b/i
const TIME_RE = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|\b(\d{1,2}):(\d{2})\b/i

const BOOK_RE = /^(read|reading|want to read|book\s*[:\-–])\s*\S/i
const IDEA_RE = /^(idea|note|remember|maybe|wish)\b|\b(idea|wish)\b/i
const FEEL_RE = /\b(i feel|i felt|i'm feeling|feeling|today was|it was|was (so )?(calm|good|great|hard|bad|nice|fun|long)|happy|sad|tired|proud|grateful|lonely|excited|angry|anxious|dear diary)\b/i
const TASK_RE = /\b(buy|call|test|exam|meet|pay|send|finish|do|go|bring|book an?|appointment|deadline|homework|clean|cook|dentist|doctor|submit|prepare|study)\b/i

function findDate(text) {
  const m = text.match(DAY_RE)
  if (!m) return null
  const word = m[1].toLowerCase()
  const d = new Date()
  if (word === 'today') return todayISO(d)
  if (word === 'tomorrow') { d.setDate(d.getDate() + 1); return todayISO(d) }
  const target = DAYS.findIndex((day) => day.startsWith(word.slice(0, 3)))
  let diff = (target - d.getDay() + 7) % 7
  if (diff === 0) diff = 7
  d.setDate(d.getDate() + diff)
  return todayISO(d)
}

function findTime(text) {
  const m = text.match(TIME_RE)
  if (!m) return ''
  let h, min
  if (m[3]) {
    h = Number(m[1]) % 12 + (m[3].toLowerCase() === 'pm' ? 12 : 0)
    min = Number(m[2] || 0)
  } else {
    h = Number(m[4]); min = Number(m[5])
  }
  if (h > 23 || min > 59) return ''
  return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0')
}

function tagFor(text) {
  const t = text.toLowerCase()
  if (/\b(idea|app|design|make|build)\b/.test(t)) return 'Ideas'
  if (/\b(study|teacher|class|lesson|formula|exam|test|homework|chapter)\b/.test(t)) return 'Study'
  if (/\b(buy|gift|shop|store)\b/.test(t)) return 'Shopping'
  return 'Notes'
}

// "call grandma tomorrow at 18:00" -> "call grandma" (the date and time are shown separately)
function taskText(text) {
  const out = text
    .replace(TIME_RE, '')
    .replace(DAY_RE, '')
    .replace(/\b(at|on|by|for)\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+(at|on|by)(\s|$)/gi, ' ')
    .trim()
  return out ? out[0].toUpperCase() + out.slice(1) : text
}

const clean = (text) => text.replace(/^(idea|note|remember|read|book)\s*[:\-–]\s*/i, '').trim()

export function classify(raw) {
  const text = raw.trim()
  const date = findDate(text)
  const time = findTime(text)

  if (BOOK_RE.test(text)) {
    const title = text.replace(/^(read|reading|want to read|book)\s*[:\-–]?\s*/i, '').trim() || text
    return { place: 'shelf', kind: 'books', item: { title, status: /^reading/i.test(text) ? 'reading' : 'want', createdAt: Date.now() } }
  }
  if (IDEA_RE.test(text)) {
    return { place: 'board', kind: 'notes', item: { text: clean(text), tag: tagFor(text), createdAt: Date.now() } }
  }
  if (FEEL_RE.test(text) && !time && !TASK_RE.test(text)) {
    return { place: 'bed', kind: 'diary', item: { text, date: todayISO(), createdAt: Date.now() } }
  }
  if (date || time || TASK_RE.test(text)) {
    return { place: 'desk', kind: 'tasks', item: { text: taskText(text), date: date || todayISO(), time, done: false, doneOn: null } }
  }
  return { place: 'bed', kind: 'diary', item: { text, date: todayISO(), createdAt: Date.now() } }
}
