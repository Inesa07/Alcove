// The habits page: your habits with the last seven days, streaks, and ideas to start with.

import { subscribe, todayISO } from '../store.js'
import { $, esc, addDays, isoToDate, toast } from '../ui.js'
import { habits, addHabit, removeHabit, renameHabit, toggleDay, streakOf, weekTicks, plantGrowth, HABIT_IDEAS, HABIT_ICONS } from '../habits.js'

export function mount(el) {
  let icon = HABIT_ICONS[0]
  let editing = null

  function render() {
    const list = habits(), t = todayISO()
    const days = Array.from({ length: 7 }, (_, i) => addDays(t, i - 6))
    const g = plantGrowth()
    const doneToday = list.filter((h) => h.days[t]).length
    el.innerHTML = `<section class="habits-page">
      <header class="page-head"><div><h2>Habits</h2>
        <p class="sub">Small things you want to do every day. Your plant in the room grows and blooms when you keep them.</p></div></header>
      ${list.length ? `<div class="hb-summary">
        <div class="hb-today"><b>${doneToday} of ${list.length}</b><span>done today</span></div>
        <div class="hb-plant" aria-hidden="true">${'🌿'.repeat(1 + Math.min(4, g.leaves))}${'🌸'.repeat(g.bloom)}</div>
        <p>${g.bloom ? `Your plant has ${g.bloom} ${g.bloom === 1 ? 'flower' : 'flowers'} this week.` : weekTicks() ? 'Keep going: a few more days and your plant blooms.' : 'Tick a habit today and watch your plant grow.'}</p>
      </div>` : ''}
      <ul class="hb-list">${list.map((h) => {
        const st = streakOf(h)
        if (editing === h.id) return `<li class="hb-card editing" style="--c:${h.color}"><form class="hb-edit" data-hb-save="${h.id}">
          <div class="hb-icons" role="radiogroup" aria-label="Icon">${HABIT_ICONS.map((ic) => `<button type="button" role="radio" aria-checked="${ic === h.icon}" data-hb-editicon="${ic}">${ic}</button>`).join('')}</div>
          <div class="hb-row"><input class="field" name="name" value="${esc(h.name)}" maxlength="40" required><button class="primary small">Save</button><button type="button" class="ghost small" data-hb-cancel>Cancel</button></div>
          <button type="button" class="link-btn danger" data-hb-del="${h.id}">Delete this habit</button></form></li>`
        return `<li class="hb-card" style="--c:${h.color}">
          <button class="hb-main" data-hb-toggle="${h.id}" aria-pressed="${!!h.days[t]}"><span class="hb-icon">${h.icon}</span><span class="hb-name"><b>${esc(h.name)}</b><em>${st ? `${st} ${st === 1 ? 'day' : 'days'} in a row` : 'Not started yet'}</em></span>
            <span class="hb-check" aria-hidden="true">${h.days[t] ? '✓' : ''}</span></button>
          <div class="hb-week">${days.map((d) => `<button class="hb-day ${h.days[d] ? 'on' : ''} ${d === t ? 'today' : ''}" data-hb-day="${h.id}|${d}" aria-pressed="${!!h.days[d]}" aria-label="${esc(h.name)} on ${isoToDate(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}"><span>${isoToDate(d).toLocaleDateString('en-GB', { weekday: 'narrow' })}</span><i></i></button>`).join('')}</div>
          <button class="hb-more" data-hb-edit="${h.id}" aria-label="Change ${esc(h.name)}">⋯</button>
        </li>`
      }).join('')}</ul>
      ${list.length < 10 ? `<form class="hb-add" data-hb-add>
        <h3>${list.length ? 'Add another habit' : 'Start your first habit'}</h3>
        <div class="hb-ideas">${HABIT_IDEAS.filter(([, n]) => !list.some((h) => h.name === n)).map(([ic, n]) => `<button type="button" class="chip" data-hb-idea="${ic}|${esc(n)}">${ic} ${esc(n)}</button>`).join('')}</div>
        <p class="hb-or">or your own:</p>
        <div class="hb-icons" role="radiogroup" aria-label="Icon">${HABIT_ICONS.map((ic) => `<button type="button" role="radio" aria-checked="${ic === icon}" data-hb-icon="${ic}">${ic}</button>`).join('')}</div>
        <div class="hb-row"><input class="field" name="name" placeholder="Meditate 5 minutes" maxlength="40"><button class="primary small">Add</button></div>
      </form>` : ''}
    </section>`
  }

  el.addEventListener('click', (e) => {
    const t = e.target
    const tg = t.closest('[data-hb-toggle]')
    if (tg) { if (toggleDay(tg.dataset.hbToggle) && navigator.vibrate) navigator.vibrate(15); return }
    const dy = t.closest('[data-hb-day]')
    if (dy) { const [id, d] = dy.dataset.hbDay.split('|'); toggleDay(id, d); return }
    const idea = t.closest('[data-hb-idea]')
    if (idea) { const [ic, n] = idea.dataset.hbIdea.split('|'); addHabit(n, ic); toast(`${ic} ${n}: tick it every day you do it`); return }
    const ic = t.closest('[data-hb-icon]')
    if (ic) { icon = ic.dataset.hbIcon; el.querySelectorAll('[data-hb-icon]').forEach((b) => b.setAttribute('aria-checked', b === ic)); return }
    const eic = t.closest('[data-hb-editicon]')
    if (eic) { eic.closest('.hb-icons').querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', b === eic)); return }
    const ed = t.closest('[data-hb-edit]')
    if (ed) { editing = ed.dataset.hbEdit; return render() }
    if (t.closest('[data-hb-cancel]')) { editing = null; return render() }
    const del = t.closest('[data-hb-del]')
    if (del) { removeHabit(del.dataset.hbDel); editing = null; toast('Habit deleted'); return }
  })
  el.addEventListener('submit', (e) => {
    e.preventDefault()
    const f = e.target
    if (f.matches('[data-hb-add]')) {
      const n = f.name.value.trim()
      if (!n) return f.name.focus()
      addHabit(n, icon)
    }
    if (f.matches('[data-hb-save]')) {
      const ic = f.querySelector('[data-hb-editicon][aria-checked="true"]')?.dataset.hbEditicon
      editing = null
      renameHabit(f.dataset.hbSave, f.name.value, ic)
    }
  })

  render()
  return subscribe(render)
}
