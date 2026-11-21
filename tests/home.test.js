// @vitest-environment jsdom
import {it,expect} from 'vitest';
import {games} from '../src/home/gameRegistry.js';
it('shows every registered game with real static-page links',async()=>{
  document.body.innerHTML='<div id="app"></div>';
  await import('../src/home/main.js');
  expect(document.querySelector('h1').textContent).toContain("Levi's");
  expect(document.querySelector('.tagline').textContent).toBe('Little games. Big imagination.');
  const cards=[...document.querySelectorAll('.game-card')];
  expect(cards).toHaveLength(games.length);
  expect(games.slice(0,3).map(game=>game.id)).toEqual(['number-blaster','sound-lab','little-monsters']);
  for(const game of games){const card=cards.find(c=>c.textContent.includes(game.title));expect(card.getAttribute('href')).toBe(game.href??`/${game.id}/`);expect(card.getAttribute('aria-label')).toBe(game.label);}
  expect(cards.find(c=>c.textContent.includes('Bouncy Bowling')).getAttribute('href')).toBe('https://sofakodev.github.io/bowling/');
  expect(cards.find(c=>c.textContent.includes('Holeo')).getAttribute('href')).toBe('https://sofakodev.github.io/holeo/');
});
