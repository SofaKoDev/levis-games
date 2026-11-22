import './styles.css';
import {presets,hueOf,hueToHex} from './colorPresets.js';
import {colorName} from './colorNames.js';
import {createBowl} from './colorMixing.js';
import {animatePaint} from './animations.js';
import {addHomeLink} from './shared/navigation.js';
import {formatColorAnnouncement,playVoiceClip,primeVoicePlayer,stopSpeaking,voiceSlug} from './shared/speech.js';
const voiceAssets=import.meta.glob('/color-lab/audio/*.mp3',{eager:true,query:'?url',import:'default'});
document.querySelector('#app').innerHTML=`
<main class="lab"><header><span class="brand-mark" aria-hidden="true">✳</span><h1>Levi's <span>Color Lab</span></h1><p>A little paint. A big discovery.</p></header>
<section class="mixing" aria-label="Mixing bowl"><div class="eyebrow">LOOK WHAT YOU MADE</div><h2 id="result" aria-live="polite">Let's make a color!</h2>
<div class="bowl-stage"><svg class="bowl" viewBox="0 0 360 220" role="img" aria-label="An empty mixing bowl">
  <defs>
    <linearGradient id="studio-wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fffaf0"/>
      <stop offset="100%" stop-color="#f5ead7"/>
    </linearGradient>
    <linearGradient id="wood-top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8c396"/>
      <stop offset="100%" stop-color="#d5a673"/>
    </linearGradient>
    <linearGradient id="wood-edge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bf8c58"/>
      <stop offset="100%" stop-color="#a87645"/>
    </linearGradient>
    <linearGradient id="ceramic-body" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f7efe0"/>
      <stop offset="35%" stop-color="#fffdf8"/>
      <stop offset="78%" stop-color="#ece0cb"/>
      <stop offset="100%" stop-color="#d9cab0"/>
    </linearGradient>
    <linearGradient id="bowl-rim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#eee4d2"/>
    </linearGradient>
    <clipPath id="bowl-clip"><path d="M56 76 Q64 176 180 182 Q296 176 304 76Z"/></clipPath>
  </defs>
  <!-- Sunlit art studio wall & wooden tabletop -->
  <rect width="360" height="145" fill="url(#studio-wall)"/>
  <circle cx="52" cy="40" r="34" fill="#ffe6a8" opacity=".45"/>
  <path d="M0 144 H360 V206 H0 Z" fill="url(#wood-top)"/>
  <line x1="0" y1="144" x2="360" y2="144" stroke="#f5dbb9" stroke-width="3"/>
  <path d="M22 162 H96 M258 172 H338 M44 186 H108" stroke="#c89561" stroke-width="2" stroke-linecap="round" opacity=".45"/>
  <rect y="204" width="360" height="16" fill="url(#wood-edge)"/>

  <!-- Resting wooden paintbrush on the right side of the table -->
  <g transform="translate(274 178) rotate(-14)" opacity=".92">
    <ellipse cx="26" cy="11" rx="34" ry="4" fill="#6b4420" opacity=".2"/>
    <path d="M-8 4 L48 1 Q54 1 54 4.5 Q54 8 48 8 L-8 6 Z" fill="#c7834c"/>
    <rect x="-15" y="1.5" width="11" height="7" rx="1.5" fill="#d9dfe3"/>
    <path d="M-15 2 Q-26 0 -30 5 Q-25 10 -15 8 Z" fill="#6a584c"/>
  </g>

  <!-- Grounded contact shadow squarely on the wooden table surface -->
  <ellipse cx="180" cy="184" rx="92" ry="12" fill="#5e3a18" opacity=".24"/>
  <ellipse cx="180" cy="184" rx="70" ry="7" fill="#47290e" opacity=".26"/>

  <!-- Ceramic mixing bowl foot & body -->
  <ellipse cx="180" cy="181" rx="58" ry="8" fill="#dfd2bc"/>
  <path d="M56 76 Q64 176 180 182 Q296 176 304 76Z" fill="url(#ceramic-body)" stroke="#d9ccb5" stroke-width="2"/>
  <g clip-path="url(#bowl-clip)">
    <rect class="paint" x="48" y="68" width="264" height="120" fill="#f4edde" opacity=".22"/>
    <path d="M74 96 Q84 148 130 160" fill="none" stroke="#ffffff" stroke-width="11" stroke-linecap="round" opacity=".55"/>
  </g>

  <!-- Bowl rim & glossy liquid paint surface -->
  <ellipse cx="180" cy="76" rx="125" ry="37" fill="url(#bowl-rim)" stroke="#dfd2bc" stroke-width="6"/>
  <ellipse class="paint" cx="180" cy="76" rx="112" ry="28" fill="#f4edde"/>
  <path d="M100 68 Q122 54 160 54" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".7"/>
  <path d="M214 91 Q244 89 262 79" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" opacity=".4"/>
</svg></div>
<div class="bowl-meta"><span id="count">0 drops</span><span id="hex">Ready to play</span></div>
<div class="mix-list" id="mix-list" aria-label="Colors in the bowl" hidden></div></section>
<section class="selector" aria-label="Choose your paint"><div class="selection"><div><div class="eyebrow">YOUR NEXT DROP</div><h2 id="selected-name">Red</h2></div><div id="swatch" aria-hidden="true"></div></div>
<label class="sr-only" for="rainbow">Choose a rainbow hue</label><input id="rainbow" type="range" min="0" max="359" step="1" value="0"><div class="slider-hint" aria-hidden="true">Tap a color below to drop it in, or slide for any rainbow color</div>
<div class="presets">${presets.map(p=>`<button class="preset" data-color="${p.hex}" aria-label="${p.name}" aria-pressed="false"><span style="background:${p.hex}"></span><small>${p.name}</small></button>`).join('')}</div></section>
<div class="controls"><button id="add">＋ <span>Add Paint</span></button><div class="secondary"><button id="undo" disabled><span class="btn-icon" aria-hidden="true">↶</span> Undo Last Drop</button><button id="empty" disabled><span class="btn-icon" aria-hidden="true">↻</span> Empty Bowl</button></div></div>
<footer>Made for curious little hands <span aria-hidden="true">✦</span></footer></main>`;
const $=s=>document.querySelector(s),bowl=createBowl(),ANNOUNCE_DELAY_MS=5000;
let selected=presets[0].hex,announceTimer=null;
function cancelAnnouncement(){if(announceTimer!==null){clearTimeout(announceTimer);announceTimer=null;}stopSpeaking();}
function scheduleAnnouncement(){cancelAnnouncement();if(!bowl.color)return;announceTimer=setTimeout(()=>{announceTimer=null;if(bowl.color){const name=colorName(bowl.color);playVoiceClip(voiceAssets[`/color-lab/audio/${voiceSlug(name)}.mp3`],formatColorAnnouncement(name));}},ANNOUNCE_DELAY_MS);}
function select(hex){selected=hex;$('#swatch').style.background=hex;const name=colorName(hex);$('#selected-name').textContent=name;$('#rainbow').value=hueOf(hex);$('#rainbow').setAttribute('aria-valuetext',name);for(const b of document.querySelectorAll('.preset'))b.setAttribute('aria-pressed',String(b.dataset.color===hex));}
function addDrop(hex){primeVoicePlayer();bowl.add(hex);render();animatePaint($('.bowl-stage'),hex);scheduleAnnouncement();}
function render(){const color=bowl.color,drops=bowl.drops,n=drops.length;$('#result').textContent=color?colorName(color):"Let's make a color!";$('#count').textContent=`${n} ${n===1?'drop':'drops'}`;$('#hex').textContent=color?color.toUpperCase():'Ready to play';document.querySelectorAll('.paint').forEach(p=>p.setAttribute('fill',color||'#f4edde'));$('.bowl').setAttribute('aria-label',color?`Bowl of ${colorName(color)} paint`:'An empty mixing bowl');$('#undo').disabled=$('#empty').disabled=!n;const list=$('#mix-list');list.hidden=!n;if(n){const counts=new Map();for(const d of drops){const k=d.toLowerCase();counts.set(k,(counts.get(k)||0)+1);}list.innerHTML=[...counts].map(([hex,count])=>`<span class="mix-chip"><i style="background:${hex}" aria-hidden="true"></i><span>${colorName(hex)}</span><strong>×${count}</strong></span>`).join('');}else list.innerHTML='';}
$('#rainbow').addEventListener('input',e=>select(hueToHex(Number(e.target.value))));
document.querySelectorAll('.preset').forEach(b=>b.addEventListener('click',()=>{select(b.dataset.color);addDrop(b.dataset.color);}));
$('#add').addEventListener('click',()=>addDrop(selected));
$('#undo').addEventListener('click',()=>{bowl.undo();render();scheduleAnnouncement();});$('#empty').addEventListener('click',()=>{bowl.empty();render();cancelAnnouncement();});select(selected);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnnouncement();});
addHomeLink($('.lab'));
// Browsers can restore a range value after loading a page from history.
window.addEventListener('pageshow',()=>select(selected));
