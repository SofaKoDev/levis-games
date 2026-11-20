import spectral from 'spectral.js';
const cache=new Map();
function pigment(hex) {
  if(!/^#[0-9a-f]{6}$/i.test(hex)) throw new TypeError('Paint must be a six-digit hex color');
  if(!cache.has(hex)) cache.set(hex,new spectral.Color(hex));
  return cache.get(hex);
}
// Recompute from original pigments, never from a rounded previous mixture.
export function mixPaint(drops) {
  if(!drops.length) return null;
  const counts=new Map();
  for(const drop of drops) {pigment(drop);const key=drop.toLowerCase();counts.set(key,(counts.get(key)||0)+1);}
  if(counts.size===1) return [...counts.keys()][0];
  // Spectral.js squares each input factor internally and applies luminance-based
  // Kubelka-Munk tinting weights so dark pigments don't overpower bright ones
  // (e.g., Red + Yellow -> vibrant Orange, Yellow + Blue -> bright Green).
  // Taking Math.sqrt keeps drop quantities linear.
  const terms=[...counts].sort(([a],[b])=>a.localeCompare(b)).map(([hex,count])=>{
    const color=pigment(hex);
    return [color,Math.sqrt(count/drops.length)];
  });
  return spectral.mix(...terms).toString().toLowerCase();
}
export function createBowl() {
  const drops=[];
  return {get drops(){return [...drops]},get color(){return mixPaint(drops)},
    add(hex){pigment(hex);drops.push(hex);return this.color},
    undo(){drops.pop();return this.color},empty(){drops.length=0;return null}};
}
