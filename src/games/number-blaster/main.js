import './styles.css';
import {addHomeLink} from '../../shared/navigation.js';
import {createJourney,voiceFile} from './game.js';
const voiceAssets=import.meta.glob('/number-blaster/audio/*.wav',{eager:true,query:'?url',import:'default'});

const ship=`<svg viewBox="0 0 110 104" aria-hidden="true">
  <defs>
    <linearGradient id="ship-body" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fffdf5"/>
      <stop offset="55%" stop-color="#f7ecd4"/>
      <stop offset="100%" stop-color="#e0d0b4"/>
    </linearGradient>
    <linearGradient id="ship-fin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f68d84"/>
      <stop offset="100%" stop-color="#d65d63"/>
    </linearGradient>
    <radialGradient id="ship-window" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#c9f4ff"/>
      <stop offset="60%" stop-color="#6ac2e6"/>
      <stop offset="100%" stop-color="#3c8db8"/>
    </radialGradient>
    <linearGradient id="ship-flame" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff3a8"/>
      <stop offset="55%" stop-color="#ffb84d"/>
      <stop offset="100%" stop-color="#f26b4e"/>
    </linearGradient>
  </defs>
  <!-- Glowing thruster flame -->
  <path class="flame" d="M44 77 Q55 103 66 77 Q55 86 44 77 Z" fill="url(#ship-flame)"/>
  <path class="flame" d="M49 77 Q55 93 61 77 Z" fill="#fffbe0"/>
  <!-- Coral side fins -->
  <path d="M33 52 Q14 60 12 78 L36 70 Z" fill="url(#ship-fin)" stroke="#38496b" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M77 52 Q96 60 98 78 L74 70 Z" fill="url(#ship-fin)" stroke="#38496b" stroke-width="3.2" stroke-linejoin="round"/>
  <!-- Rocket hull -->
  <path d="M55 7 C32 21 26 48 33 70 H77 C84 48 78 21 55 7 Z" fill="url(#ship-body)" stroke="#38496b" stroke-width="3.5" stroke-linejoin="round"/>
  <!-- Coral nose cone cap -->
  <path d="M55 7 C46 13 40 20 37 26 H73 C70 20 64 13 55 7 Z" fill="url(#ship-fin)" stroke="#38496b" stroke-width="3.2" stroke-linejoin="round"/>
  <!-- Soft hull shine -->
  <path d="M40 34 Q38 50 41 62" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
  <!-- Glowing porthole window -->
  <circle cx="55" cy="46" r="14" fill="url(#ship-window)" stroke="#38496b" stroke-width="3.5"/>
  <path d="M47 41 Q50 36 56 37" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".85"/>
  <!-- Thruster nozzle -->
  <path d="M43 70 H67 L63 80 H47 Z" fill="#ffd279" stroke="#38496b" stroke-width="3.2" stroke-linejoin="round"/>
</svg>`;
const $=selector=>document.querySelector(selector);
document.body.className='blaster-body';
$('#app').innerHTML=`<main class="blaster"><header><p class="eyebrow">A LITTLE SPACE ADVENTURE</p><h1>Levi's <span>Number Blaster</span></h1><div class="hud"><div id="hearts" aria-label="3 hearts remaining"></div><button id="replay" aria-label="Hear the math question again">Hear it again</button></div><div class="question"><p id="instruction"></p><strong id="equation"></strong></div></header><section class="space" aria-label="Choose the asteroid with the answer"><div class="stars" aria-hidden="true"></div><div class="planet planet-one" aria-hidden="true"></div><div class="planet planet-two" aria-hidden="true"></div><div id="destinations" class="destinations"></div><div class="home-rock"><span class="here">YOU ARE HERE</span><div class="ship" id="ship">${ship}</div><div class="rock-face"></div><strong id="current"></strong></div><div id="flight" class="flight" aria-hidden="true" hidden>${ship}</div><div id="spark" class="spark" aria-hidden="true">✦</div></section><p class="tip" id="status" role="status">Tap the asteroid with the answer!</p></main>`;
addHomeLink($('.blaster'));
const journey=createJourney();let busy=false,audioContext,voicePlayer=null;
function getVoicePlayer(){if(!voicePlayer)voicePlayer=new Audio();return voicePlayer;}
function stopVoice(){if(voicePlayer){voicePlayer.pause();try{voicePlayer.currentTime=0;}catch{}}}
function sound(kind){
 try{audioContext ||= new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const now=audioContext.currentTime;
  for(const [i,note] of (kind==='good'?[523,659,784]:[330,294]).entries()){
   const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=note;gain.gain.setValueAtTime(.0001,now+i*.12);gain.gain.exponentialRampToValueAtTime(.12,now+i*.12+.02);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.12+.22);osc.connect(gain).connect(audioContext.destination);osc.start(now+i*.12);osc.stop(now+i*.12+.23);
  }
 }catch{}
}
function speak(){
 stopVoice();const q=journey.question,url=voiceAssets[`/number-blaster/audio/${voiceFile(q)}`];
 if(!url){$('#status').textContent='This recording is missing.';return;}
 const audio=getVoicePlayer();audio.src=url;audio.load();
 audio.play().catch(()=>{$('#status').textContent='Tap Hear it again to play the question.';});
}
function render(){const q=journey.question;
 $('#hearts').innerHTML=Array.from({length:3},(_,i)=>`<span class="heart ${i<journey.hearts?'full':''}" aria-hidden="true">♥</span>`).join('');$('#hearts').setAttribute('aria-label',`${journey.hearts} hearts remaining`);
 $('#instruction').textContent=q.instruction;$('#equation').textContent=q.equation;$('#current').textContent=journey.current;
 $('#destinations').innerHTML=q.choices.map((number,i)=>`<button class="destination" data-answer="${number}" style="--index:${i}" aria-label="Fly to asteroid ${number}"><span class="asteroid-art" aria-hidden="true"></span><strong>${number}</strong></button>`).join('');
}
function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function choose(button){if(busy)return;const value=Number(button.dataset.answer),correct=value===journey.question.answer;
 stopVoice();getVoicePlayer();
 if(!correct){busy=true;const result=journey.choose(value);sound('oops');button.classList.add('wobble');$('#status').textContent=result==='restart'?'New journey! Let’s try another one.':'Try another asteroid!';renderHearts();
  if(result==='restart'){$('#ship').classList.add('restart');await wait(500);$('#ship').classList.remove('restart');render();busy=false;speak();}else{await wait(450);button.classList.remove('wobble');busy=false;}return;
 }
 busy=true;sound('good');$('#status').textContent='Great flying!';
 const from=$('#ship').getBoundingClientRect(),to=button.getBoundingClientRect(),fly=$('#flight');
 fly.style.left=`${from.left+from.width/2}px`;fly.style.top=`${from.top+from.height/2}px`;fly.hidden=false;$('#ship').style.visibility='hidden';
 const dx=to.left+to.width/2-(from.left+from.width/2),dy=to.top+to.height*.30-(from.top+from.height/2);
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?120:650;
 await fly.animate([{transform:'translate(-50%,-50%) scale(1)'},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.84)`}],{duration,easing:'ease-in-out',fill:'forwards'}).finished.catch(()=>{});
 button.classList.add('landed');$('#spark').style.left=`${to.left+to.width/2}px`;$('#spark').style.top=`${to.top+to.height*.25}px`;$('#spark').classList.add('show');
 await wait(220);journey.choose(value);$('#current').classList.add('pulse');render();fly.hidden=true;fly.getAnimations().forEach(animation=>animation.cancel());$('#ship').style.visibility='visible';$('#spark').classList.remove('show');
 await wait(260);$('#current').classList.remove('pulse');busy=false;$('#status').textContent='Tap the asteroid with the answer!';speak();
}
function renderHearts(){[...$('#hearts').children].forEach((heart,i)=>heart.classList.toggle('full',i<journey.hearts));$('#hearts').setAttribute('aria-label',`${journey.hearts} hearts remaining`);}
$('#destinations').addEventListener('click',event=>{const button=event.target.closest('.destination');if(button)choose(button);});
$('#replay').addEventListener('click',()=>{if(!busy)speak();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoice();});
render();
