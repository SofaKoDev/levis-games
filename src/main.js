import './styles.css';
import {presets,hueOf,hueToHex} from './colorPresets.js';
import {colorName} from './colorNames.js';
import {createBowl} from './colorMixing.js';
import {animatePaint} from './animations.js';
document.querySelector('#app').innerHTML=`
<main class="lab"><header><span class="brand-mark" aria-hidden="true">✳</span><h1>Levi's <span>Color Lab</span></h1><p>A little paint. A big discovery.</p></header>
<section class="mixing" aria-label="Mixing bowl"><div class="eyebrow">LOOK WHAT YOU MADE</div><h2 id="result" aria-live="polite">Let's make a color!</h2>
<div class="bowl-stage"><svg class="bowl" viewBox="0 0 340 190" role="img" aria-label="An empty mixing bowl"><defs><clipPath id="bowl-clip"><path d="M28 57 Q34 172 170 177 Q306 172 312 57Z"/></clipPath></defs><ellipse cx="170" cy="177" rx="120" ry="9" fill="#ded6c6" opacity=".45"/><path d="M28 57 Q34 172 170 177 Q306 172 312 57Z" fill="#eadfcf"/><g clip-path="url(#bowl-clip)"><rect class="paint" x="20" y="48" width="300" height="134" fill="#eadfcf"/><path d="M48 75 Q59 140 115 151" fill="none" stroke="white" stroke-width="13" stroke-linecap="round" opacity=".3"/></g><ellipse cx="170" cy="57" rx="143" ry="44" fill="#fffdf7" stroke="#e2d8c6" stroke-width="8"/><ellipse class="paint" cx="170" cy="57" rx="130" ry="33" fill="#f4edde"/><path d="M78 51 Q100 35 141 34" fill="none" stroke="white" stroke-width="7" stroke-linecap="round" opacity=".65"/></svg></div>
<div class="bowl-meta"><span id="count">0 drops</span><span id="hex">Ready to play</span></div></section>
<section class="selector" aria-label="Choose your paint"><div class="selection"><div><div class="eyebrow">YOUR NEXT DROP</div><h2 id="selected-name">Red</h2></div><div id="swatch" aria-hidden="true"></div></div>
<label class="sr-only" for="rainbow">Choose a rainbow hue</label><input id="rainbow" type="range" min="0" max="359" step="1" value="0"><div class="slider-hint" aria-hidden="true">Slide to explore the rainbow</div>
<div class="presets">${presets.map(p=>`<button class="preset" data-color="${p.hex}" aria-label="${p.name}" aria-pressed="false"><span style="background:${p.hex}"></span><small>${p.name}</small></button>`).join('')}</div></section>
<div class="controls"><button id="add">＋ <span>Add Paint</span></button><div class="secondary"><button id="undo" disabled>↶ Undo Last Drop</button><button id="empty" disabled>♧ Empty Bowl</button></div></div>
<footer>Made for curious little hands <span aria-hidden="true">✦</span></footer></main>`;
const $=s=>document.querySelector(s),bowl=createBowl();
let selected=presets[0].hex;
function select(hex){selected=hex;$('#swatch').style.background=hex;const name=colorName(hex);$('#selected-name').textContent=name;$('#rainbow').value=hueOf(hex);$('#rainbow').setAttribute('aria-valuetext',name);for(const b of document.querySelectorAll('.preset'))b.setAttribute('aria-pressed',String(b.dataset.color===hex));}
function render(){const color=bowl.color,n=bowl.drops.length;$('#result').textContent=color?colorName(color):"Let's make a color!";$('#count').textContent=`${n} ${n===1?'drop':'drops'}`;$('#hex').textContent=color?color.toUpperCase():'Ready to play';document.querySelectorAll('.paint').forEach(p=>p.setAttribute('fill',color||'#f4edde'));$('.bowl').setAttribute('aria-label',color?`Bowl of ${colorName(color)} paint`:'An empty mixing bowl');$('#undo').disabled=$('#empty').disabled=!n;}
$('#rainbow').addEventListener('input',e=>select(hueToHex(Number(e.target.value))));
document.querySelectorAll('.preset').forEach(b=>b.addEventListener('click',()=>select(b.dataset.color)));
$('#add').addEventListener('click',()=>{bowl.add(selected);render();animatePaint($('.bowl-stage'),selected)});
$('#undo').addEventListener('click',()=>{bowl.undo();render()});$('#empty').addEventListener('click',()=>{bowl.empty();render()});select(selected);
