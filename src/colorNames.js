import cssNames from 'color-name';
import spectral from 'spectral.js';
import {presets} from './colorPresets.js';
export const lab=hex=>new spectral.Color(hex).OKLab;
export const distance=(a,b)=>Math.hypot(...lab(a).map((v,i)=>v-lab(b)[i]));
const hex=rgb=>'#'+rgb.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
const extras={Orange:'#ff7426',Green:'#72b04b',Purple:'#6c376d',Brown:'#8e5b3e',Vermilion:'#e34234',Tangerine:'#f28500',Amber:'#ffbf00',Chartreuse:'#7fff00',Emerald:'#50c878',Jade:'#00a86b',Turquoise:'#40e0d0',Teal:'#008080',Cerulean:'#007ba7',Cobalt:'#0047ab',Indigo:'#4b0082',Lavender:'#b9a0e2',Magenta:'#ff00ff',Coral:'#ff7f50',Periwinkle:'#ccccff','Blue-green':'#008c95','Deep Teal':'#004c4c','Muted Purple':'#694c75'};
const skipCss=new Set(['tomato','peru','burlywood','papayawhip','navajowhite','blanchedalmond','moccasin','bisque','gainsboro','olivedrab','darkolivegreen','saddlebrown','rosybrown','sandybrown','darksalmon','lightsalmon','darkviolet','greenyellow','yellowgreen']);
const readable=name=>name.replace(/(light|dark|medium|pale|deep|slate|spring|forest|sea|sky|royal|steel|powder|dodger|cornflower|midnight|blue|green|yellow|red|pink|purple|violet|turquoise|goldenrod|gray|grey|white|smoke|olive|drab|orange|salmon|coral|brown|sandy|saddle|rosy|hot|mint|cream|lemon|chiffon|papaya|whip|peach|puff|navajo|almond)/g,'$1 ').trim().replace(/\b\w/g,c=>c.toUpperCase());
const entries=new Map(Object.entries(cssNames).filter(([name])=>!skipCss.has(name)).map(([name,rgb])=>[readable(name),hex(rgb)]));
for(const [name,value] of Object.entries(extras)) entries.set(name,value);
// Derived descriptive shades extend the CSS palette; these are not official standards.
for(const [name,value] of [...entries]) {
  if(/^(Light|Dark|Pale|Deep|Medium)\b/.test(name)) continue;
  const rgb=value.match(/\w\w/g).map(v=>parseInt(v,16));
  if(Math.max(...rgb)-Math.min(...rgb)<45) continue;
  for(const [prefix,scale,white] of [['Light',.72,71],['Pale',.45,140],['Deep',.72,0],['Dark',.45,0]]) entries.set(`${prefix} ${name}`,hex(rgb.map(v=>v*scale+white)));
}
export const namedColors=[...entries].map(([name,hex])=>({name,hex,lab:lab(hex)}));
export function colorName(hex) {
  const exact=presets.find(p=>p.hex.toLowerCase()===hex.toLowerCase());
  if(exact) return exact.name;
  const descriptive=Object.entries(extras).find(([,value])=>value===hex.toLowerCase());
  if(descriptive) return descriptive[0];
  const target=lab(hex);
  let best,score=Infinity;
  for(const c of namedColors){const d=Math.hypot(...target.map((v,i)=>v-c.lab[i]));if(d<score){score=d;best=c.name;}}
  return best;
}
