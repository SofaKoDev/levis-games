// Storybook-shaded fruit vectors (shared by tray, drop animations, and blender pieces)
// plus glossy pastel-mint blender & smiling serving cup over the illustrated kitchen backdrop.
const fruitDefs = `
  <radialGradient id="sb-body" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#ff8da6"/><stop offset="55%" stop-color="#ec5272"/><stop offset="100%" stop-color="#c43356"/></radialGradient>
  <linearGradient id="sb-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7bc47f"/><stop offset="100%" stop-color="#488753"/></linearGradient>
  <linearGradient id="bn-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffe985"/><stop offset="55%" stop-color="#f6cc4d"/><stop offset="100%" stop-color="#dca229"/></linearGradient>
  <radialGradient id="bb-a" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#a8aef2"/><stop offset="55%" stop-color="#6b72c4"/><stop offset="100%" stop-color="#454b96"/></radialGradient>
  <radialGradient id="bb-b" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#969ce8"/><stop offset="55%" stop-color="#585fb4"/><stop offset="100%" stop-color="#383e82"/></radialGradient>
  <radialGradient id="mg-body" cx="35%" cy="28%" r="75%"><stop offset="0%" stop-color="#ffd96e"/><stop offset="52%" stop-color="#f59e3d"/><stop offset="100%" stop-color="#de5f47"/></radialGradient>
  <radialGradient id="gr-ball" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#d5aef0"/><stop offset="55%" stop-color="#9864bf"/><stop offset="100%" stop-color="#6b3d91"/></radialGradient>
  <radialGradient id="kw-flesh" cx="45%" cy="45%" r="55%"><stop offset="0%" stop-color="#f2f2bf"/><stop offset="32%" stop-color="#cce578"/><stop offset="85%" stop-color="#87b849"/><stop offset="100%" stop-color="#6b9637"/></radialGradient>
`;

const shapes = {
  strawberry: `<path d="M30 18C17 6 8 20 11 33c3 13 13 21 19 24 6-3 16-11 19-24 3-13-6-27-19-15Z" fill="url(#sb-body)"/><path d="M18 24c-2 6-1 13 3 18" fill="none" stroke="#ffb8c8" stroke-width="3.5" stroke-linecap="round" opacity=".65"/><path d="M30 18 16 11l11 1 3-9 3 9 11-1-14 7 6 4-6-1-6 1Z" fill="url(#sb-leaf)"/><g fill="#fff1b8"><circle cx="21" cy="28" r="1.8"/><circle cx="30" cy="27" r="1.8"/><circle cx="39" cy="28" r="1.8"/><circle cx="25" cy="38" r="1.8"/><circle cx="35" cy="38" r="1.8"/><circle cx="30" cy="47" r="1.6"/></g>`,
  banana: `<path d="M45 9c5 19-6 36-31 35l-6-6c4 22 28 21 41 6 10-12 9-27 2-36Z" fill="url(#bn-body)"/><path d="M16 42c19 7 32-7 32-27" fill="none" stroke="#fff4bd" stroke-width="4.5" stroke-linecap="round" opacity=".8"/><path d="M45 9l5-2m-42 30 3 4" stroke="#8b6239" stroke-width="4.5" stroke-linecap="round"/>`,
  blueberry: `<path d="M32 14c5-8 14-9 18-3-4 6-12 7-18 3Z" fill="#63a86b"/><circle cx="21" cy="36" r="15" fill="url(#bb-a)"/><circle cx="40" cy="37" r="14.5" fill="url(#bb-b)"/><circle cx="30" cy="22" r="14" fill="url(#bb-a)"/><path d="M29 12l2.5 4 4.5-.5-3 3.5 1.5 4-4.5-1.5-3.5 2.5.8-4.5-3-2.5 4.2-.8Z" fill="#3e4484"/><circle cx="15" cy="31" r="3.4" fill="#dfe2ff" opacity=".75"/><circle cx="25" cy="17" r="3.1" fill="#dfe2ff" opacity=".75"/>`,
  mango: `<path d="M39 9C14 5 8 27 10 39c2 12 13 17 24 16 14-1 22-14 21-28-1-10-7-16-16-18Z" fill="url(#mg-body)"/><path d="M36 16c-12 0-19 10-19 21" fill="none" stroke="#ffeb9e" stroke-width="5" stroke-linecap="round" opacity=".75"/><path d="M38 9c-3-8 10-8 13-1-5 6-10 5-13 1Z" fill="#5da069"/>`,
  grape: `<path d="M29 14c0-9 6-10 8-9m-4 6c10-9 19-4 17 4-6 5-13 2-17-4Z" fill="#6ab072" stroke="#4d8a57" stroke-width="2.2" stroke-linecap="round"/><g fill="url(#gr-ball)"><circle cx="20" cy="23" r="9.5"/><circle cx="37" cy="23" r="9.5"/><circle cx="16" cy="36" r="9"/><circle cx="30" cy="34" r="9.5"/><circle cx="42" cy="36" r="8.5"/><circle cx="23" cy="46" r="8.5"/><circle cx="35" cy="46" r="8.5"/><circle cx="29" cy="52" r="7.5"/></g><g fill="#f0d9ff" opacity=".65"><circle cx="17" cy="20" r="2.4"/><circle cx="34" cy="20" r="2.4"/><circle cx="27" cy="31" r="2.3"/></g>`,
  kiwi: `<circle cx="30" cy="30" r="26" fill="#9c7c52"/><circle cx="30" cy="30" r="22.5" fill="url(#kw-flesh)"/><ellipse cx="30" cy="30" rx="8.5" ry="9.5" fill="#f7f5cf"/><g stroke="#3a4c32" stroke-width="2.6" stroke-linecap="round"><path d="m30 15 0 4m11 2-3 3m8 6-4 0m-1 10-3-3m-8 8 0-4m-11-1 3-3m-8-7 4 0m1-10 3 3"/></g><path d="M15 21c3-6 10-9 17-9" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".45"/>`,
};

export const fruitArt = (id) =>
  `<svg viewBox="0 0 60 62" aria-hidden="true">${shapes[id]}</svg>`;
export const fruitShape = (id) => shapes[id];

export const kitchenArt = `<svg class="kitchen-art" viewBox="0 0 360 268" role="img" aria-label="An empty blender on a wooden kitchen counter">
  <defs>
    ${fruitDefs}
    <clipPath id="jar-clip"><path d="M120 44h120l-11 140q-1 11-12 11h-74q-11 0-12-11Z"/></clipPath>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity=".86"/>
      <stop offset="30%" stop-color="#f2fbff" stop-opacity=".42"/>
      <stop offset="78%" stop-color="#e4f4f8" stop-opacity=".28"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity=".78"/>
    </linearGradient>
    <linearGradient id="mint-lid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8fd1bd"/>
      <stop offset="100%" stop-color="#5a9f8c"/>
    </linearGradient>
    <linearGradient id="blender-base" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a8dfd0"/>
      <stop offset="35%" stop-color="#c8eee3"/>
      <stop offset="75%" stop-color="#8ac7b7"/>
      <stop offset="100%" stop-color="#6da999"/>
    </linearGradient>
    <linearGradient id="base-foot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff8ea"/>
      <stop offset="100%" stop-color="#e8d8be"/>
    </linearGradient>
    <filter id="soft-shadow" x="-15%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#5d422a" flood-opacity=".24"/>
    </filter>
  </defs>

  <g id="blender-machine">
    <g transform="translate(180 220) scale(0.84) translate(-180 -249)">
      <ellipse cx="180" cy="249" rx="76" ry="11" fill="#4f3319" opacity=".28"/>
      <ellipse cx="180" cy="249" rx="64" ry="6" fill="#3d240f" opacity=".32"/>
      <g filter="url(#soft-shadow)">
        <path d="M242 64h14q22 0 17 31t-33 27" fill="none" stroke="#7ab8a7" stroke-width="10" stroke-linecap="round"/>
        <path d="M243 64h12q19 0 15 28" fill="none" stroke="#b6e2d5" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M120 44h120l-11 140q-1 11-12 11h-74q-11 0-12-11Z" fill="url(#glass)" stroke="#88bcae" stroke-width="3.5"/>
        <g clip-path="url(#jar-clip)">
          <rect id="smoothie-liquid" x="118" y="195" width="125" height="160" fill="#f4d475"/>
          <g id="fruit-pieces"></g>
          <g id="swirl-lines" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="3.5" stroke-linecap="round">
            <ellipse cx="180" cy="133" rx="38" ry="8"/>
            <ellipse cx="180" cy="156" rx="30" ry="6.5"/>
            <ellipse cx="180" cy="176" rx="19" ry="4"/>
          </g>
        </g>
        <path d="M132 58 140 162" stroke="#ffffff" stroke-opacity=".82" stroke-width="7" stroke-linecap="round"/>
        <path d="M143 64 147 110" stroke="#ffffff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>
        <path d="M214 74h14m-15 24h13m-14 24h12" stroke="#6f9e92" stroke-opacity=".65" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="110" y="30" width="140" height="17" rx="8.5" fill="url(#mint-lid)"/>
        <rect x="122" y="33" width="54" height="4" rx="2" fill="#bfe8dc" opacity=".7"/>
        <rect x="157" y="19" width="46" height="13" rx="6.5" fill="url(#mint-lid)"/>
        <path d="M134 195h92l16 44H118Z" fill="url(#blender-base)"/>
        <rect x="114" y="233" width="132" height="16" rx="8" fill="url(#base-foot)"/>
        <circle cx="180" cy="217" r="14" fill="#fffaf0" stroke="#7ab3a3" stroke-width="2.5"/>
        <path d="m176.5 210.5 9.5 6.5-9.5 6.5Z" fill="#e9796b"/>
      </g>
    </g>
  </g>

  <g id="smoothie-cup">
    <g transform="translate(290 218) scale(0.88) translate(-304 -230)">
      <ellipse cx="304" cy="231" rx="32" ry="7" fill="#4f3319" opacity=".28"/>
      <ellipse cx="304" cy="231" rx="24" ry="4" fill="#3d240f" opacity=".32"/>
      <g filter="url(#soft-shadow)">
        <path d="m309 170 11-57" stroke="#f27d8b" stroke-width="7.5" stroke-linecap="round"/>
        <path d="m309 170 11-57" stroke="#fff4f5" stroke-width="7.5" stroke-dasharray="6 8" stroke-linecap="round"/>
        <path d="m268 142 10 88h52l10-88Z" fill="#fffaf2" stroke="#c89b7e" stroke-width="3" stroke-linejoin="round"/>
        <path id="cup-liquid" d="m273 157 8 68h46l8-68Z" fill="#f4d475"/>
        <ellipse cx="304" cy="142" rx="36" ry="7.5" fill="#fffaf2" stroke="#c89b7e" stroke-width="3"/>
        <path d="m283 170 3.5 42" stroke="#ffffff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>
        <circle cx="296" cy="190" r="2.8" fill="#5d4339"/>
        <circle cx="312" cy="190" r="2.8" fill="#5d4339"/>
        <circle cx="290" cy="195" r="3.2" fill="#f598a4" opacity=".55"/>
        <circle cx="318" cy="195" r="3.2" fill="#f598a4" opacity=".55"/>
        <path d="M299 197q5 5.5 10 0" fill="none" stroke="#5d4339" stroke-width="2.4" stroke-linecap="round"/>
      </g>
    </g>
  </g>

  <path id="pour-stream" d="M220 98q70 4 70 42" fill="none" stroke="#f4d475" stroke-width="10" stroke-linecap="round"/>
</svg>`;
