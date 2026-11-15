// Seeded randomness keeps the natural scattering stable during edits and export.
function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const placementRandom = random(14225);
export const bulbPositions = [];
while (bulbPositions.length < 32) {
  const y = .24 + placementRandom() * .53;
  const halfWidth = .035 + (y - .16) * .43;
  const x = .5 + (placementRandom() * 2 - 1) * halfWidth;
  if (bulbPositions.every(p => Math.hypot(x - p.x, y - p.y) > .052)) {
    bulbPositions.push({x, y});
  }
}
export function renderLights(mode) {
  const colorRandom = random(90217);
  const palette = mode === 4 ? ['#78baff', '#fff9ec'] : ['#ff818d', '#8ccefc', '#ffda75', '#b79bed', '#98dfab'];
  return bulbPositions.map(({x,y},i) => {
    const color = mode === 3 ? '#9b9c74' : mode === 1 ? '#ffe9b0' : mode === 2 ? '#ace7ff' : palette[Math.floor(colorRandom() * palette.length)];
    return `<circle class="bulb" cx="${x*400}" cy="${y*500}" r="4" fill="${color}" style="animation-delay:-${(i*.73).toFixed(2)}s"/>`;
  }).join('');
}
