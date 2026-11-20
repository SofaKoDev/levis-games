import './styles.css';
import { games, gameUrl } from './gameRegistry.js';
import { illustrations } from './illustrations.js';

const starMark = `<svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
  <g fill="currentColor" transform="translate(32 32)">
    <rect x="-4" y="-22" width="8" height="44" rx="4"/>
    <rect x="-4" y="-22" width="8" height="44" rx="4" transform="rotate(60)"/>
    <rect x="-4" y="-22" width="8" height="44" rx="4" transform="rotate(120)"/>
    <circle r="9" fill="#ffe28a"/>
    <circle r="4.5"/>
  </g>
</svg>`;

const titleSwoop = `<svg class="title-swoop" viewBox="0 0 180 18" aria-hidden="true">
  <path d="M8 12 Q90 2 172 11" fill="none" stroke="#f5c65c" stroke-width="6" stroke-linecap="round"/>
</svg>`;

const backdropArt = `<div class="home-backdrop" aria-hidden="true">
  <svg class="cloud cloud-left" viewBox="0 0 180 90">
    <path d="M26 70 Q10 70 10 54 Q10 38 28 36 Q36 14 64 14 Q92 14 102 32 Q112 24 128 28 Q146 32 148 48 Q166 50 166 64 Q166 76 148 76 H30 Q26 76 26 70 Z" fill="#ffffff"/>
  </svg>
  <svg class="cloud cloud-right" viewBox="0 0 180 90">
    <path d="M24 72 Q12 72 12 58 Q12 44 30 42 Q40 20 70 20 Q96 20 108 36 Q124 28 142 38 Q164 42 164 58 Q164 72 146 72 Z" fill="#ffffff"/>
  </svg>
  <svg class="sparkle sp-1" viewBox="0 0 28 28"><path d="M14 2 L16.8 11.2 L26 14 L16.8 16.8 L14 26 L11.2 16.8 L2 14 L11.2 11.2 Z" fill="#f5c65c"/></svg>
  <svg class="sparkle sp-2" viewBox="0 0 28 28"><path d="M14 2 L16.8 11.2 L26 14 L16.8 16.8 L14 26 L11.2 16.8 L2 14 L11.2 11.2 Z" fill="#82c9ad"/></svg>
  <svg class="sparkle sp-3" viewBox="0 0 28 28"><path d="M14 2 L16.8 11.2 L26 14 L16.8 16.8 L14 26 L11.2 16.8 L2 14 L11.2 11.2 Z" fill="#f29b8f"/></svg>
  <svg class="sparkle sp-4" viewBox="0 0 28 28"><path d="M14 2 L16.8 11.2 L26 14 L16.8 16.8 L14 26 L11.2 16.8 L2 14 L11.2 11.2 Z" fill="#7bb8e8"/></svg>
  <svg class="meadow" viewBox="0 0 1440 160" preserveAspectRatio="none">
    <path d="M0 90 Q320 20 680 78 T1440 58 V160 H0 Z" fill="#dcefe2"/>
    <path d="M0 118 Q420 58 860 112 T1440 94 V160 H0 Z" fill="#cce5d4"/>
  </svg>
</div>`;

document.querySelector('#app').innerHTML = `
  ${backdropArt}
  <main class="games-home">
    <header class="welcome">
      <div class="sun" aria-hidden="true">${starMark}</div>
      <p class="welcome-kicker"><span aria-hidden="true">✦</span> A LITTLE WORLD OF WONDER <span aria-hidden="true">✦</span></p>
      <h1>Levi's <span class="title-accent">Games${titleSwoop}</span></h1>
      <p class="tagline">Little games. Big imagination.</p>
    </header>
    <section class="game-grid" aria-label="Choose a game">
      ${games
        .map(
          (game, index) => `
        <a class="game-card ${game.accent} ${game.id}" href="${gameUrl(game.id)}" aria-label="${game.label}">
          <div class="card-art">
            <img src="${illustrations[game.art]}" alt="" width="800" height="597" ${index < 2 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
          </div>
          <div class="card-copy">
            <h2>${game.title}</h2>
            <p>${game.description}</p>
            <span class="play-pill"><span>Let's play</span><span class="play-arrow" aria-hidden="true">→</span></span>
          </div>
        </a>`,
        )
        .join('')}
    </section>
    <footer class="home-footer">
      <span aria-hidden="true">✦</span> Made for curious little hands <span aria-hidden="true">✦</span>
    </footer>
  </main>`;
