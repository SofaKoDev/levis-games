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
  // Spectral.js squares each input factor before luminance weighting. A square
  // root ensures linear quantities. Compensate the library's luminance weighting
  // so every equal-volume drop contributes equally to the spectral K/S average.
  const terms=[...counts].sort(([a],[b])=>a.localeCompare(b)).map(([hex,count])=>{
    const color=pigment(hex);
    return [color,Math.sqrt(count/drops.length/color.luminance)];
  });
  return spectral.mix(...terms).toString().toLowerCase();
}
export function createBowl() {
  const drops=[];
  return {get drops(){return [...drops]},get color(){return mixPaint(drops)},
    add(hex){pigment(hex);drops.push(hex);return this.color},
    undo(){drops.pop();return this.color},empty(){drops.length=0;return null}};
}
