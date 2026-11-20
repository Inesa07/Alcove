// One search for everything: diary pages, notes, books (with your quotes) and plans.
// Open it with the magnifier at the top, or press Ctrl/⌘ + K, or "/".

import * as db from './db.js'
import { getState, setDiaryBook } from './store.js'
import { esc, isoToDate } from './ui.js'

const track = (name, props) => window.dispatchEvent(new CustomEvent('planner:track', { detail: { name, props } }))

// what a page should open when you choose a result (each page takes it when it opens)
let target = null
export function takeFind(kind) {
  if (!target || target.kind !== kind) return null
  const t = target
  target = null
  return t
}

// the words of a diary page
function pageText(p) {
  const words = []
  ;(p.items || []).forEach((i) => {
    if (i.type === 'text' && i.text) words.push(i.text)
    if (i.type === 'title' && i.text) words.push(i.text)
    if ((i.type === 'block' || i.type === 'title') && i.data) Object.values(i.data).forEach((v) => typeof v === 'string' && v.trim() && words.push(v))
  })
  return words.join(' · ').replace(/\s+/g, ' ').trim()
}

let pages = null // read once per search window
async function diaryPages() {
  if (pages) return pages
  const keys = await db.keys('bp:')
  const list = await Promise.all(keys.map(async (k) => ({ n: Number(String(k).slice(3)), p: await db.get(k) })))
  pages = list.filter((x) => x.p).map(({ n, p }) => ({ n, text: pageText(p), on: p.writtenOn || '' })).filter((x) => x.text)
  return pages
}

// lower case without accents, so "cafe" finds "café"
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// a short piece of the text around the first match, with the match marked
function snippet(text, q) {
  const t = String(text), i = norm(t).indexOf(q)
  if (i < 0) return esc(t.slice(0, 90))
  const a = Math.max(0, i - 40), b = Math.min(t.length, i + q.length + 60)
  return (a ? '…' : '') + esc(t.slice(a, i)) + '<mark>' + esc(t.slice(i, i + q.length)) + '</mark>' + esc(t.slice(i + q.length, b)) + (b < t.length ? '…' : '')
}

const fmt = (iso) => (iso ? isoToDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '')

async function find(raw) {
  const q = norm(raw.trim())
  if (q.length < 2) return []
  const s = getState(), out = []
  for (const pg of await diaryPages()) if (norm(pg.text).includes(q)) out.push({ kind: 'page', id: pg.n, title: `Diary · page ${pg.n + 1}`, meta: fmt(pg.on), text: snippet(pg.text, q) })
  for (const n of s.notes) if (norm(n.text).includes(q)) out.push({ kind: 'note', id: n.id, title: n.from ? `Note from ${n.from}` : 'Note', meta: n.createdAt ? fmt(new Date(n.createdAt).toISOString().slice(0, 10)) : '', text: snippet(n.text, q) })
  for (const b of s.books) {
    if (norm(b.title).includes(q) || norm(b.author).includes(q)) out.push({ kind: 'book', id: b.id, title: b.title, meta: b.author || '', text: snippet(`${b.title}${b.author ? ' · ' + b.author : ''}`, q) })
    for (const qt of b.quotes || []) if (norm(qt.text).includes(q)) out.push({ kind: 'book', id: b.id, title: `Quote · ${b.title}`, meta: qt.page ? `page ${qt.page}` : '', text: snippet(qt.text, q) })
    if (b.review && norm(b.review).includes(q)) out.push({ kind: 'book', id: b.id, title: `Your review · ${b.title}`, meta: '', text: snippet(b.review, q) })
  }
  for (const e of s.events) if (norm(e.title).includes(q)) out.push({ kind: 'event', id: e.id, date: e.date, title: 'Plan', meta: `${fmt(e.date)}${e.time ? ' · ' + e.time : ''}`, text: snippet(e.title, q) })
  return out
}

const ICON = { page: '✎', note: '▤', book: '❒', event: '◷' }
const GROUP = { page: 'Diary', note: 'Notes', book: 'Books', event: 'Calendar' }

export function openSearch() {
  if (document.querySelector('.find-dialog')) return
  pages = null
  const d = document.createElement('dialog')
  d.className = 'find-dialog'
  d.innerHTML = `<div class="sd-box">
    <div class="sd-field"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
      <input type="search" placeholder="Search your diary, notes, books and plans" aria-label="Search" autocomplete="off"><kbd>Esc</kbd></div>
    <div class="sd-results" role="listbox" aria-label="Results"><p class="sd-empty">Type a word you remember: a place, a name, a feeling…</p></div></div>`
  document.body.appendChild(d)
  const input = d.querySelector('input'), list = d.querySelector('.sd-results')
  let res = [], active = 0, seq = 0, timer = null
  const draw = () => {
    if (!input.value.trim()) { list.innerHTML = '<p class="sd-empty">Type a word you remember: a place, a name, a feeling…</p>'; return }
    if (!res.length) { list.innerHTML = `<p class="sd-empty">Nothing found for “${esc(input.value.trim())}”.</p>`; return }
    let last = '', html = ''
    res.slice(0, 40).forEach((r, i) => {
      if (r.kind !== last) { html += `<p class="sd-group">${GROUP[r.kind]}</p>`; last = r.kind }
      html += `<button class="sd-item ${i === active ? 'on' : ''}" role="option" aria-selected="${i === active}" data-i="${i}"><span class="sd-ic sd-${r.kind}" aria-hidden="true">${ICON[r.kind]}</span>
        <span class="sd-main"><b>${esc(r.title)}</b>${r.meta ? `<em>${esc(r.meta)}</em>` : ''}<span>${r.text}</span></span></button>`
    })
    list.innerHTML = html
    list.querySelector('.sd-item.on')?.scrollIntoView({ block: 'nearest' })
  }
  input.addEventListener('input', () => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const my = ++seq
      const r = await find(input.value)
      if (my !== seq) return
      res = r; active = 0; draw()
      if (input.value.trim().length > 2) track('search', { found: r.length })
    }, 120)
  })
  const go = (r) => {
    if (!r) return
    track('search_open', { kind: r.kind })
    target = r
    d.close()
    if (r.kind === 'page') { setDiaryBook({ spread: Math.floor(r.id / 2) }); location.hash = '#diary' }
    if (r.kind === 'note') location.hash = '#notes'
    if (r.kind === 'book') location.hash = '#books'
    if (r.kind === 'event') location.hash = '#calendar'
    // already on that page: open it again so it shows the result
    window.dispatchEvent(new CustomEvent('planner:find'))
  }
  d.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (res.length) { active = (active + (e.key === 'ArrowDown' ? 1 : -1) + Math.min(res.length, 40)) % Math.min(res.length, 40); draw() } }
    if (e.key === 'Enter') { e.preventDefault(); go(res[active]) }
  })
  d.addEventListener('click', (e) => {
    if (e.target === d) return d.close()
    const it = e.target.closest('[data-i]')
    if (it) go(res[Number(it.dataset.i)])
  })
  d.addEventListener('close', () => d.remove())
  d.showModal()
  input.focus()
  track('search_start')
}

export function initSearch() {
  const side = document.querySelector('.side')
  if (side && !side.querySelector('.find-btn')) {
    const b = document.createElement('button')
    b.className = 'find-btn'
    b.title = 'Search (Ctrl + K)'
    b.setAttribute('aria-label', 'Search everything')
    b.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>'
    b.addEventListener('click', openSearch)
    side.appendChild(b)
  }
  document.addEventListener('keydown', (e) => {
    const typing = e.target.closest?.('input, textarea, [contenteditable="true"], select')
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing && !document.querySelector('dialog[open]'))) { e.preventDefault(); openSearch() }
  })
}
