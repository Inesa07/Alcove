// Ready-made page layouts for the diary, like a bullet journal.
// A layout is a list of blocks placed on the page (positions in percent of the page).
// What you write in a block is kept in block.data.

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
      { kind: 'goals', x: 6, y: 14, w: 44, h: 22 },
      { kind: 'water', x: 54, y: 14, w: 40, h: 11 },
      { kind: 'todo', x: 54, y: 28, w: 40, h: 25 },
      { kind: 'schedule', x: 6, y: 39, w: 44, h: 57 },
      { kind: 'meals', x: 54, y: 56, w: 40, h: 40 },
    ],
  },
  lists: {
    name: 'Lists and notes', paper: 'plain',
    blocks: [
      { kind: 'shopping', x: 6, y: 5, w: 42, h: 51 },
      { kind: 'note', x: 53, y: 5, w: 41, h: 53 },
      { kind: 'free', x: 6, y: 60, w: 42, h: 35, title: 'Today I am thankful for', scribble: true },
      { kind: 'free', x: 53, y: 62, w: 41, h: 33, title: 'Daily fitness' },
    ],
  },
  habits: {
    name: 'Habit tracker', paper: 'plain',
    blocks: [
      { kind: 'title', x: 8, y: 4, w: 84, h: 8, text: 'This week' },
      { kind: 'habits', x: 6, y: 14, w: 88, h: 44 },
      { kind: 'goals', x: 6, y: 62, w: 42, h: 33, title: 'Goals' },
      { kind: 'free', x: 52, y: 62, w: 42, h: 33, title: 'Notes', bg: '#FBE7A6' },
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
}

const TITLES = {
  goals: 'Daily goals', water: 'Water', todo: 'To do', schedule: 'Schedule', meals: 'Meal planner',
  shopping: 'Shopping list', note: 'Note', habits: 'Habit tracker', free: '',
}
const BGS = { goals: '#F9D3DC', meals: '#C9D6F2', note: '#F2B95A', habits: '#DCC8EE' }
const HOURS = Array.from({ length: 16 }, (_, i) => String(7 + i).padStart(2, '0') + ':00')
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const field = (data, k, placeholder = '') =>
  `<input class="bf" data-k="${k}" value="${esc(data[k] || '')}" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder || 'Write here')}">`
const tick = (data, k, label, cls = 'tick') =>
  `<button class="${cls}" data-tick="${k}" aria-pressed="${!!data[k]}" aria-label="${esc(label)}"></button>`

export function blockHTML(b) {
  const d = b.data || {}
  const style = `left:${b.x}%;top:${b.y}%;width:${b.w}%;height:${b.h}%;${b.bg || BGS[b.kind] ? `--bg:${b.bg || BGS[b.kind]};` : ''}`
  const title = b.title ?? TITLES[b.kind]
  const head = title ? `<h4>${esc(title)}</h4>` : ''
  let body = ''
  switch (b.kind) {
    case 'title':
      return `<div class="blk-title" data-id="${b.id}" style="${style}">${esc(b.text)}</div>`
    case 'goals':
      body = `<div class="lines">${[0, 1, 2, 3].map((i) => field(d, 'g' + i)).join('')}</div>`
      break
    case 'water':
      body = `<div class="drops">${Array.from({ length: 8 }, (_, i) => tick(d, 'w' + i, `Glass ${i + 1}`, 'drop')).join('')}</div>`
      break
    case 'todo':
      body = `<div class="checks">${[0, 1, 2, 3, 4].map((i) => `<div class="crow">${tick(d, 'c' + i, 'Done')}${field(d, 't' + i)}</div>`).join('')}</div>`
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
        ${Array.from({ length: 6 }, (_, r) => `<div class="hab-row">${field(d, 'n' + r, r === 0 ? 'Read 20 pages' : '')}${DAYS.map((_, c) => tick(d, `x${r}_${c}`, `Day ${c + 1}`, 'dot')).join('')}</div>`).join('')}
      </div>`
      break
  }
  return `<section class="blk blk-${b.kind}" data-id="${b.id}" style="${style}">${head}${body}</section>`
}
