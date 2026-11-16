import './styles.css';
import './review.css';
import {inventory,buildLesson,readReviews,REVIEW_KEY,reviewFingerprint,wordReady,letterPositions,displayedLetterWidths} from './library.js';
import {art,resolve} from './assets.js';
import {createLessonAudio} from './audio.js';
import manifest from '../../../sound-lab/library-manifest.json';
document.body.className='sound-body';
const reviews=readReviews();
const isApproved=word=>wordReady(word,{resolve,art,manifest,reviews});
const wordLabel=word=>`${word.word} — ${word.engineStatus!=='supported'?'engine review needed':isApproved(word)?'approved':'needs listening review'}`;
document.querySelector('#app').innerHTML=`<main class="review"><p class="sound-kicker">LOCAL PARENT REVIEW · UNPUBLISHED</p><h1>Little words, carefully heard.</h1><p>Jenny’s voice, original pictures, and one sound at a time. Listen to each word’s stages, then check its approval box when its sounds and illustration are ready.</p><p><a href="./">Open the game</a> · <a href="./WORD-INVENTORY.md">Word inventory &amp; book sources</a> · <a href="./AUDIO-REVIEW.md">Audio review checklist</a></p><aside>Check consonant clarity, short vowels, clean partial blends, whole words, and picture meaning. The approved standalone P and G demos say “puh” and “guh”; introductions and blends keep pure /p/ and /ɡ/. Pay special attention to stop /s t ɑ p/, green /ɡ ɹ i n/, eggs /ɛ ɡ z/, and ee /i/. A machine check cannot certify pronunciation.</aside><p id="library-status" role="status"></p><label for="word-select">Choose a word to review</label><select id="word-select">${inventory.words.map(w=>`<option value="${w.id}">${wordLabel(w)}</option>`).join('')}</select><section id="review-word"></section><p id="save-status" role="status"></p><p>Approval applies only to this browser and these exact assets. Reload the game after approving words. Nothing is published or sent to a server.</p></main>`;
const $=s=>document.querySelector(s);
function updateApprovalLabels(){
 for(const option of $('#word-select').options)option.textContent=wordLabel(inventory.words.find(word=>word.id===option.value));
 const count=inventory.words.filter(isApproved).length;
 $('#library-status').textContent=`${count} ${count===1?'word approved':'words approved'} for this browser. Reload the game after approving words. No separate confirmation in chat is needed.`;
}
const requestedWord=new URL(location.href).searchParams.get('word');
if(inventory.words.some(word=>word.id===requestedWord))$('#word-select').value=requestedWord;
const player=createLessonAudio({resolve,onStatus:s=>{const status=$('#clip-status');if(status)status.textContent=s.kind==='playing'?'Listening…':s.kind==='error'?'Could not play. Try again.':s.kind==='missing'?'Recording not installed.':'Ready to listen again.';}});
function render(){
 player.stop();const word=inventory.words.find(w=>w.id===$('#word-select').value);
 const comparisons=word.units.filter(unit=>inventory.comparisonRecordings?.[unit.phoneme]).map(unit=>({phoneme:unit.phoneme,...inventory.comparisonRecordings[unit.phoneme]}));
 const supported=word.engineStatus==='supported',lesson=supported?buildLesson(word):null,complete=lesson?.stages.every(s=>resolve(s.audio))&&!!art[word.id];
 $('#review-word').innerHTML=`<div class="review-art">${art[word.id]}</div><h2>${word.word} <small>/${word.phonemes.join(' ')}/</small></h2><p>${word.units.map((u,i)=>`${u.text||word.units[i-1]?.text} → /${u.ipa}/`).join(' · ')}</p><p>${Object.entries(word.bookEvidence).map(([book,source])=>`<a href="${inventory.sources[source].url}">${book==='hop-on-pop'?'Hop on Pop':'Green Eggs and Ham'}</a>`).join(' · ')||'Book occurrence not verified in consulted sources.'}</p>${word.reviewNotes.map(note=>`<p class="review-note">${note}</p>`).join('')}${comparisons.map(sample=>`<aside><p>Standalone ${sample.phoneme.toUpperCase()} comparison: “${sample.label}”. Awaiting your listening approval; numbered stages still use the current G. Blends and whole words are unchanged.</p><button data-comparison="${sample.phoneme}">Try standalone “${sample.label}”</button></aside>`).join('')}<p id="clip-status" role="status">Tap a stage to hear it and inspect its letter grouping.</p><div class="letter-stage" data-animation="apart"><div class="letters many-letters"></div></div><div class="clip-list">${lesson?lesson.stages.map((stage,i)=>`<div><button data-stage="${i}" ${resolve(stage.audio)?'':'disabled'}>${i+1}. ${stage.title}${stage.focus.length?` · ${stage.focus.map(i=>word.units[i]?.text||word.units[i-1]?.text).join(' + ')}`:''}</button><a href="${resolve(stage.audio)||'#'}" download ${resolve(stage.audio)?'':'hidden'}>WAV</a></div>`).join(''):'<p>On hold. The x represents /k s/; no misleading lesson has been generated.</p>'}</div>${supported?`<label class="approve"><input type="checkbox" id="approve-word" ${wordReady(word,{resolve,art,manifest,reviews})?'checked':''} ${!complete||word.audioReviewed&&word.illustrationReviewed?'disabled':''}> I listened to every stage and approve the phonemes, blends, whole word, and illustration for ${word.word}.</label><p>${word.audioReviewed&&word.illustrationReviewed?'Approved recordings and illustration are integrated in the local word library.':complete?'All required local assets are installed.':'Some assets are missing; approval is unavailable.'}</p>`:''}`;
 if(lesson){
  const letters=$('.letters');letters.innerHTML=lesson.letters.map((l,i)=>l?`<span data-letter="${i}">${l}</span>`:'').join('');
  const show=stage=>{const widths=displayedLetterWidths(letters,lesson.letters),positions=letterPositions(lesson.letters,stage,widths);$('.letter-stage').dataset.animation=stage.animation;letters.querySelectorAll('span').forEach(el=>{const i=Number(el.dataset.letter);el.style.setProperty('--letter-x',`${positions[i]}px`);el.style.setProperty('--unit-width',`${widths[i]}px`);el.classList.toggle('active',stage.focus.includes(i)||lesson.letters[i+1]===''&&stage.focus.includes(i+1));});};show(lesson.stages[0]);
  document.querySelectorAll('[data-stage]').forEach(button=>button.onclick=()=>{const stage=lesson.stages[Number(button.dataset.stage)];show(stage);player.play(stage);});
  document.querySelectorAll('[data-comparison]').forEach(button=>button.onclick=()=>{const sample=comparisons.find(c=>c.phoneme===button.dataset.comparison),index=word.units.findIndex(u=>u.phoneme===sample.phoneme),stage=lesson.stages.find(s=>s.focus.length===1&&s.focus[0]===index);show(stage);player.play({...stage,audio:sample.audio});});
  $('#approve-word').onchange=event=>{
   // Merge the latest saved decisions so another open review tab is preserved.
   const latest=readReviews();for(const key of Object.keys(reviews))delete reviews[key];Object.assign(reviews,latest);
   const previous=reviews[word.id];
   if(event.target.checked)reviews[word.id]=reviewFingerprint(word,manifest);else delete reviews[word.id];
   try{
    localStorage.setItem(REVIEW_KEY,JSON.stringify(reviews));updateApprovalLabels();
    $('#save-status').textContent=event.target.checked?`${word.word} approved for this local browser. Reload the game to include it.`:`${word.word} removed from local approval.`;
   }catch{
    if(previous===undefined)delete reviews[word.id];else reviews[word.id]=previous;
    event.target.checked=isApproved(word);updateApprovalLabels();$('#save-status').textContent='Browser storage is unavailable. Approval was not saved.';
   }
  };
 }
}
$('#word-select').onchange=()=>{const url=new URL(location.href);url.searchParams.set('word',$('#word-select').value);history.replaceState(null,'',url);$('#save-status').textContent='';render();};updateApprovalLabels();render();
window.addEventListener('storage',event=>{if(event.key===REVIEW_KEY){const latest=readReviews();for(const key of Object.keys(reviews))delete reviews[key];Object.assign(reviews,latest);updateApprovalLabels();const checkbox=$('#approve-word');if(checkbox)checkbox.checked=isApproved(inventory.words.find(word=>word.id===$('#word-select').value));}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)player.stop();});window.addEventListener('pagehide',()=>player.stop());
