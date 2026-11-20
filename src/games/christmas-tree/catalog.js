const balls = ['Red', 'Blue', 'Green', 'Gold', 'Purple', 'Pink', 'Striped', 'Polka-dot'];

export const catalog = [
  ...balls.map((name, i) => ({
    id: `ball${i}`,
    name: `${name} ball`,
    color: ['#e84a5f', '#4e94e4', '#5dc983', '#f2c14e', '#a56de2', '#f287b7', '#ef6f5b', '#5db7d4'][i],
    kind: 'ornament',
  })),
  ...[
    'Candy cane',
    'Snowflake',
    'Gingerbread person',
    'Bell',
    'Bow',
    'Stocking',
    'Little reindeer',
    'Snowman',
    'Heart',
    'Wrapped candy',
    'Toy train',
    'Tiny present',
  ].map((name, i) => ({
    id: `toy${i}`,
    name,
    kind: 'ornament',
  })),
  ...['Rose gift', 'Tall blue gift', 'Little gold gift'].map((name, i) => ({
    id: `gift${i}`,
    name,
    kind: 'present',
    color: ['#ea7d99', '#619fd4', '#eab951'][i],
  })),
];

export const byId = Object.fromEntries(catalog.map((x) => [x.id, x]));

export function art(id) {
  const d = byId[id];
  if (d.kind === 'present') {
    const scale = id === 'gift1' ? '.86 1.18' : id === 'gift2' ? '.74' : '1';
    const ribbon = id === 'gift2' ? '#d95763' : '#fff4d4';
    return `<g transform="scale(${scale})">
      <ellipse cx="0" cy="18" rx="22" ry="4.5" fill="#4f3319" opacity=".24"/>
      <rect x="-20" y="-15" width="40" height="32" rx="5" fill="${d.color}" stroke="#00000018" stroke-width="1.5"/>
      <rect x="-22" y="-19" width="44" height="8" rx="3.5" fill="${d.color}" stroke="#ffffff40" stroke-width="1.2"/>
      <rect x="-4" y="-19" width="8" height="36" fill="${ribbon}"/>
      <rect x="-20" y="-4" width="40" height="6" fill="${ribbon}"/>
      <path d="M0-19c-13-14-20-3-9 0m9 0c13-14 20-3 9 0" fill="none" stroke="${ribbon}" stroke-width="4" stroke-linecap="round"/>
      <circle cy="-18" r="3.5" fill="${ribbon}"/>
    </g>`;
  }

  switch (id) {
    case 'toy0': // Candy cane
      return `<g>
        <path d="M7 20v-28q0-16-14-14-10 2-8 12" fill="none" stroke="#fff9ee" stroke-width="10" stroke-linecap="round"/>
        <path d="M7 20v-28q0-16-14-14-10 2-8 12" fill="none" stroke="#e84a5f" stroke-width="10" stroke-dasharray="6 8" stroke-linecap="round"/>
        <path d="M4 17v-24" stroke="#ffffff" stroke-opacity=".5" stroke-width="2.5" stroke-linecap="round"/>
      </g>`;
    case 'toy1': // Snowflake
      return `<g stroke="#e6f7ff" stroke-width="3.2" stroke-linecap="round" fill="none">
        <path d="M0-19v38M-16.5-9.5l33 19M-16.5 9.5l33-19"/>
        <path d="M-5-14l5 4 5-4M-5 14l5-4 5 4M-15-4l4 4-4 4M15-4l-4 4 4 4" stroke-width="2.2"/>
        <circle r="4.5" fill="#ffffff" stroke="none"/>
      </g>`;
    case 'toy2': // Gingerbread person
      return `<g>
        <path d="M0-22a9 9 0 1 1 0 18 9 9 0 1 1 0-18Z" fill="#c6864c" stroke="#f8e3b8" stroke-width="2"/>
        <path d="M-8-4q-17-6-15 3l14 7-6 14q1 7 8 3l7-10 7 10q7 4 8-3l-6-14 14-7q2-9-15-3Z" fill="#c6864c" stroke="#f8e3b8" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="-3" cy="-14" r="1.5" fill="#3a281d"/><circle cx="3" cy="-14" r="1.5" fill="#3a281d"/>
        <path d="M-3-10q3 3 6 0" fill="none" stroke="#fff6e5" stroke-width="1.6" stroke-linecap="round"/>
        <circle cy="1" r="2.2" fill="#e84a5f"/><circle cy="7" r="2.2" fill="#5dc983"/>
      </g>`;
    case 'toy3': // Golden jingle bell
      return `<g>
        <circle cy="-19" r="3.5" fill="none" stroke="#d9a136" stroke-width="2.5"/>
        <path d="M0-16c-10 0-14 8-15 19l-4 7h38l-4-7c-1-11-5-19-15-19Z" fill="#f5c654" stroke="#d49a2a" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-8-8c-2 5-3 10-3 14" fill="none" stroke="#fff5cc" stroke-width="3" stroke-linecap="round" opacity=".8"/>
        <circle cy="13" r="4.5" fill="#d99b26"/>
        <path d="M-5-14c-6-5-10 0-4 3m9-3c6-5 10 0 4 3" fill="#e84a5f"/>
      </g>`;
    case 'toy4': // Satin red bow
      return `<g>
        <path d="M-3 2l-11 17 7-2 5-13m2-2l11 17-7-2-5-13" fill="#d93d52"/>
        <path d="M-2-2c-16-14-24 2-14 10 6 4 12 0 14-5Zm4 0c16-14 24 2 14 10-6 4-12 0-14-5Z" fill="#ef5369" stroke="#c73247" stroke-width="1.5"/>
        <rect x="-5" y="-5" width="10" height="10" rx="4" fill="#ff7a8d" stroke="#c73247" stroke-width="1.5"/>
      </g>`;
    case 'toy5': // Cozy stocking
      return `<g>
        <path d="M-8-14h17v21c0 7-5 13-13 13h-7c-6 0-9-5-7-10 2-4 6-5 10-5v-19Z" fill="#e84a5f" stroke="#c73247" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="-11" cy="14" r="5.5" fill="#fff6e5" opacity=".45"/>
        <rect x="-11" y="-19" width="23" height="9" rx="4" fill="#fff8eb" stroke="#e0d2ba" stroke-width="1.5"/>
      </g>`;
    case 'toy6': // Little reindeer
      return `<g>
        <path d="M-8-12l-6-10m3 5l-5-1m18 6l6-10m-3 5l5-1" stroke="#855a36" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="-12" cy="-7" rx="5" ry="3" transform="rotate(-25 -12 -7)" fill="#b87e4b"/>
        <ellipse cx="12" cy="-7" rx="5" ry="3" transform="rotate(25 12 -7)" fill="#b87e4b"/>
        <circle cy="1" r="14" fill="#b87e4b"/>
        <ellipse cy="6" rx="8.5" ry="6" fill="#ebd0b0"/>
        <circle cx="-5" cy="-2" r="2" fill="#2c1f16"/><circle cx="5" cy="-2" r="2" fill="#2c1f16"/>
        <circle cy="3.5" r="4" fill="#e84a5f"/><circle cx="-1.2" cy="2.2" r="1.2" fill="#ff9ca8"/>
      </g>`;
    case 'toy7': // Smiling snowman
      return `<g>
        <circle cy="8" r="12" fill="#ffffff" stroke="#d4e6f2" stroke-width="1.5"/>
        <circle cy="-7" r="9" fill="#ffffff" stroke="#d4e6f2" stroke-width="1.5"/>
        <rect x="-9" y="-1" width="18" height="4.5" rx="2.2" fill="#e84a5f"/>
        <circle cx="-3" cy="-9" r="1.5" fill="#2c3e4c"/><circle cx="3" cy="-9" r="1.5" fill="#2c3e4c"/>
        <path d="M0-7l7 1.5-7 1.5Z" fill="#f28c38"/>
        <rect x="-9" y="-17" width="18" height="3" rx="1.5" fill="#3a556a"/>
        <rect x="-6" y="-23" width="12" height="7" rx="2" fill="#3a556a"/>
      </g>`;
    case 'toy8': // Glossy heart
      return `<g>
        <path d="M0 17C-18 6-21-9-11-16c5-3 10-1 11 4 1-5 6-7 11-4 10 7 7 22-11 33Z" fill="#ef5b78" stroke="#cc3b58" stroke-width="1.8"/>
        <path d="M-11-9c-3 3-3 8 0 11" fill="none" stroke="#ffc2cf" stroke-width="3.2" stroke-linecap="round"/>
      </g>`;
    case 'toy9': // Wrapped peppermint candy
      return `<g transform="rotate(-18)">
        <path d="M-13 0l-9-8v16Zm26 0l9-8v16Z" fill="#68b99e"/>
        <circle r="13" fill="#fff9ee" stroke="#e84a5f" stroke-width="2.5"/>
        <path d="M0-11v22M-11 0h22M-8-8l16 16M-8 8l16-16" stroke="#e84a5f" stroke-width="2.5" stroke-linecap="round"/>
        <circle r="4.5" fill="#fff9ee"/>
      </g>`;
    case 'toy10': // Toy train
      return `<g>
        <rect x="-18" y="-4" width="35" height="15" rx="4" fill="#4e94e4"/>
        <rect x="2" y="-16" width="15" height="14" rx="3" fill="#e84a5f"/>
        <rect x="5" y="-13" width="9" height="7" rx="1.5" fill="#dff3ff"/>
        <rect x="-15" y="-14" width="7" height="11" rx="2" fill="#f2c14e"/>
        <circle cx="-11" cy="13" r="5" fill="#3a4c5e" stroke="#f2c14e" stroke-width="2"/>
        <circle cx="9" cy="13" r="6" fill="#3a4c5e" stroke="#f2c14e" stroke-width="2"/>
      </g>`;
    case 'toy11': // Tiny present ornament
      return `<g>
        <rect x="-13" y="-11" width="26" height="23" rx="4" fill="#a56de2"/>
        <rect x="-3" y="-11" width="6" height="23" fill="#ffd97d"/>
        <rect x="-13" y="-2" width="26" height="5" fill="#ffd97d"/>
        <path d="M0-11c-9-9-13-1-6 0m6 0c9-9 13-1 6 0" fill="none" stroke="#ffd97d" stroke-width="3" stroke-linecap="round"/>
      </g>`;
    default: // Glossy glass bauble (ball0 - ball7)
      return `<g>
        <circle cy="-22" r="3" fill="none" stroke="#e6c478" stroke-width="2"/>
        <rect x="-4.5" y="-21" width="9" height="6.5" rx="2" fill="#e6c478"/>
        <circle r="16.5" fill="${d.color}" stroke="#00000018" stroke-width="1.5"/>
        ${
          id === 'ball6'
            ? '<path d="M-13-7h26M-15 2h30M-12 10h24" stroke="#fff6e0" stroke-width="3.6" stroke-linecap="round"/>'
            : id === 'ball7'
              ? '<g fill="#fff8e8"><circle cx="-7" cy="-6" r="2.8"/><circle cx="7" cy="-5" r="2.5"/><circle cx="0" cy="3" r="3"/><circle cx="-7" cy="9" r="2.5"/><circle cx="8" cy="8" r="2.6"/></g>'
              : ''
        }
        <path d="M-9-8a11 11 0 0 1 7-4" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>
        <circle cx="-10" cy="-2" r="2" fill="#ffffff" opacity=".55"/>
      </g>`;
  }
}
