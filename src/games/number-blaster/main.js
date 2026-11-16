import './styles.css';
import {addHomeLink} from '../../shared/navigation.js';
import {createJourney,voiceFile} from './game.js';
const voiceAssets=import.meta.glob('/number-blaster/audio/*.wav',{eager:true,query:'?url',import:'default'});

const ship=`<svg viewBox="0 0 110 92" aria-hidden="true"><path d="M55 7C31 20 26 47 32 66h46C84 47 79 20 55 7Z" fill="#f7f0de" stroke="#425477" stroke-width="5"/><ellipse cx="55" cy="38" rx="16" ry="17" fill="#7fd1e8" stroke="#425477" stroke-width="4"/><path d="m32 52-20 16v10h28l5-17m33-9 20 16v10H70l-5-17" fill="#f48d90" stroke="#425477" stroke-width="4" stroke-linejoin="round"/><path d="M44 67h22l-4 12H48z" fill="#ffd279" stroke="#425477" stroke-width="4"/><path d="m50 81-4 9m14-9 4 9" stroke="#ffcd70" stroke-width="5" stroke-linecap="round"/></svg>`;
const $=selector=>document.querySelector(selector);
document.body.className='blaster-body';
$('#app').innerHTML=`<main class="blaster"><header><p class="eyebrow">A LITTLE SPACE ADVENTURE</p><h1>Levi's <span>Number Blaster</span></h1><div class="hud"><div id="hearts" aria-label="3 hearts remaining"></div><button id="replay" aria-label="Hear the math question again">Hear it again</button></div><div class="question"><p id="instruction"></p><strong id="equation"></strong></div></header><section class="space" aria-label="Choose the asteroid with the answer"><div class="stars" aria-hidden="true"></div><div class="planet planet-one" aria-hidden="true"></div><div class="planet planet-two" aria-hidden="true"></div><div id="destinations" class="destinations"></div><div class="home-rock"><span class="here">YOU ARE HERE</span><div class="ship" id="ship">${ship}</div><div class="rock-face"></div><strong id="current"></strong></div><div id="flight" class="flight" aria-hidden="true" hidden>${ship}</div><div id="spark" class="spark" aria-hidden="true">✦</div></section><p class="tip" id="status" role="status">Tap the asteroid with the answer!</p></main>`;
addHomeLink($('.blaster'));
const journey=createJourney();let busy=false,audioContext,activeVoice=null;
function stopVoice(){if(activeVoice){activeVoice.pause();activeVoice.currentTime=0;activeVoice=null;}}
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
 const audio=new Audio(url);activeVoice=audio;audio.onended=()=>{if(activeVoice===audio)activeVoice=null;};
 audio.play().catch(()=>{if(activeVoice===audio)$('#status').textContent='Tap Hear it again to play the question.';});
}
function render(){const q=journey.question;
 $('#hearts').innerHTML=Array.from({length:3},(_,i)=>`<span class="heart ${i<journey.hearts?'full':''}" aria-hidden="true">♥</span>`).join('');$('#hearts').setAttribute('aria-label',`${journey.hearts} hearts remaining`);
 $('#instruction').textContent=q.instruction;$('#equation').textContent=q.equation;$('#current').textContent=journey.current;
 $('#destinations').innerHTML=q.choices.map((number,i)=>`<button class="destination" data-answer="${number}" style="--index:${i}" aria-label="Fly to asteroid ${number}"><span class="asteroid-art" aria-hidden="true"></span><strong>${number}</strong></button>`).join('');
}
function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function choose(button){if(busy)return;const value=Number(button.dataset.answer),correct=value===journey.question.answer;
 stopVoice();if(!correct){const result=journey.choose(value);sound('oops');button.classList.add('wobble');$('#status').textContent=result==='restart'?'New journey! Let’s try another one.':'Try another asteroid!';renderHearts();
  if(result==='restart'){busy=true;$('#ship').classList.add('restart');await wait(500);$('#ship').classList.remove('restart');render();busy=false;speak();}else{await wait(450);button.classList.remove('wobble');}return;
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
