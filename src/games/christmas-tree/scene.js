import { renderLights } from './lights.js';
import { art } from './catalog.js';

export function topperArt(topper) {
  if (topper === 2) {
    // Plush storybook Santa hat with fluffy scalloped fur cuff & pom-pom
    return `<g transform="translate(200 58)">
      <path d="M-23 9 C-22-18 -4-34 15-26 C26-21 31-8 34 3 C25-7 15-10 13-4 L19 9 Z" fill="#df4656" stroke="#b52f3e" stroke-width="2" stroke-linejoin="round"/>
      <path d="M-12-2 C-9-16 3-24 14-21" fill="none" stroke="#ff8a96" stroke-width="3.5" stroke-linecap="round" opacity=".55"/>
      <!-- Fluffy scalloped fur brim -->
      <path d="M-27 12 Q-27 3 -18 5 Q-10 1 0 5 Q10 1 18 5 Q27 3 27 12 Q27 19 18 18 Q9 21 0 18 Q-9 21 -18 18 Q-27 19 -27 12 Z" fill="#fffaf0" stroke="#e3d5be" stroke-width="1.6"/>
      <!-- Oversized fluffy pom-pom -->
      <g fill="#fffaf0" stroke="#e3d5be" stroke-width="1.4">
        <circle cx="34" cy="4" r="9"/>
        <circle cx="30" cy="0" r="3.5" stroke="none" fill="#ffffff"/>
      </g>
    </g>`;
  }
  if (topper === 1) {
    // Ornate crystalline snowflake topper with frost glow & diamond tips
    return `<g transform="translate(200 52)">
      <circle r="33" fill="#bce8ff" opacity=".28"/>
      <circle r="21" fill="#ffffff" opacity=".22"/>
      <g stroke="#e8f8ff" stroke-width="3.8" stroke-linecap="round" fill="none">
        <path d="M0-26v52M-22.5-13l45 26M-22.5 13l45-26"/>
        <path d="M-7-19l7 6 7-6M-7 19l7-6 7 6M-20-6l6 6-6 6M20-6l-6 6 6 6" stroke-width="2.5"/>
        <path d="M-4-11l4 3 4-3M-4 11l4-3 4 3" stroke-width="2"/>
      </g>
      <polygon points="0,-10 8.5,-5 8.5,5 0,10 -8.5,5 -8.5,-5" fill="#d9f3ff" stroke="#ffffff" stroke-width="1.8"/>
      <circle r="4" fill="#ffffff"/>
      <g fill="#ffffff" opacity=".9">
        <circle cx="0" cy="-26" r="2.8"/><circle cx="0" cy="26" r="2.8"/>
        <circle cx="-22.5" cy="-13" r="2.6"/><circle cx="22.5" cy="13" r="2.6"/>
        <circle cx="-22.5" cy="13" r="2.6"/><circle cx="22.5" cy="-13" r="2.6"/>
        <circle cx="-18" cy="-22" r="1.6"/><circle cx="20" cy="-20" r="1.8"/><circle cx="22" cy="20" r="1.5"/>
      </g>
    </g>`;
  }
  // Multi-faceted glowing golden star topper with warm sparkles
  return `<g transform="translate(200 52)">
    <circle r="34" fill="#ffe694" opacity=".3"/>
    <circle r="22" fill="#fff2bd" opacity=".32"/>
    <rect x="-4" y="13" width="8" height="10" rx="3" fill="#d49a2a"/>
    <path d="M0-29 8.2-10.2 28-8 13 5.5 17.5 25 0 14.8 -17.5 25 -13 5.5 -28-8 -8.2-10.2 Z" fill="#f7c548" stroke="#d99a22" stroke-width="2" stroke-linejoin="round"/>
    <!-- Faceted inner highlight for 3D jewel-like shine -->
    <path d="M0-29 0 0 -8.2-10.2 Z M0-29 8.2-10.2 0 0 Z M28-8 13 5.5 0 0 Z M-28-8 0 0 -13 5.5 Z" fill="#fff3b5" opacity=".7"/>
    <path d="M0 0 17.5 25 0 14.8 Z M0 0 -17.5 25 -13 5.5 Z" fill="#e09e24" opacity=".35"/>
    <circle cx="-21" cy="-21" r="2" fill="#fff8d6"/><circle cx="22" cy="-19" r="1.6" fill="#fff8d6"/><circle cx="24" cy="12" r="1.8" fill="#fff8d6"/>
  </g>`;
}

export function scene(s, selected = null) {
  const palettes = [
    ['#4ca17b', '#2f7558', '#235942'], // Classic
    ['#529182', '#356c63', '#27524d'], // Snowy (richer winter pine so crisp white snow pops!)
    ['#4f95a6', '#327285', '#255869'], // Spruce
  ][s.style];
  const bulbs = renderLights(s.lights);
  const wallTop = s.night ? '#262d47' : '#fff7ea';
  const wallBot = s.night ? '#394263' : '#f3e1ca';
  const winSky = s.night ? '#46587d' : '#a8d6e8';

  return `<svg id="tree-scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" role="group" aria-label="Your Christmas tree">
    <defs>
      <linearGradient id="room-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${wallTop}"/>
        <stop offset="100%" stop-color="${wallBot}"/>
      </linearGradient>
      <linearGradient id="floor-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c9956b"/>
        <stop offset="100%" stop-color="#a8744d"/>
      </linearGradient>
      <linearGradient id="tree-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${palettes[0]}"/>
        <stop offset="55%" stop-color="${palettes[1]}"/>
        <stop offset="100%" stop-color="${palettes[2]}"/>
      </linearGradient>
    </defs>

    <!-- Cozy living room wall -->
    <rect width="400" height="428" fill="url(#room-wall)"/>
    ${s.night ? '<circle cx="200" cy="240" r="155" fill="#ffd97d" opacity=".09"/>' : ''}

    <!-- Frosty winter window -->
    <rect x="26" y="38" width="88" height="114" rx="18" fill="${winSky}" stroke="#e9c89d" stroke-width="8"/>
    <path d="M70 38v114M26 95h88" stroke="#e9c89d" stroke-width="6"/>
    <circle cx="88" cy="64" r="13" fill="#fff0b3"/>
    <g fill="#ffffff" opacity=".8"><circle cx="45" cy="70" r="2.2"/><circle cx="84" cy="118" r="3"/><circle cx="48" cy="130" r="2.2"/><circle cx="96" cy="136" r="2"/></g>
    <rect x="20" y="148" width="100" height="9" rx="4.5" fill="#f3d8b4"/>

    <!-- Warm hardwood floor & baseboard -->
    <rect y="418" width="400" height="10" fill="${s.night ? '#5a4e5e' : '#f2dfc8'}"/>
    <rect y="427" width="400" height="73" fill="url(#floor-wood)"/>
    <path d="M0 449h400M0 475h400" stroke="#dcaf88" stroke-width="1.8" opacity=".6"/>

    <!-- Soft scalloped holiday tree skirt -->
    <ellipse cx="200" cy="444" rx="146" ry="30" fill="#d96b75"/>
    <ellipse cx="200" cy="443" rx="134" ry="25" fill="#f2cbb4"/>
    <ellipse cx="200" cy="441" rx="84" ry="15" fill="#633e24" opacity=".18"/>

    <!-- Warm shaded wooden trunk -->
    <rect x="184" y="364" width="32" height="74" rx="6" fill="#8b5f3f"/>
    <rect x="189" y="366" width="8" height="68" rx="3" fill="#a87854" opacity=".45"/>

    <!-- Lush layered evergreen tree -->
    <path d="M200 68 L135 178 H160 L105 274 H135 L68 398 H332 L265 274 H295 L240 178 H265 Z" fill="url(#tree-grad)" stroke="#ffffff24" stroke-width="2" stroke-linejoin="round"/>
    <!-- Tier underside shadows for 3D branch depth -->
    <path d="M160 178 H240 L248 192 H152 Z M135 274 H265 L275 289 H125 Z" fill="#133329" opacity=".24"/>
    ${
      s.style === 1
        ? `<!-- Snowy: Flocked winter pine with snow-capped peak & bough drifts -->
    <g fill="#f7fcff">
      <path d="M200 68 L174 112 Q184 118 193 111 Q200 119 208 111 Q218 118 226 112 Z"/>
      <path d="M150 153 L134 179 Q146 184 157 177 Q168 184 179 177 Q172 167 160 165 Z"/>
      <path d="M250 153 L266 179 Q254 184 243 177 Q232 184 221 177 Q228 167 240 165 Z"/>
      <path d="M126 238 L104 275 Q118 281 132 273 Q146 280 160 272 Q150 261 136 258 Z"/>
      <path d="M274 238 L296 275 Q282 281 268 273 Q254 280 240 272 Q250 261 264 258 Z"/>
      <path d="M96 346 L67 399 Q84 406 102 397 Q119 405 136 396 Q152 403 166 395 Q148 384 128 384 Q112 374 96 346 Z"/>
      <path d="M304 346 L333 399 Q316 406 298 397 Q281 405 264 396 Q248 403 234 395 Q252 384 272 384 Q288 374 304 346 Z"/>
      <path d="M170 395 Q185 386 200 393 Q215 386 230 395 Q215 404 200 400 Q185 404 170 395 Z"/>
      <!-- Soft scalloped snow puffs on inner boughs -->
      <path d="M172 150 Q180 142 190 148 Q197 144 203 150 Q192 155 182 153 Z" opacity=".88"/>
      <path d="M210 146 Q218 139 227 145 Q232 143 236 148 Q224 152 214 150 Z" opacity=".84"/>
      <path d="M154 232 Q165 223 177 230 Q185 225 192 232 Q178 238 164 236 Z" opacity=".86"/>
      <path d="M214 236 Q226 227 238 234 Q246 229 253 236 Q239 242 224 240 Z" opacity=".86"/>
      <path d="M138 336 Q150 326 164 334 Q173 329 182 336 Q166 343 150 341 Z" opacity=".85"/>
      <path d="M220 332 Q232 323 246 330 Q256 326 264 333 Q248 340 232 338 Z" opacity=".85"/>
    </g>
    <g fill="#d5eefc" opacity=".55">
      <ellipse cx="150" cy="178" rx="12" ry="2.2"/>
      <ellipse cx="250" cy="178" rx="12" ry="2.2"/>
      <ellipse cx="126" cy="274" rx="16" ry="2.5"/>
      <ellipse cx="274" cy="274" rx="16" ry="2.5"/>
      <ellipse cx="100" cy="398" rx="22" ry="3"/>
      <ellipse cx="300" cy="398" rx="22" ry="3"/>
    </g>`
        : s.style === 2
          ? `<!-- Blue Spruce: Layered silvery-blue frosted boughs & delicate needle highlights -->
    <g fill="#8fd0dc" opacity=".48">
      <path d="M200 72 L176 116 Q188 122 200 114 Q212 122 224 116 Z"/>
      <path d="M154 150 L135 178 Q150 184 166 176 Q182 183 196 175 Q176 164 154 150 Z"/>
      <path d="M246 150 L265 178 Q250 184 234 176 Q218 183 204 175 Q224 164 246 150 Z"/>
      <path d="M128 236 L105 274 Q124 281 144 272 Q164 280 184 271 Q156 258 128 236 Z"/>
      <path d="M272 236 L295 274 Q276 281 256 272 Q236 280 216 271 Q244 258 272 236 Z"/>
      <path d="M98 344 L68 398 Q92 406 118 395 Q144 405 170 394 Q134 378 98 344 Z"/>
      <path d="M302 344 L332 398 Q308 406 282 395 Q256 405 230 394 Q266 378 302 344 Z"/>
    </g>
    <g fill="none" stroke="#c7eff5" stroke-opacity=".55" stroke-width="3.2" stroke-linecap="round">
      <path d="M188 106 Q198 112 208 106 M168 144 Q182 151 195 144 M206 148 Q220 155 234 148"/>
      <path d="M148 224 Q165 233 182 224 M218 228 Q235 237 252 228 M182 252 Q200 260 218 252"/>
      <path d="M124 326 Q146 336 168 326 M232 330 Q254 340 276 330 M176 356 Q200 366 224 356"/>
    </g>
    <!-- Delicate winter berry & frosted spruce accents -->
    <g fill="#d6f5fa" opacity=".7">
      <circle cx="152" cy="176" r="2.6"/><circle cx="248" cy="176" r="2.6"/>
      <circle cx="128" cy="272" r="2.8"/><circle cx="272" cy="272" r="2.8"/>
      <circle cx="102" cy="395" r="3"/><circle cx="298" cy="395" r="3"/>
    </g>`
          : `<!-- Classic Balsam Fir: Lush sunlit emerald boughs, scalloped branch tips & cozy pinecones -->
    <g fill="#65bd91" opacity=".46">
      <path d="M200 72 L175 116 Q187 122 200 114 Q213 122 225 116 Z"/>
      <path d="M154 150 L135 178 Q150 185 166 176 Q182 183 196 175 Q176 164 154 150 Z"/>
      <path d="M246 150 L265 178 Q250 185 234 176 Q218 183 204 175 Q224 164 246 150 Z"/>
      <path d="M128 236 L105 274 Q124 282 144 272 Q164 280 184 271 Q156 258 128 236 Z"/>
      <path d="M272 236 L295 274 Q276 282 256 272 Q236 280 216 271 Q244 258 272 236 Z"/>
      <path d="M98 344 L68 398 Q92 406 118 395 Q144 405 170 394 Q134 378 98 344 Z"/>
      <path d="M302 344 L332 398 Q308 406 282 395 Q256 405 230 394 Q266 378 302 344 Z"/>
    </g>
    <g fill="none" stroke="#98ddb6" stroke-opacity=".42" stroke-width="3.2" stroke-linecap="round">
      <path d="M188 106 Q198 112 208 106 M166 146 Q182 153 196 146 M206 150 Q220 157 234 150"/>
      <path d="M146 226 Q165 235 184 226 M216 230 Q235 239 254 230 M180 254 Q200 262 220 254"/>
      <path d="M122 328 Q145 338 168 328 M232 332 Q255 342 278 332 M174 358 Q200 368 226 358"/>
    </g>
    <!-- Little warm woodland pinecones nestled on the branches -->
    <g fill="#9e6d43" stroke="#7a4f2c" stroke-width="1">
      <ellipse cx="164" cy="176" rx="4.2" ry="6" transform="rotate(-12 164 176)"/>
      <ellipse cx="236" cy="271" rx="4.5" ry="6.2" transform="rotate(14 236 271)"/>
      <ellipse cx="136" cy="392" rx="4.5" ry="6.5" transform="rotate(-10 136 392)"/>
      <ellipse cx="266" cy="392" rx="4.5" ry="6.5" transform="rotate(10 266 392)"/>
    </g>`
    }

    <!-- Golden draped garland -->
    <path d="M160 174 Q200 206 240 174 M136 268 Q200 302 264 268 M104 368 Q200 404 296 368" fill="none" stroke="#f0c969" stroke-width="4" stroke-linecap="round"/>
    <path d="M160 174 Q200 206 240 174 M136 268 Q200 302 264 268 M104 368 Q200 404 296 368" fill="none" stroke="#fff4c4" stroke-width="2" stroke-dasharray="1 10" stroke-linecap="round"/>

    ${bulbs}
    ${topperArt(s.topper)}
    ${s.items
      .map(
        (i) =>
          `<g data-item="${i.id}" transform="translate(${i.x * 400} ${i.y * 500})" role="button" tabindex="0" aria-label="Select decoration" style="cursor:grab">${
            i.id === selected
              ? '<circle r="26" fill="#ffffff44" stroke="#ffffff" stroke-width="3" stroke-dasharray="5 3"/>'
              : ''
          }<circle r="24" fill="transparent"/>${art(i.type)}</g>`,
      )
      .join('')}
  </svg>`;
}
