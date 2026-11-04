// Friends: a friend code, visiting each other's rooms, and notes left on a friend's board.
// A friend sees only your name, your room and the books on your shelf. Never your diary, notes or calendar.
// Tables and rules are in supabase/friends.sql.

import * as sync from './sync.js'
import { getState, add, pick, NOTE_COLORS } from './store.js'
import { toast } from './ui.js'

let myProfile = null
let missing = false // the friends tables are not set up in Supabase yet
export const notSetUp = () => missing

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const newCode = () => Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('')
const isMissing = (e) => /relation|does not exist|schema cache|function .* not|Could not find/i.test(e?.message || '')

// what friends see of you
function card() {
  const s = getState()
  const { room } = s
  const books = [...s.books]
    .sort((a, b) => ((b.status === 'reading') - (a.status === 'reading')) || (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 40)
    .map((b) => ({ title: b.title, author: b.author || '', color: b.color, status: b.status || 'done', rating: b.rating || 0 }))
  return { name: s.name || sync.nameOf() || '', room, books, updated_at: new Date().toISOString() }
}

export async function getMyProfile() {
  if (!sync.signedIn() || sync.currentUser()?.offline) return null
  if (myProfile) return myProfile
  const c = await sync.getClient()
  const { data, error } = await c.from('profiles').select('code, name').eq('user_id', sync.currentUser().id).maybeSingle()
  if (error) { missing = isMissing(error); throw error }
  missing = false
  if (data) return (myProfile = data)
  // first time: make a code (try again in the rare case it is taken)
  for (let i = 0; i < 4; i++) {
    const row = { code: newCode(), ...card() }
    const { error: e2 } = await c.from('profiles').insert(row)
    if (!e2) return (myProfile = { code: row.code, name: row.name })
    if (!/duplicate|unique/i.test(e2.message || '')) throw e2
  }
  throw new Error('Could not make a friend code. Try again.')
}

let timer = null
export function publishSoon() {
  clearTimeout(timer)
  timer = setTimeout(publish, 4000)
}
async function publish() {
  try {
    if (!(await getMyProfile())) return
    const c = await sync.getClient()
    await c.from('profiles').update(card()).eq('user_id', sync.currentUser().id)
  } catch { /* friends are not set up, or offline: nothing to do */ }
}

export async function listFriends() {
  const c = await sync.getClient()
  const { data: rows, error } = await c.from('friendships').select('friend_id, created_at').eq('user_id', sync.currentUser().id)
  if (error) { missing = isMissing(error); throw error }
  if (!rows.length) return []
  const { data, error: e2 } = await c.from('profiles').select('user_id, name, room, books, updated_at').in('user_id', rows.map((r) => r.friend_id))
  if (e2) throw e2
  return data.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

export async function addFriend(code) {
  await getMyProfile() // you need a card yourself before others can see you
  const c = await sync.getClient()
  const { data, error } = await c.rpc('add_friend', { friend_code: code.trim().toUpperCase() })
  if (error) throw new Error(/No one has this code/.test(error.message) ? 'No one has this code. Check it and try again.' : /own code/.test(error.message) ? 'This is your own code.' : error.message)
  window.dispatchEvent(new CustomEvent('planner:track', { detail: { name: 'friend_added' } }))
  return data
}

export async function removeFriend(id) {
  const c = await sync.getClient()
  const me = sync.currentUser().id
  await c.from('friendships').delete().eq('user_id', me).eq('friend_id', id)
  await c.from('friendships').delete().eq('user_id', id).eq('friend_id', me)
}

export async function leaveNote(toId, text, color) {
  const c = await sync.getClient()
  const { error } = await c.from('friend_notes').insert({ to_id: toId, text, color, from_name: getState().name || sync.nameOf() || 'A friend' })
  if (error) throw error
  window.dispatchEvent(new CustomEvent('planner:track', { detail: { name: 'friend_note' } }))
}

// Notes friends left for you go onto your own board, then leave the server.
let checking = false
export async function checkInbox() {
  if (checking || !sync.signedIn() || sync.currentUser()?.offline) return
  checking = true
  try {
    const c = await sync.getClient()
    const { data, error } = await c.from('friend_notes').select('id, from_name, text, color, created_at').eq('to_id', sync.currentUser().id).order('created_at')
    if (error || !data?.length) return
    const have = new Set(getState().notes.filter((n) => n.friendNote).map((n) => n.friendNote))
    data.forEach((n) => {
      if (have.has(n.id)) return
      add('notes', { text: n.text, color: NOTE_COLORS.includes(n.color) ? n.color : pick(NOTE_COLORS), from: n.from_name || 'A friend', friendNote: n.id, createdAt: new Date(n.created_at).getTime() })
    })
    await c.from('friend_notes').delete().in('id', data.map((n) => n.id))
    const names = [...new Set(data.map((n) => n.from_name || 'A friend'))]
    toast(data.length === 1 ? `${names[0]} left a note on your board` : `${names.join(' and ')} left ${data.length} notes on your board`, { label: 'See', run: () => { location.hash = '#notes' } })
  } catch { /* not set up yet, or offline */ } finally { checking = false }
}

window.addEventListener('planner:change', (e) => { if (e.detail === 'state' && sync.signedIn()) publishSoon() })
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkInbox() })
