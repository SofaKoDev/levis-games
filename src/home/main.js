import './styles.css';
import { games, gameUrl } from './gameRegistry.js';
import { illustrations } from './illustrations.js';

const starMark = `<svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
  <g fill="currentColor" transform="translate(32 32)">
    <rect x="-4" y="-22" width="8" height="44" rx="4"/>
    <rect x="-4" y="-22" width="8" height="44" rx="4" transform="rotate(60)"/>
    <rect x="-4" y="-22" width="8" height="44" rx="4" transform="rotate(120)"/>
    <circle r="9" fill="#ffe28a"/>
    <circle r="4.5"/>
  </g>
</svg>`;

document.querySelector('#app').innerHTML = `
  <main class="games-home">
    <header class="welcome">
      <div class="sun" aria-hidden="true">${starMark}</div>
      <p class="welcome-kicker">A LITTLE WORLD OF WONDER</p>
      <h1>Levi's <span>Games</span></h1>
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
