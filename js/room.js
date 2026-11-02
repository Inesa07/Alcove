// The room illustration. Isometric shapes were laid out on a grid
// (see the design canvas); dynamic parts change with time and your data.

export const SPOTS = [
  { id: 'window', name: 'Window', l: 68.7, t: 27.4, w: 20.5, h: 31.6 },
  { id: 'board', name: 'Corkboard', l: 27.7, t: 22.6, w: 17.9, h: 22.6 },
  { id: 'shelf', name: 'Bookshelf', l: 12.8, t: 41.6, w: 17.9, h: 35.8 },
  { id: 'desk', name: 'Desk', l: 27.2, t: 42.1, w: 28.7, h: 29.5 },
  { id: 'bed', name: 'Bed and diary', l: 51.3, t: 50, w: 36.9, h: 36.8 },
  { id: 'plant', name: 'Plant', l: 21.5, t: 64.2, w: 15.9, h: 17.4 },
]

export function timeOfDay(d = new Date()) {
  const h = d.getHours()
  if (h >= 5 && h < 11) return 'morning'
  if (h >= 11 && h < 17) return 'day'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

const SKIES = {
  morning: { stops: ['#F6C9B4', '#FBE4D3', '#E3ECF3'], orb: '#FFF4D6', orbY: 250, stars: false, lamp: false, hills: '#C9A9B8' },
  day: { stops: ['#8EC0E8', '#C6E1F4', '#EEF6FB'], orb: '#FFFBEA', orbY: 214, stars: false, lamp: false, hills: '#9DB79F' },
  evening: { stops: ['#3E477F', '#B9738F', '#F3BB8F'], orb: '#FFF3D6', orbY: 224, stars: true, lamp: true, hills: '#7A6496' },
  night: { stops: ['#0D1330', '#1B2550', '#2C3A6E'], orb: '#E9ECF7', orbY: 220, stars: true, lamp: true, hills: '#2A2F55' },
}

const show = (on) => (on ? '1' : '0')

export function roomSVG({ tod, pendingTasks, books, notes, diaryToday, leaves }) {
  const s = SKIES[tod]
  return `
<svg role="img" aria-label="Your room" viewBox="0 70 390 380" preserveAspectRatio="xMidYMid meet">
  <defs>
    <radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#4C4474" stop-opacity=".9"/><stop offset="1" stop-color="#4C4474" stop-opacity="0"/></radialGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.stops[0]}"/><stop offset=".55" stop-color="${s.stops[1]}"/><stop offset="1" stop-color="${s.stops[2]}"/></linearGradient>
    <radialGradient id="lamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE3A8" stop-opacity=".5"/><stop offset="1" stop-color="#FFE3A8" stop-opacity="0"/></radialGradient>
    <linearGradient id="wallL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCD1E8"/><stop offset="1" stop-color="#ECE4F3"/></linearGradient>
    <linearGradient id="wallR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CDC0DF"/><stop offset="1" stop-color="#C1B2D6"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCC1A6"/><stop offset="1" stop-color="#EAD4BD"/></linearGradient>
  </defs>
  <circle cx="195" cy="272" r="178" fill="url(#halo)"/>

  <polygon points="195.0,268.0 47.8,353.0 47.8,200.0 195.0,115.0" fill="url(#wallL)"/>
  <polygon points="195.0,268.0 342.2,353.0 342.2,200.0 195.0,115.0" fill="url(#wallR)"/>
  <polygon points="195.0,268.0 342.2,353.0 195.0,438.0 47.8,353.0" fill="url(#floor)"/>
  <g stroke="#D2B596" stroke-width="1" opacity=".55">
    <polyline points="180.3,276.5 327.5,361.5"/><polyline points="165.6,285.0 312.8,370.0"/><polyline points="150.8,293.5 298.1,378.5"/>
    <polyline points="136.1,302.0 283.3,387.0"/><polyline points="121.4,310.5 268.6,395.5"/><polyline points="106.7,319.0 253.9,404.0"/>
    <polyline points="91.9,327.5 239.2,412.5"/><polyline points="77.2,336.0 224.4,421.0"/><polyline points="62.5,344.5 209.7,429.5"/>
  </g>
  <polygon points="195.0,268.0 186.2,273.1 186.2,120.1 195.0,115.0" fill="#000" opacity=".05"/>
  <polygon points="195.0,268.0 203.8,273.1 203.8,120.1 195.0,115.0" fill="#000" opacity=".06"/>
  <polygon points="196.8,269.0 49.5,354.0 49.5,348.1 196.8,263.1" fill="#F6F1FA"/>
  <polygon points="195.0,262.1 196.8,263.1 49.5,348.1 47.8,347.1" fill="#FBF8FD"/>
  <polygon points="193.2,269.0 340.5,354.0 340.5,348.1 193.2,263.1" fill="#EDE5F3"/>
  <polygon points="195.0,262.1 342.2,347.1 340.5,348.1 193.2,263.1" fill="#FBF8FD"/>

  <polygon points="218.3,198.5 253.6,218.9 253.6,181.5 218.3,161.1" fill="#FFF"/>
  <polygon points="221.1,196.9 250.5,213.9 250.5,183.3 221.1,166.3" fill="#F3D6C9"/>
  <polygon points="220.9,196.9 237.1,185.9 250.4,213.9" fill="#E5A99A"/>
  <polygon points="231.1,203.0 242.8,196.2 250.2,208.9 250.2,214.0" fill="#C98A8E"/>

  <polygon points="288.3,254.9 331.0,279.6 331.0,216.7 288.3,192.0" fill="#FBF8FD"/>
  <polygon points="290.4,253.7 328.7,275.8 328.7,218.0 290.4,195.9" fill="url(#sky)"/>
  <circle cx="318.2" cy="${s.orbY}" r="11" fill="${s.orb}" opacity=".2"/><circle cx="318.2" cy="${s.orbY}" r="5.5" fill="${s.orb}"/>
  <g opacity="${show(s.stars)}" fill="#FFF">
    <circle class="twinkle" cx="296.1" cy="206.2" r="1.1"/><circle class="twinkle" style="animation-delay:1.2s" cx="305.0" cy="219.8" r="1.1"/>
    <circle class="twinkle" style="animation-delay:.6s" cx="325.6" cy="232" r="1.1"/><circle class="twinkle" style="animation-delay:1.8s" cx="300.6" cy="227.5" r="1.1"/>
  </g>
  <polygon points="290.3,253.8 296.1,247.0 306.4,257.2 316.8,255.5 328.5,269.1 328.5,275.9" fill="${s.hills}" opacity=".6"/>
  <polygon points="308.4,264.4 310.1,265.4 310.1,207.6 308.4,206.6" fill="#FBF8FD"/>
  <polygon points="290.1,225.8 328.4,247.9 328.4,245.9 290.1,223.8" fill="#FBF8FD"/>
  <polygon points="279.7,260.3 326.8,287.5 326.8,285.1 279.7,257.9" fill="#EDE5F3"/>
  <polygon points="286.3,254.1 333.4,281.3 326.8,285.1 279.7,257.9" fill="#FFF"/>
  <polygon points="276.0,262.9 284.8,268.0 284.8,188.1 276.0,183.0" fill="#F7E4EA"/>
  <polygon points="278.8,264.7 280.5,265.7 280.5,185.8 278.8,184.8" fill="#EFD1DB"/>
  <polygon points="327.5,292.6 336.3,297.8 336.3,217.9 327.5,212.8" fill="#F7E4EA"/>
  <polygon points="330.3,294.4 332.1,295.5 332.1,215.6 330.3,214.5" fill="#EFD1DB"/>
  <polyline points="271.9,180.3 339.6,219.4" fill="none" stroke="#B9A3C9" stroke-width="2" stroke-linecap="round"/>

  <polyline points="200.2,130.4 211.2,140.5 222.2,143.3 233.3,149.0 244.3,159.6 255.4,162.9 266.4,167.6 277.4,178.6 288.5,182.5 299.5,186.2 310.6,197.7 321.6,202.0 332.7,204.7" fill="none" stroke="#8C7FA6" stroke-width="1"/>
  <g opacity="${s.lamp ? 1 : 0.55}">
    <circle class="twinkle" cx="211.2" cy="142.5" r="2.4" fill="#FFE29A"/><circle class="twinkle" style="animation-delay:.3s" cx="222.2" cy="145.3" r="2.4" fill="#FFC9D6"/>
    <circle class="twinkle" style="animation-delay:.7s" cx="233.3" cy="151.0" r="2.4" fill="#C9E6FF"/><circle class="twinkle" style="animation-delay:1s" cx="244.3" cy="161.6" r="2.4" fill="#FFE29A"/>
    <circle class="twinkle" style="animation-delay:1.4s" cx="255.4" cy="164.9" r="2.4" fill="#FFC9D6"/><circle class="twinkle" cx="266.4" cy="169.6" r="2.4" fill="#C9E6FF"/>
    <circle class="twinkle" style="animation-delay:.3s" cx="277.4" cy="180.6" r="2.4" fill="#FFE29A"/><circle class="twinkle" style="animation-delay:.7s" cx="288.5" cy="184.5" r="2.4" fill="#FFC9D6"/>
    <circle class="twinkle" style="animation-delay:1s" cx="299.5" cy="188.2" r="2.4" fill="#C9E6FF"/><circle class="twinkle" style="animation-delay:1.4s" cx="310.6" cy="199.7" r="2.4" fill="#FFE29A"/>
    <circle class="twinkle" cx="321.6" cy="204.0" r="2.4" fill="#FFC9D6"/>
  </g>

  <ellipse cx="180.6" cy="150.9" rx="10" ry="12" fill="#FBF8FD"/><path d="M180.6,150.9 l0,-7 M180.6,150.9 l5,3" stroke="#4A4260" stroke-width="1.6" stroke-linecap="round"/>

  <polygon points="171.7,205.3 115.8,237.6 115.8,193.4 171.7,161.1" fill="#B88D6C"/>
  <polygon points="169.7,204.1 118.1,233.8 118.1,194.7 169.7,165.0" fill="#D9B48F"/>
  <g opacity="${show(notes > 0)}"><polygon points="166.1,190.1 154.4,196.9 154.4,183.3 166.1,176.5" fill="#FBE7A6"/><circle cx="160.4" cy="181.4" r="1.6" fill="#C2556B"/></g>
  <g opacity="${show(notes > 1)}"><polygon points="151.4,191.8 139.6,198.6 139.6,185.0 151.4,178.2" fill="#F7CFD9"/><circle cx="145.7" cy="183.1" r="1.6" fill="#3F6B9A"/></g>
  <g opacity="${show(notes > 2)}"><polygon points="135.2,209.7 123.4,216.5 123.4,202.9 135.2,196.1" fill="#CFE4F5"/><circle cx="129.5" cy="200.9" r="1.6" fill="#C2556B"/></g>
  <g opacity="${show(notes > 3)}"><polygon points="160.3,204.6 148.5,211.4 148.5,197.8 160.3,191.0" fill="#D8EBD9"/><circle cx="154.5" cy="195.8" r="1.6" fill="#3F6B9A"/></g>
  <g opacity="${show(notes > 4)}"><polygon points="141.1,216.5 129.3,223.3 129.3,209.7 141.1,202.9" fill="#FBE7A6"/><circle cx="135.4" cy="207.7" r="1.6" fill="#C2556B"/></g>
  <g opacity="${show(notes > 5)}"><polygon points="151.0,218.0 139.2,224.8 139.2,211.2 151.0,204.4" fill="#F7CFD9"/><circle cx="145.1" cy="209.2" r="1.6" fill="#C2556B"/></g>

  <ellipse cx="192" cy="365" rx="60" ry="35" fill="#F4DCE3"/>
  <ellipse cx="192" cy="365" rx="48" ry="27" fill="#EBC9D4"/>
  <ellipse cx="192" cy="365" rx="36" ry="21" fill="#F4DCE3"/>
  <ellipse cx="192" cy="365" rx="21" ry="12" fill="#EBC9D4"/>

  <polygon points="172.9,280.6 212.7,303.5 147.9,340.9 108.1,318.0" fill="#7E5F4A" opacity=".18"/>
  <polygon points="116.2,316.0 147.2,333.9 147.2,293.1 116.2,275.2" fill="#BF9372"/>
  <polygon points="166.3,322.8 147.2,333.9 147.2,293.1 166.3,282.0" fill="#AD8162"/>
  <polygon points="135.4,264.2 166.3,282.0 147.2,293.1 116.2,275.2" fill="#D3AC8B"/>
  <polygon points="163.5,298.3 150.2,305.9 150.2,294.9 163.5,287.2" fill="#C69A78"/>
  <polygon points="163.5,311.9 150.2,319.5 150.2,308.5 163.5,300.8" fill="#C69A78"/>
  <polygon points="196.0,302.3 198.7,303.8 198.7,263.0 196.0,261.5" fill="#BF9372"/>
  <polygon points="201.3,302.3 198.7,303.8 198.7,263.0 201.3,261.5" fill="#AD8162"/>
  <polygon points="111.1,275.6 147.2,296.5 147.2,292.7 111.1,271.9" fill="#BF9372"/>
  <polygon points="207.5,261.6 147.2,296.5 147.2,292.7 207.5,257.9" fill="#AD8162"/>
  <polygon points="171.4,237.1 207.5,257.9 147.2,292.7 111.1,271.9" fill="#DDB896"/>
  <polygon points="193.5,311.2 217.1,324.8 193.5,338.4 170.0,324.8" fill="#7E5F4A" opacity=".14"/>
  <polygon points="191.8,316.6 193.5,317.6 193.5,293.0 191.8,292.0" fill="#8E7CB8"/>
  <polygon points="195.3,316.6 193.5,317.6 193.5,293.0 195.3,292.0" fill="#8070AA"/>
  <polygon points="191.8,333.6 193.5,334.6 193.5,310.0 191.8,309.0" fill="#8E7CB8"/>
  <polygon points="195.3,333.6 193.5,334.6 193.5,310.0 195.3,309.0" fill="#8070AA"/>
  <polygon points="174.4,300.3 194.3,311.8 194.3,307.0 174.4,295.5" fill="#AE9ED6"/>
  <polygon points="213.4,300.7 194.3,311.8 194.3,307.0 213.4,296.0" fill="#9E8DC9"/>
  <polygon points="193.5,284.5 213.4,296.0 194.3,307.0 174.4,295.5" fill="#C3B5E3"/>
  <polygon points="192.1,305.7 194.7,307.3 194.7,280.1 192.1,278.5" fill="#AE9ED6"/>
  <polygon points="213.8,296.2 194.7,307.3 194.7,280.1 213.8,269.0" fill="#9E8DC9"/>
  <polygon points="211.2,267.5 213.8,269.0 194.7,280.1 192.1,278.5" fill="#C3B5E3"/>
  <polygon points="147.9,260.9 167.0,271.9 167.0,270.7 147.9,259.7" fill="#D5D1DE"/>
  <polygon points="189.1,259.2 167.0,271.9 167.0,270.7 189.1,258.0" fill="#C9C4D4"/>
  <polygon points="170.0,246.9 189.1,258.0 167.0,270.7 147.9,259.7" fill="#E9E6EF"/>
  <polygon points="170.0,246.9 147.9,259.7 145.7,238.7 167.8,225.9" fill="#D5D1DE"/>
  <polygon points="168.8,246.1 149.7,257.1 147.6,239.8 166.7,228.7" fill="${s.lamp ? '#BFD8EE' : '#A9B9CC'}"/>
  <g opacity="${show(pendingTasks > 0)}">
    <polygon points="144.2,275.7 152.3,280.4 152.3,278.4 144.2,273.7" fill="#F2D788"/>
    <polygon points="160.4,275.7 152.3,280.4 152.3,278.4 160.4,273.7" fill="#E9CC7A"/>
    <polygon points="152.3,269.0 160.4,273.7 152.3,278.4 144.2,273.7" fill="#FBE7A6"/>
  </g>
  <g opacity="${show(pendingTasks > 3)}"><polygon points="136.1,271.2 144.2,275.9 136.1,280.6 128.0,275.9" fill="#F7CFD9"/></g>
  <rect x="143.9" y="274.8" width="8" height="8" rx="2" fill="#E9A3B4"/><ellipse cx="147.9" cy="274.8" rx="4" ry="2" fill="#C9788C"/>
  <path d="M146.4,271.8 q2,-4 0,-8 M149.9,271.8 q2,-4 0,-8" fill="none" stroke="#FFF" stroke-opacity=".55" stroke-width="1"/>
  <ellipse cx="131.7" cy="270.2" rx="6" ry="3" fill="#4A4260"/><path d="M131.7,270.2 L131.7,238.2" stroke="#4A4260" stroke-width="2"/>
  <path d="M125.7,238.2 L137.7,238.2 L140.7,247.2 L122.7,247.2 Z" fill="${s.lamp ? '#F6C46B' : '#D9B77A'}"/>
  <circle cx="137.7" cy="262" r="72" fill="url(#lamp)" opacity="${show(s.lamp)}"/>

  <polygon points="277.4,317.1 340.8,353.7 261.3,399.6 197.9,363.0" fill="#7E5F4A" opacity=".18"/>
  <polygon points="276.7,321.1 332.7,353.4 332.7,297.3 276.7,265.0" fill="#B3A0DA"/>
  <polygon points="337.8,350.4 332.7,353.4 332.7,297.3 337.8,294.4" fill="#A28ECE"/>
  <polygon points="281.9,262.0 337.8,294.4 332.7,297.3 276.7,265.0" fill="#C7B6E6"/>
  <polygon points="205.3,362.4 261.3,394.6 261.3,376.8 205.3,344.5" fill="#BF9372"/>
  <polygon points="332.7,353.4 261.3,394.6 261.3,376.8 332.7,335.6" fill="#AD8162"/>
  <polygon points="276.7,303.3 332.7,335.6 261.3,376.8 205.3,344.5" fill="#D3AC8B"/>
  <polygon points="208.3,344.5 261.3,375.1 261.3,362.3 208.3,331.8" fill="#F1ECF6"/>
  <polygon points="330.4,335.1 261.3,375.1 261.3,362.3 330.4,322.4" fill="#E6DFEF"/>
  <polygon points="277.4,291.8 330.4,322.4 261.3,362.3 208.3,331.8" fill="#FFF"/>
  <polygon points="264.9,305.8 285.5,317.7 285.5,310.1 264.9,298.2" fill="#F3EEF8"/>
  <polygon points="301.7,308.4 285.5,317.7 285.5,310.1 301.7,300.7" fill="#EAE3F1"/>
  <polygon points="281.1,288.8 301.7,300.7 285.5,310.1 264.9,298.2" fill="#FFF"/>
  <polygon points="288.5,319.4 309.1,331.3 309.1,323.7 288.5,311.8" fill="#F3EEF8"/>
  <polygon points="325.3,322.0 309.1,331.3 309.1,323.7 325.3,314.3" fill="#EAE3F1"/>
  <polygon points="304.7,302.4 325.3,314.3 309.1,323.7 288.5,311.8" fill="#FFF"/>
  <polygon points="203.8,345.4 261.3,378.5 261.3,363.5 203.8,330.4" fill="#A795D4"/>
  <polygon points="304.7,353.4 261.3,378.5 261.3,363.5 304.7,338.5" fill="#9683C7"/>
  <polygon points="247.3,305.3 304.7,338.5 261.3,363.5 203.8,330.4" fill="#B9A9E0"/>
  <g stroke="#A895D3" stroke-width="1.2" fill="none">
    <polyline points="236.2,311.5 293.6,344.7"/><polyline points="225.2,317.9 282.6,351.0"/><polyline points="214.1,324.3 271.6,357.4"/>
  </g>
  <polygon points="246.5,316.4 259.8,324.1 240.6,335.1 227.4,327.5" fill="#FFFDF8"/>
  <polygon points="259.8,324.1 273.0,331.8 253.9,342.8 240.6,335.1" fill="#FBF6EC"/>
  <polyline points="259.8,323.9 240.6,335.0" fill="none" stroke="#CDBFAE" stroke-width="1"/>
  <g stroke="#DCD3C6" stroke-width=".8" fill="none">
    <polyline points="244.3,320.1 253.2,325.2"/><polyline points="239.9,322.7 248.7,327.8"/><polyline points="235.5,325.2 244.3,330.3"/>
  </g>
  <g opacity="${show(diaryToday)}" stroke="#B89AC9" stroke-width="1" fill="none">
    <polyline points="254.5,328.6 263.3,333.7"/><polyline points="250.1,331.2 258.9,336.3"/>
  </g>
  <ellipse cx="276.0" cy="333.4" rx="13" ry="7.5" fill="#4A4260"/><circle cx="265.0" cy="330.4" r="5.5" fill="#4A4260"/>
  <path d="M260.0,326.4 l2,-5 l2,4 M265.0,325.4 l2,-5 l2,4" fill="#4A4260" stroke="#4A4260" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M270.0,338.4 q8,6 16,0" fill="none" stroke="#4A4260" stroke-width="3" stroke-linecap="round"/>

  <polygon points="97.8,323.9 124.3,339.2 78.7,365.6 52.2,350.3" fill="#7E5F4A" opacity=".18"/>
  <polygon points="116.2,338.1 76.5,361.1 76.5,269.3 116.2,246.3" fill="#9C7458"/>
  <polygon points="94.6,326.0 58.4,346.9 58.4,258.8 94.6,237.9" fill="#8A6550"/>
  <polygon points="116.2,335.9 76.5,358.9 76.5,356.8 116.2,333.9" fill="#AD8162"/>
  <polygon points="94.9,321.6 116.2,333.9 76.5,356.8 55.1,344.5" fill="#D8B493"/>
  ${shelfBooks(books)}
  <polygon points="116.2,246.3 76.5,269.3 76.5,266.9 116.2,243.9" fill="#AD8162"/>
  <polygon points="94.9,231.6 116.2,243.9 76.5,266.9 55.1,254.6" fill="#DDB896"/>
  <polygon points="55.1,348.8 76.5,361.1 76.5,266.9 55.1,254.6" fill="#BF9372"/>
  <path d="M96.4,244.4 l-5,-2 l1,-7 l8,0 l1,7 z" fill="#E0A589"/>
  <path d="M93.4,236.4 c-6,-6 -10,-14 -4,-20 c4,6 6,12 4,20 z M94.4,236.4 c4,-8 10,-12 16,-10 c-4,6 -10,10 -16,10 z" fill="#7FAF8E"/>

  <ellipse cx="115.5" cy="376.1" rx="17" ry="6" fill="#7E5F4A" opacity=".18"/>
  ${plantLeaves(leaves)}
  <path d="M127.5,375.1 l-24,0 l-3,-20 l30,0 z" fill="#E0A589"/>
  <path d="M99.5,353.1 l32,0 l-1,5 l-30,0 z" fill="#C98C72"/>
</svg>`
}

// Each shelf row: [front, side, top] faces for one book. Rows fill up as you add books.
const SHELF_ROWS = [
  [ // bottom shelf
    ['91.4,327.0 106.8,335.9 106.8,319.8 91.4,310.8', '110.3,333.9 106.8,335.9 106.8,319.8 110.3,317.7', '94.9,308.8 110.3,317.7 106.8,319.8 91.4,310.8'],
    ['86.5,329.8 102.0,338.7 102.0,325.1 86.5,316.2', '106.2,336.3 102.0,338.7 102.0,325.1 106.2,322.7', '90.8,313.7 106.2,322.7 102.0,325.1 86.5,316.2'],
    ['80.9,333.0 96.4,341.9 96.4,324.1 80.9,315.2', '101.4,339.1 96.4,341.9 96.4,324.1 101.4,321.2', '85.9,312.3 101.4,321.2 96.4,324.1 80.9,315.2'],
    ['76.8,335.4 92.2,344.3 92.2,332.4 76.8,323.5', '95.8,342.3 92.2,344.3 92.2,332.4 95.8,330.4', '80.3,321.5 95.8,330.4 92.2,332.4 76.8,323.5'],
    ['71.9,338.2 87.4,347.1 87.4,331.8 71.9,322.9', '91.6,344.7 87.4,347.1 87.4,331.8 91.6,329.4', '76.2,320.4 91.6,329.4 87.4,331.8 71.9,322.9'],
    ['66.3,341.4 81.8,350.4 81.8,333.4 66.3,324.4', '86.8,347.5 81.8,350.4 81.8,333.4 86.8,330.5', '71.3,321.6 86.8,330.5 81.8,333.4 66.3,324.4'],
  ],
  [ // middle shelf
    ['91.4,304.9 106.8,313.8 106.8,301.9 91.4,293.0', '110.3,311.8 106.8,313.8 106.8,301.9 110.3,299.9', '94.9,290.9 110.3,299.9 106.8,301.9 91.4,293.0'],
    ['86.5,307.7 102.0,316.6 102.0,301.3 86.5,292.4', '106.2,314.2 102.0,316.6 102.0,301.3 106.2,298.9', '90.8,289.9 106.2,298.9 102.0,301.3 86.5,292.4'],
    ['73.5,315.2 89.0,324.1 89.0,307.1 73.5,298.2', '94.0,321.2 89.0,324.1 89.0,307.1 94.0,304.2', '78.5,295.3 94.0,304.2 89.0,307.1 73.5,298.2'],
    ['69.4,317.6 84.9,326.5 84.9,312.0 69.4,303.1', '88.4,324.4 84.9,326.5 84.9,312.0 88.4,310.0', '73.0,301.1 88.4,310.0 84.9,312.0 69.4,303.1'],
    ['64.6,320.4 80.0,329.3 80.0,313.1 64.6,304.2', '84.3,326.8 80.0,329.3 80.0,313.1 84.3,310.7', '68.8,301.7 84.3,310.7 80.0,313.1 64.6,304.2'],
  ],
  [ // upper shelf
    ['91.4,282.8 106.8,291.7 106.8,277.3 91.4,268.3', '110.3,289.7 106.8,291.7 106.8,277.3 110.3,275.2', '94.9,266.3 110.3,275.2 106.8,277.3 91.4,268.3'],
    ['86.5,285.6 102.0,294.5 102.0,278.4 86.5,269.4', '106.2,292.1 102.0,294.5 102.0,278.4 106.2,275.9', '90.8,267.0 106.2,275.9 102.0,278.4 86.5,269.4'],
    ['80.9,288.8 96.4,297.8 96.4,284.1 80.9,275.2', '101.4,294.9 96.4,297.8 96.4,284.1 101.4,281.3', '85.9,272.3 101.4,281.3 96.4,284.1 80.9,275.2'],
    ['76.8,291.2 92.2,300.1 92.2,282.3 76.8,273.4', '95.8,298.1 92.2,300.1 92.2,282.3 95.8,280.2', '80.3,271.3 95.8,280.2 92.2,282.3 76.8,273.4'],
    ['71.9,294.0 87.4,302.9 87.4,291.0 71.9,282.1', '91.6,300.5 87.4,302.9 87.4,291.0 91.6,288.6', '76.2,279.6 91.6,288.6 87.4,291.0 71.9,282.1'],
    ['66.3,297.2 81.8,306.2 81.8,290.9 66.3,281.9', '86.8,303.3 81.8,306.2 81.8,290.9 86.8,288.0', '71.3,279.1 86.8,288.0 81.8,290.9 66.3,281.9'],
    ['62.2,299.6 77.7,308.5 77.7,291.5 62.2,282.6', '81.2,306.5 77.7,308.5 77.7,291.5 81.2,289.5', '65.7,280.6 81.2,289.5 77.7,291.5 62.2,282.6'],
  ],
  [ // top shelf
    ['90.5,261.2 105.9,270.1 105.9,253.1 90.5,244.2', '110.3,267.6 105.9,270.1 105.9,253.1 110.3,250.6', '94.9,241.6 110.3,250.6 105.9,253.1 90.5,244.2'],
    ['86.1,263.8 101.5,272.7 101.5,258.2 86.1,249.3', '105.3,270.5 101.5,272.7 101.5,258.2 105.3,256.0', '89.9,247.1 105.3,256.0 101.5,258.2 86.1,249.3'],
  ],
]
const BOARDS = [
  ['55.1,324.4 76.5,336.8 76.5,334.7 55.1,322.4', '116.2,313.8 76.5,336.8 76.5,334.7 116.2,311.8', '94.9,299.4 116.2,311.8 76.5,334.7 55.1,322.4'],
  ['55.1,302.3 76.5,314.7 76.5,312.6 55.1,300.3', '116.2,291.7 76.5,314.7 76.5,312.6 116.2,289.7', '94.9,277.4 116.2,289.7 76.5,312.6 55.1,300.3'],
  ['55.1,280.2 76.5,292.6 76.5,290.5 55.1,278.2', '116.2,269.6 76.5,292.6 76.5,290.5 116.2,267.6', '94.9,255.2 116.2,267.6 76.5,290.5 55.1,278.2'],
]
const BOOK_COLORS = [
  ['#8E7CC3', '#7E6CB3', '#A090D0'], ['#E99AAE', '#D9899E', '#F1AFC0'], ['#7DB4A1', '#6DA491', '#8EC4B1'],
  ['#E5C36B', '#D5B35B', '#EDD07F'], ['#7FA3C8', '#6F93B8', '#92B4D6'], ['#D98F72', '#C97F62', '#E5A186'],
  ['#B9A3D6', '#A993C6', '#C7B5E0'], ['#93BFAE', '#83AF9E', '#A3CDBD'],
]

// A cozy shelf always has a few books; your own books are added on top of those.
function shelfBooks(count) {
  const total = Math.min(3 + count, 20)
  let out = ''
  let n = 0
  SHELF_ROWS.forEach((row, r) => {
    row.forEach((faces) => {
      if (n < total) {
        const c = BOOK_COLORS[n % BOOK_COLORS.length]
        out += faces.map((p, i) => `<polygon points="${p}" fill="${c[i]}"/>`).join('')
      }
      n++
    })
    if (BOARDS[r]) {
      const [a, b, top] = BOARDS[r]
      out += `<polygon points="${a}" fill="#BF9372"/><polygon points="${b}" fill="#AD8162"/><polygon points="${top}" fill="#D8B493"/>`
    }
  })
  return out
}

const LEAVES = [
  ['M118.5,351.1 Q109.5,339.1 115.5,327.1 Q121.5,343.1 118.5,351.1 Z', '#5E937A'],
  ['M113.5,349.1 Q95.5,343.1 101.5,337.1 Q107.5,347.1 113.5,349.1 Z', '#7FAF8E'],
  ['M119.5,350.1 Q125.5,342.6 131.5,335.1 Q137.5,346.6 119.5,350.1 Z', '#8DBB9B'],
  ['M111.5,353.1 Q89.5,350.1 95.5,347.1 Q101.5,354.1 111.5,353.1 Z', '#5E937A'],
  ['M121.5,353.1 Q131.5,349.1 137.5,345.1 Q143.5,353.1 121.5,353.1 Z', '#7FAF8E'],
  ['M116.5,345.1 Q115.5,332.1 121.5,319.1 Q127.5,336.1 116.5,345.1 Z', '#8DBB9B'],
  ['M117.5,341.1 Q104.5,328.1 106.5,316.1 Q116.5,328.1 117.5,341.1 Z', '#6FA287'],
  ['M120.5,341.1 Q134.5,330.1 137.5,320.1 Q126.5,330.1 120.5,341.1 Z', '#7DB497'],
]

function plantLeaves(n) {
  return LEAVES.slice(0, Math.max(2, Math.min(n, LEAVES.length)))
    .map(([d, c]) => `<path d="${d}" fill="${c}"/>`).join('')
}
