// Stickers for the diary. Each one is a small drawing on a 64×64 grid
// with a white outline, like a real paper sticker.

const W = 'stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" paint-order="stroke"'

export const STICKERS = {
  heart: `<path d="M32 54S10 41 8 26C6 15 13 9 21 9c5 0 8.5 3 11 7 2.5-4 6-7 11-7 8 0 15 6 13 17-2 15-24 28-24 28z" fill="#E98AA0" ${W}/><path d="M18 20c2-3 5-4 8-3" stroke="#FFF" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  star: `<path d="M32 5l7.6 16.2 17.7 2.2-13 12.2 3.4 17.6L32 44.5 16.3 53.2l3.4-17.6-13-12.2 17.7-2.2z" fill="#F2C94C" ${W}/><circle cx="26" cy="31" r="1.8" fill="#4A4260"/><circle cx="38" cy="31" r="1.8" fill="#4A4260"/><path d="M28.5 36q3.5 3 7 0" stroke="#4A4260" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  flower: `<g ${W}><circle cx="32" cy="15" r="11" fill="#F4B7C8"/><circle cx="48" cy="27" r="11" fill="#F4B7C8"/><circle cx="42" cy="46" r="11" fill="#F4B7C8"/><circle cx="22" cy="46" r="11" fill="#F4B7C8"/><circle cx="16" cy="27" r="11" fill="#F4B7C8"/></g><circle cx="32" cy="32" r="9" fill="#F6D27A"/>`,
  sun: `<g stroke="#F2B544" stroke-width="5" stroke-linecap="round"><path d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l6 6M46 46l6 6M12 52l6-6M46 18l6-6"/></g><circle cx="32" cy="32" r="14" fill="#F6CF5E" ${W}/>`,
  moon: `<path d="M42 8a24 24 0 1 0 14 34A20 20 0 0 1 42 8z" fill="#C9C2EC" ${W}/><circle cx="20" cy="40" r="2" fill="#A89BD9"/><circle cx="30" cy="48" r="3" fill="#A89BD9"/>`,
  cloud: `<path d="M18 50c-8 0-13-5-13-11s5-11 12-11c1-9 8-15 16-15 9 0 15 6 16 14 7 0 12 5 12 11.5S56 50 49 50z" fill="#FFFFFF" stroke="#CFE0F2" stroke-width="3"/>`,
  rainbow: `<g fill="none" stroke-width="6" stroke-linecap="round"><path d="M8 48a24 24 0 0 1 48 0" stroke="#E98AA0"/><path d="M15 48a17 17 0 0 1 34 0" stroke="#F6CF5E"/><path d="M22 48a10 10 0 0 1 20 0" stroke="#8FC6A9"/></g>`,
  coffee: `<path d="M12 24h34v16a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14z" fill="#E9A3B4" ${W}/><path d="M46 28h4a7 7 0 0 1 0 14h-5" fill="none" stroke="#E9A3B4" stroke-width="5"/><path d="M22 8q4 5 0 10M31 6q4 5 0 10" stroke="#B8AFC9" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  cat: `<path d="M12 22L14 6l12 10h12l12-10 2 16c4 5 5 10 5 15 0 12-11 20-25 20S7 49 7 37c0-5 1-10 5-15z" fill="#4A4260" ${W}/><circle cx="23" cy="34" r="3" fill="#F6D27A"/><circle cx="41" cy="34" r="3" fill="#F6D27A"/><path d="M29 42l3 3 3-3" fill="#E98AA0"/>`,
  leaf: `<path d="M10 54C10 26 26 10 56 8c0 30-16 46-46 46z" fill="#8FC6A9" ${W}/><path d="M12 52L44 20" stroke="#5E937A" stroke-width="2.5" stroke-linecap="round"/>`,
  butterfly: `<g ${W}><path d="M31 30C24 10 6 8 8 22c1 9 10 10 23 8z" fill="#B9A9E0"/><path d="M33 30c7-20 25-22 23-8-1 9-10 10-23 8z" fill="#B9A9E0"/><path d="M31 33c-10 2-18 9-15 16 3 6 10 1 15-16z" fill="#F4B7C8"/><path d="M33 33c10 2 18 9 15 16-3 6-10 1-15-16z" fill="#F4B7C8"/></g><rect x="30" y="20" width="4" height="26" rx="2" fill="#4A4260"/>`,
  cherry: `<path d="M24 40C26 24 34 14 46 8M42 42c0-14 2-24 4-34" stroke="#5E937A" stroke-width="3" fill="none"/><circle cx="22" cy="46" r="11" fill="#E0566F" ${W}/><circle cx="44" cy="46" r="11" fill="#E0566F" ${W}/><circle cx="18" cy="42" r="2.5" fill="#FFF" opacity=".7"/>`,
  bow: `<g ${W}><path d="M30 30L8 16v30z" fill="#F4B7C8"/><path d="M34 30l22-14v30z" fill="#F4B7C8"/><path d="M28 32l-8 24 9-5M36 32l8 24-9-5" fill="#E98AA0"/></g><circle cx="32" cy="31" r="6" fill="#E98AA0"/>`,
  sparkle: `<path d="M32 4c2 16 8 22 24 24-16 2-22 8-24 24-2-16-8-22-24-24 16-2 22-8 24-24z" fill="#F6CF5E" ${W}/><path d="M52 44c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z" fill="#B9A9E0"/>`,
  music: `<path d="M24 46V14l28-6v32" fill="none" stroke="#7FA3C8" stroke-width="5" stroke-linejoin="round"/><ellipse cx="18" cy="47" rx="8" ry="6" fill="#7FA3C8" ${W}/><ellipse cx="46" cy="41" rx="8" ry="6" fill="#7FA3C8" ${W}/>`,
  plane: `<path d="M6 30L58 8 44 56 32 38z" fill="#FFFFFF" stroke="#7FA3C8" stroke-width="3" stroke-linejoin="round"/><path d="M58 8L32 38v14l7-9" fill="#CFE0F2" stroke="#7FA3C8" stroke-width="3" stroke-linejoin="round"/>`,
  book: `<path d="M8 14c8-3 16-3 24 2v38c-8-5-16-5-24-2z" fill="#B9A9E0" ${W}/><path d="M56 14c-8-3-16-3-24 2v38c8-5 16-5 24-2z" fill="#CFC4EF" ${W}/>`,
  cake: `<rect x="10" y="30" width="44" height="24" rx="5" fill="#F4B7C8" ${W}/><path d="M10 38q5 5 11 0t11 0 11 0 11 0" fill="none" stroke="#FFF" stroke-width="3"/><rect x="30" y="16" width="4" height="14" rx="2" fill="#7FA3C8"/><ellipse cx="32" cy="12" rx="3" ry="4.5" fill="#F6CF5E"/>`,
  gift: `<rect x="9" y="26" width="46" height="30" rx="4" fill="#8FC6A9" ${W}/><rect x="6" y="18" width="52" height="10" rx="3" fill="#A7D3BC" ${W}/><rect x="29" y="18" width="6" height="38" fill="#E98AA0"/><path d="M32 18c-6-10-16-8-14-2 1 3 8 3 14 2zM32 18c6-10 16-8 14-2-1 3-8 3-14 2z" fill="#E98AA0"/>`,
  smile: `<circle cx="32" cy="32" r="25" fill="#F6CF5E" ${W}/><circle cx="23" cy="27" r="3" fill="#4A4260"/><circle cx="41" cy="27" r="3" fill="#4A4260"/><path d="M21 38q11 10 22 0" stroke="#4A4260" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="17" cy="36" r="3.5" fill="#F4A3A8" opacity=".8"/><circle cx="47" cy="36" r="3.5" fill="#F4A3A8" opacity=".8"/>`,
}

export const sticker = (name) => `<svg viewBox="0 0 64 64" aria-hidden="true">${STICKERS[name] || ''}</svg>`
