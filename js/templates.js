// Ready-made page layouts for the diary, like a bullet journal.
// Every layout has its own boxes, so no two look the same.
// A layout is a list of boxes placed on the page (positions in percent of the page).
// What you write in a box is kept in box.data.

import { esc } from './ui.js'

export const LAYOUTS = {
  lined: { name: 'Lined', paper: 'lined' },
  dotted: { name: 'Dotted', paper: 'dotted' },
  grid: { name: 'Grid', paper: 'grid' },
  plain: { name: 'Plain', paper: 'plain' },

  daily: {
    name: 'Daily planner', paper: 'plain',
    blocks: [
      { kind: 'title', x: 8, y: 4, w: 84, h: 8, text: 'Daily planner' },
      { kind: 'lines', x: 6, y: 14, w: 44, h: 22, title: 'Daily goals', n: 4, bg: '#F9D3DC' },
      { kind: 'water', x: 54, y: 14, w: 40, h: 11 },
      { kind: 'checks', x: 54, y: 28, w: 40, h: 25, title: 'To do', n: 5 },
      { kind: 'schedule', x: 6, y: 39, w: 44, h: 57 },
      { kind: 'meals', x: 54, y: 56, w: 40, h: 40 },
    ],
  },
  week: {
    name: 'My week', paper: 'plain',
    blocks: [
      { kind: 'title', x: 8, y: 3, w: 84, h: 7, text: 'My week' },
      ...['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => ({
        kind: 'lines', title: day, n: 3, x: i % 2 ? 52 : 6, y: 12 + Math.floor(i / 2) * 22, w: 42, h: 19,
        bg: ['#F9D3DC', '', '#D6E6F5', '', '#FBE7A6', '', '#DCC8EE'][i] || undefined,
      })),
      { kind: 'checks', x: 52, y: 78, w: 42, h: 19, title: 'Top 3 this week', n: 3, star: true },
    ],
  },
  lists: {
    name: 'Lists and notes', paper: 'plain',
    blocks: [
      { kind: 'shopping', x: 6, y: 5, w: 42, h: 51 },
      { kind: 'note', x: 53, y: 5, w: 41, h: 53 },
      { kind: 'free', x: 6, y: 60, w: 42, h: 35, title: 'Ideas', bg: '#DAE9DC' },
      { kind: 'free', x: 53, y: 62, w: 41, h: 33, title: 'Places I want to visit' },
    ],
  },
  habits: {
    name: 'Habit tracker', paper: 'plain',
    blocks: [
      { kind: 'title', x: 8, y: 4, w: 84, h: 8, text: 'Habits' },
      { kind: 'habits', x: 6, y: 14, w: 88, h: 44 },
      { kind: 'moodweek', x: 6, y: 62, w: 42, h: 33 },
      { kind: 'sleep', x: 52, y: 62, w: 42, h: 33 },
    ],
  },
  thankful: {
    name: 'Good things', paper: 'plain',
    blocks: [
      { kind: 'title', x: 8, y: 4, w: 84, h: 8, text: 'Good things' },
      { kind: 'free', x: 6, y: 15, w: 88, h: 24, title: 'Today I am thankful for', scribble: true },
      { kind: 'free', x: 6, y: 43, w: 42, h: 24, title: 'Best moment', bg: '#F9D3DC' },
      { kind: 'free', x: 52, y: 43, w: 42, h: 24, title: 'Something I learned', bg: '#D6E6F5' },
      { kind: 'free', x: 6, y: 71, w: 88, h: 24, title: 'Tomorrow I want to' },
    ],
  },
  reading: {
    name: 'Reading log', paper: 'plain',
    blocks: [
      { kind: 'title', x: 8, y: 4, w: 84, h: 8, text: 'Reading log' },
      { kind: 'reading', x: 6, y: 14, w: 88, h: 50 },
      { kind: 'free', x: 6, y: 68, w: 42, h: 27, title: 'Favourite quote', bg: '#FBE7A6', scribble: false },
      { kind: 'lines', x: 52, y: 68, w: 42, h: 27, title: 'Books to read next', n: 4, bg: '#DCC8EE' },
    ],
  },
}

const DEFAULT_TITLES = { water: 'Water', schedule: 'Schedule', meals: 'Meal planner', shopping: 'Shopping list', note: 'Note', habits: 'Habit tracker', moodweek: 'Mood this week', sleep: 'Sleep', reading: 'Books I read' }
const BGS = { meals: '#C9D6F2', note: '#F2B95A', habits: '#DCC8EE', moodweek: '#FCE4D6' }
const HOURS = Array.from({ length: 16 }, (_, i) => String(7 + i).padStart(2, '0') + ':00')
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const MOOD_COLORS = ['', '#8C9BC4', '#A9C1D6', '#9CC7B4', '#EBC86A', '#EDA0B4'] // tap a day to go through them

const field = (data, k, placeholder = '') =>
  `<input class="bf" data-k="${k}" value="${esc(data[k] || '')}" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder || 'Write here')}">`
const tick = (data, k, label, cls = 'tick') =>
  `<button class="${cls}" data-tick="${k}" aria-pressed="${!!data[k]}" aria-label="${esc(label)}"></button>`

export function blockHTML(b) {
  // boxes saved by the first version of the layouts
  if (b.kind === 'goals') b = { ...b, kind: 'lines', n: 4, title: b.title || 'Daily goals', bg: b.bg || '#F9D3DC' }
  if (b.kind === 'todo') b = { ...b, kind: 'checks', n: 5, title: b.title || 'To do' }
  const d = b.data || {}
  const bg = b.bg || BGS[b.kind]
  const style = `left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%;${bg ? `--bg:${bg};` : ''}`
  const title = b.title ?? DEFAULT_TITLES[b.kind] ?? ''
  const head = title ? `<h4>${esc(title)}</h4>` : ''
  let body = ''
  switch (b.kind) {
    case 'title':
      return `<div class="blk-title" data-id="${b.id}" style="${style}">${esc(b.text)}</div>`
    case 'lines':
      body = `<div class="lines">${Array.from({ length: b.n || 4 }, (_, i) => field(d, 'g' + i)).join('')}</div>`
      break
    case 'water':
      body = `<div class="drops">${Array.from({ length: 8 }, (_, i) => tick(d, 'w' + i, `Glass ${i + 1}`, 'drop')).join('')}</div>`
      break
    case 'checks':
      body = `<div class="checks">${Array.from({ length: b.n || 5 }, (_, i) => `<div class="crow">${tick(d, 'c' + i, 'Done', b.star ? 'tick star' : 'tick')}${field(d, 't' + i)}</div>`).join('')}</div>`
      break
    case 'schedule':
      body = `<div class="hours">${HOURS.map((h) => `<label class="hrow"><span>${h}</span>${field(d, 'h' + h)}</label>`).join('')}</div>`
      break
    case 'meals':
      body = `<div class="meals">${MEALS.map((m) => `<label class="mrow"><span>${m}</span>${field(d, 'm' + m)}</label>`).join('')}</div>`
      break
    case 'shopping':
      body = `<div class="checks shop">${Array.from({ length: 10 }, (_, i) => `<div class="crow">${tick(d, 'c' + i, 'Bought')}${field(d, 't' + i)}</div>`).join('')}</div>`
      break
    case 'note':
    case 'free':
      body = `<textarea class="bf area ${b.scribble ? 'scribble' : ''}" data-k="text" aria-label="${esc(title || 'Note')}">${esc(d.text || '')}</textarea>`
      break
    case 'habits':
      body = `<div class="habits">
        <div class="hab-head"><span></span>${DAYS.map((x) => `<span>${x}</span>`).join('')}</div>
        ${Array.from({ length: 6 }, (_, r) => `<div class="hab-row">${field(d, 'n' + r, r === 0 ? 'Read 20 pages' : r === 1 ? 'Drink water' : '')}${DAYS.map((_, c) => tick(d, `x${r}_${c}`, `Day ${c + 1}`, 'dot')).join('')}</div>`).join('')}
      </div>`
      break
    case 'moodweek':
      body = `<div class="moodweek">${DAYS.map((x, i) => {
        const m = Number(d['d' + i] || 0)
        return `<div class="mw-day"><button class="mw-dot" data-cycle="d${i}" style="--m:${MOOD_COLORS[m] || 'transparent'}" aria-label="${DAY_NAMES[i]} mood"></button><span>${x}</span></div>`
      }).join('')}</div>
      <p class="mw-key">${MOOD_COLORS.slice(1).map((c) => `<i style="--m:${c}"></i>`).join('')}<span>tap a day</span></p>`
      break
    case 'sleep':
      body = `<div class="sleep">${DAY_NAMES.map((n, i) => `<label class="srow"><span>${n.slice(0, 3)}</span>${field(d, 's' + i, '')}<em>h</em></label>`).join('')}</div>`
      break
    case 'reading':
      body = `<div class="reading">
        <div class="rd-head"><span>Title</span><span>Author</span><span>Rating</span></div>
        ${Array.from({ length: 7 }, (_, r) => `<div class="rd-row">${field(d, 'rt' + r)}${field(d, 'ra' + r)}<span class="stars">${[1, 2, 3, 4, 5].map((s) => `<button class="star-btn" data-rate="r${r}" data-val="${s}" aria-pressed="${Number(d['r' + r] || 0) >= s}" aria-label="${s} stars"></button>`).join('')}</span></div>`).join('')}
      </div>`
      break
  }
  return `<section class="blk blk-${b.kind}" data-id="${b.id}" style="${style}">${head}${body}</section>`
}
