import './styles.css';
import soundHeroArt from '../../home/art/sound-lab.jpg';
import {addHomeLink} from '../../shared/navigation.js';
import {createLesson} from './lesson.js';
import {createLessonAudio} from './audio.js';
import {inventory,buildLesson,createShuffleBag,wordReady,readReviews,letterPositions,displayedLetterWidths} from './library.js';
import {resolve,art} from './assets.js';
import manifest from '../../../sound-lab/library-manifest.json';
document.body.className='sound-body';
document.querySelector('#app').innerHTML=`<main class="sound-lab"><header><p class="sound-kicker">A LITTLE LISTENING ADVENTURE</p><h1>Levi's <span>Sound It Out</span></h1></header><aside class="audio-notice" hidden><strong>Some sounds are not ready yet.</strong><p>Only words with reviewed recordings and illustrations can play.</p></aside><section class="lesson-panel" aria-label="Blend the sounds in sun"><div id="sound-hero" class="sound-hero"><img src="${soundHeroArt}" alt="" width="800" height="597"></div><div class="lesson-heading"><h2 id="stage-title">Let’s listen and blend</h2><p id="stage-prompt">A little sound can become a word.</p></div><div class="letter-stage" data-animation="apart"><div class="letters" aria-label="sun"></div></div><div id="reveal" class="sun-reveal" hidden></div><div class="audio-state"><p id="audio-status" role="status">Tap Start to begin.</p><button id="replay" hidden><span aria-hidden="true">🔊</span> Listen again</button></div><button id="start" class="sound-primary">Start</button><nav class="lesson-nav" aria-label="Lesson navigation" hidden><button id="back">← Back</button><button id="next" class="sound-primary">Next →</button><button id="restart" hidden>↻ Start again</button></nav></section><footer>Little sounds. A sunny discovery.</footer></main>`;
const $=s=>document.querySelector(s);
const bag=createShuffleBag(inventory.words.filter(word=>wordReady(word,{resolve,art,manifest,reviews:readReviews()})));
const firstWord=bag.next();
addHomeLink($('.sound-lab'));
if(!firstWord){$('.audio-notice').hidden=false;$('.lesson-panel').hidden=true;}else{
let controller=createLesson(buildLesson(firstWord));
function loadWord(){
 const lesson=controller.lesson;
 $('.lesson-panel').setAttribute('aria-label',`Blend the sounds in ${lesson.word}`);
 $('.letters').setAttribute('aria-label',lesson.word);
 $('.letters').innerHTML=lesson.letters.map((letter,i)=>letter?`<span data-letter="${i}">${letter}</span>`:'').join('');
 $('.letters').classList.toggle('many-letters',lesson.letters.join('').length>3);
 $('#reveal').innerHTML=art[lesson.id];
 const widths=displayedLetterWidths($('.letters'),lesson.letters),positions=letterPositions(lesson.letters,lesson.stages[0],widths);
 document.querySelectorAll('[data-letter]').forEach(el=>{const i=Number(el.dataset.letter);el.style.setProperty('--letter-x',`${positions[i]}px`);el.style.setProperty('--unit-width',`${widths[i]}px`);});
}
loadWord();
const player=createLessonAudio({resolve,onStatus:status=>{
 $('#audio-status').textContent=status.kind==='missing'?'This sound is not installed yet.':status.kind==='error'?'That recording could not play. Tap Listen again to retry.':status.kind==='playing'?'Listening…':'Ready to listen again.';
 $('#audio-status').dataset.status=status.kind;
}});
function render(){const stage=controller.stage;if(!stage)return;
 $('#start').hidden=true;$('#sound-hero').hidden=true;$('.lesson-nav').hidden=false;$('#replay').hidden=false;
 $('#stage-title').textContent=stage.title;$('#stage-prompt').textContent=stage.prompt;
 $('.letter-stage').dataset.animation=stage.animation;
 const widths=displayedLetterWidths($('.letters'),controller.lesson.letters),positions=letterPositions(controller.lesson.letters,stage,widths);
 document.querySelectorAll('[data-letter]').forEach(letter=>{const i=Number(letter.dataset.letter);letter.classList.toggle('active',stage.focus.includes(i));letter.style.setProperty('--letter-x',`${positions[i]}px`);letter.style.setProperty('--unit-width',`${widths[i]}px`);});
 $('#reveal').hidden=!stage.complete;$('#back').disabled=!controller.canBack;$('#next').hidden=false;$('#next').textContent=stage.complete?'Next word →':'Next →';$('#next').setAttribute('aria-label',stage.complete?'Next word':'Next');$('#restart').hidden=!stage.complete;
}
function present(action){controller[action]();render();player.play(controller.stage);}
$('#start').onclick=()=>{player.preload(controller.lesson.stages);present('start');};
$('#next').onclick=()=>{if(controller.stage?.complete){controller=createLesson(buildLesson(bag.next()));loadWord();player.preload(controller.lesson.stages);present('start');}else present('next');};$('#back').onclick=()=>present('back');$('#restart').onclick=()=>present('restart');$('#replay').onclick=()=>player.play(controller.stage);
document.addEventListener('visibilitychange',()=>{if(document.hidden)player.stop();});window.addEventListener('pagehide',()=>player.stop());

}
