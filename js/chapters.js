// Every 20th page is a chapter cover: a colourful page with a little picture and a kind sentence.
// You can still write, draw and put stickers on top of it.

const CHAPTERS = [
  { a: '#F7C6D3', b: '#B9A3E0', ink: '#4A3F6B', art: 'balloon', text: 'One page at a time is still a whole story.' },
  { a: '#FBE3A0', b: '#F2A97A', ink: '#5A3A28', art: 'sun', text: 'Be gentle with yourself. You are doing better than you think.' },
  { a: '#BFE0F2', b: '#8FB7E0', ink: '#21405E', art: 'waves', text: 'Small steps every day add up to big journeys.' },
  { a: '#D8EBD9', b: '#7FB08A', ink: '#264434', art: 'plant', text: 'Grow at your own pace. Roots first, then flowers.' },
  { a: '#2E3A78', b: '#5F4B8B', ink: '#FFF3D0', art: 'moon', text: 'Rest is part of the work. The moon shines a little at a time.' },
  { a: '#F9D3DC', b: '#E28FA3', ink: '#5B2638', art: 'heart', text: 'Collect moments, not things.' },
  { a: '#E6DCF5', b: '#A8C5E8', ink: '#3A3350', art: 'mountains', text: 'The view gets better the higher you climb.' },
  { a: '#FDE9D9', b: '#F6C46B', ink: '#5A3A28', art: 'rainbow', text: 'After every rainy day, look up.' },
]

const ART = {
  balloon: (k) => `<path d="M100 30c-30 0-48 22-48 46 0 26 26 44 40 60h16c14-16 40-34 40-60 0-24-18-46-48-46z" fill="#fff" opacity=".9"/><path d="M100 30c-12 0-20 22-20 46s10 44 12 60M100 30c12 0 20 22 20 46s-10 44-12 60" stroke="${k}" stroke-width="2" fill="none" opacity=".35"/><path d="M92 136l-2 14h20l-2-14" stroke="${k}" stroke-width="2" fill="none"/><rect x="88" y="150" width="24" height="16" rx="3" fill="${k}" opacity=".7"/><circle cx="40" cy="60" r="10" fill="#fff" opacity=".5"/><circle cx="160" cy="100" r="7" fill="#fff" opacity=".5"/><path d="M20 120q20-12 40 0t40 0" stroke="#fff" stroke-width="3" fill="none" opacity=".5"/>`,
  sun: (k) => `<circle cx="100" cy="90" r="34" fill="#fff" opacity=".95"/>${Array.from({ length: 12 }, (_, i) => { const a = (Math.PI * 2 * i) / 12; return `<path d="M${100 + Math.cos(a) * 46} ${90 + Math.sin(a) * 46}L${100 + Math.cos(a) * 62} ${90 + Math.sin(a) * 62}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>` }).join('')}<path d="M20 170q40-30 80 0t80 0v20H20z" fill="${k}" opacity=".18"/>`,
  waves: (k) => `<circle cx="140" cy="60" r="20" fill="#fff" opacity=".9"/><path d="M10 110q22-16 45 0t45 0 45 0 45 0" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M10 135q22-16 45 0t45 0 45 0 45 0" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/><path d="M10 160q22-16 45 0t45 0 45 0 45 0" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".45"/><path d="M70 96l14-30 0 30z" fill="#fff"/><path d="M60 98h34l-5 6H65z" fill="${k}" opacity=".6"/>`,
  plant: (k) => `<path d="M72 130h56l-8 44H80z" fill="#fff" opacity=".95"/><path d="M100 130V60" stroke="${k}" stroke-width="3"/><path d="M100 100c-30-4-40-30-34-44 20 2 34 20 34 44zM100 84c22-6 36-28 30-44-20 4-30 22-30 44zM100 118c-20 2-36-10-38-24 16-4 34 6 38 24z" fill="${k}" opacity=".55"/><circle cx="40" cy="50" r="5" fill="#fff" opacity=".7"/><circle cx="165" cy="80" r="4" fill="#fff" opacity=".7"/>`,
  moon: (k) => `<path d="M118 40a50 50 0 1 0 0 100 40 40 0 1 1 0-100z" fill="${k}"/>${[[40, 50], [160, 40], [150, 140], [50, 150], [80, 30], [175, 100]].map(([x, y], i) => `<path transform="translate(${x} ${y}) scale(${0.6 + (i % 3) * 0.25})" d="M0-8L2-2 8 0 2 2 0 8-2 2-8 0-2-2z" fill="${k}"/>`).join('')}`,
  heart: (k) => `<path d="M100 160C40 120 40 70 70 60c14-4 26 4 30 16 4-12 16-20 30-16 30 10 30 60-30 100z" fill="#fff" opacity=".95"/><path d="M55 40c-10 0-16 8-16 16 0 14 16 24 16 24s16-10 16-24c0-8-6-16-16-16z" fill="${k}" opacity=".35"/><path d="M150 120c-6 0-10 5-10 10 0 8 10 14 10 14s10-6 10-14c0-5-4-10-10-10z" fill="${k}" opacity=".35"/>`,
  mountains: (k) => `<circle cx="150" cy="50" r="16" fill="#fff" opacity=".9"/><path d="M10 170l60-90 40 50 30-40 50 80z" fill="#fff" opacity=".9"/><path d="M70 80l14 22-14-6-12 8zM140 90l12 16-12-4-10 6z" fill="${k}" opacity=".35"/><path d="M10 170h180" stroke="${k}" stroke-width="2" opacity=".3"/>`,
  rainbow: (k) => `${['#F49AA8', '#F6C46B', '#A8D58E', '#8FB7E0', '#B9A3E0'].map((c, i) => `<path d="M${30 + i * 12} 150a${70 - i * 12} ${70 - i * 12} 0 0 1 ${140 - i * 24} 0" stroke="${c}" stroke-width="11" fill="none"/>`).join('')}<path d="M18 152q12-16 28-6 10-10 22 0 8 8-4 12H22q-10-2-4-6zM132 152q12-16 28-6 10-10 22 0 8 8-4 12h-42q-10-2-4-6z" fill="#fff"/>`,
}

export const isChapter = (n) => (n + 1) % 20 === 0

// n is the page index (0 = page 1). Page 20 opens chapter 2, page 40 chapter 3…
export function chapterHTML(n) {
  if (!isChapter(n)) return ''
  const no = (n + 1) / 20 + 1
  const c = CHAPTERS[(no - 2) % CHAPTERS.length]
  return `<div class="chapter" aria-label="Chapter ${no}" style="--a:${c.a};--b:${c.b};--ink:${c.ink}">
    <div class="ch-frame">
      <p class="ch-kicker">Chapter</p>
      <p class="ch-no">${no}</p>
      <svg class="ch-art" viewBox="0 0 200 190" aria-hidden="true">${ART[c.art](c.ink)}</svg>
      <p class="ch-text">${c.text}</p>
      <p class="ch-pages">pages ${n + 2}–${n + 21}</p>
    </div>
  </div>`
}

// Things to write about when the page is empty and nothing comes to mind
export const PROMPTS = [
  'What made you smile today?',
  'Three things you are grateful for right now.',
  'What would you tell yourself one year ago?',
  'Describe a small moment from today in detail: the light, the sounds, the smell.',
  'What are you looking forward to this week?',
  'Something you learned recently.',
  'Who made your day better, and how?',
  'What is one thing you want to let go of?',
  'Your perfect slow Sunday, hour by hour.',
  'A place you want to visit, and why.',
  'What song describes your mood today?',
  'Write a short letter to someone you miss.',
  'What are you proud of this month?',
  'What drained your energy today, and what gave it back?',
  'A book, film or quote that stayed with you.',
  'If today was a colour, which one and why?',
  'One tiny goal for tomorrow.',
  'What does "home" feel like to you?',
  'Something kind you did, or someone did for you.',
  'What would make tomorrow 1% better?',
]
