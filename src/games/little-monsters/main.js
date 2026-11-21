import './styles.css';
import {addHomeLink} from '../../shared/navigation.js';
import {MONSTERS,monsterSprite} from './art.js';
import {createMonsterAnimator} from './animation.js';
import {uiNeedIcon,uiActionSprite,uiUtilityIcon} from './uiArt.js';
import {NEEDS,newMonster,renameMonster,applyElapsed,act,readSave,writeSave,exportSave,importSave} from './state.js';
import {readJournal,archiveAndAdopt,restoreFromJournal} from './journal.js';

const $=selector=>document.querySelector(selector);
const labels={fullness:'Hunger',happiness:'Happy',cleanliness:'Clean',energy:'Rested'};
const actionMessages={feed:'Yum! A tasty snack.',play:'That was fun!',clean:'All bubbly and fresh!',rest:'A cozy little nap.'};
const dateLabel=time=>new Date(time).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
let state=readSave();
let journal=readJournal();
let selected='emberhorn',reactionTimer,animator,reactionActive=false,pendingAdoption=false,replaceAction=null;

document.body.className='monster-body';
$('#app').innerHTML=`<main class="monster-app">
  <header><p class="kicker">A LITTLE FRIEND TO CARE FOR</p><h1>Levi's <span>Little Monsters</span></h1></header>
  <section id="adopt" class="adopt" hidden>
    <h2 class="adopt-title">${uiUtilityIcon('paw')}<span>Choose your little monster</span></h2>
    <div class="choices">${MONSTERS.map(monster=>`<button type="button" class="monster-choice" data-species="${monster.id}" aria-pressed="false">${monsterSprite(monster.id,'idle',true)}<strong>${monster.label}</strong><small>${monster.description}</small></button>`).join('')}</div>
    <form id="adopt-form"><label for="monster-name">Give your friend a name</label><input id="monster-name" name="name" maxlength="20" autocomplete="off" placeholder="A name for your monster" required><button class="primary" type="submit">Let's be friends!</button></form>
    <p class="adopt-help">A grown-up can help with the name.</p><p id="adopt-status" class="form-status" role="status"></p>
    <button id="adopt-back" class="back-button" type="button" hidden>Back to Journal</button>
  </section>
  <section id="home" class="home" hidden>
    <div class="name-row"><h2 id="pet-name"></h2><div class="name-tools"><span class="saved-note">Saved on this device</span><button id="journal-open" class="journal-button" type="button">${uiUtilityIcon('journal')}<span>Journal</span></button></div></div>
    <div class="needs">${NEEDS.map(key=>`<div class="need"><label for="need-${key}">${uiNeedIcon(key)}<span>${labels[key]}</span></label><div class="need-meter"><progress id="need-${key}" max="100" value="85"></progress></div></div>`).join('')}</div>
    <div class="room"><div id="pet" class="pet"></div><div id="effect" class="effect" aria-hidden="true"></div></div>
    <p id="message" class="message" role="status">Your little friend is happy to see you!</p>
    <div class="actions">${['feed','play','clean','rest'].map(action=>`<button type="button" class="action ${action}" data-action="${action}">${uiActionSprite(action)}<span class="action-label">${action[0].toUpperCase()+action.slice(1)}</span></button>`).join('')}</div>
    <details class="parent"><summary>${uiUtilityIcon('settings')}<span>Grown-up settings</span></summary><div class="parent-tools"><button type="button" id="export">Export Pet</button><button type="button" id="export-journal">Export Journal</button><label class="import-label" for="import">Import Pet</label><input id="import" type="file" accept="application/json,.json"></div><div class="rename-tools"><label for="rename-input">Pet name</label><input id="rename-input" maxlength="20"><button type="button" id="rename">Save Name</button></div><p>Saves stay in this browser. Export files to keep a backup.</p><p id="parent-status" role="status"></p></details>
  </section>
  <section id="journal" class="journal" hidden><div class="journal-head"><h2>Monster Journal</h2><button id="journal-back" class="back-button" type="button">Back to Pet</button></div><p class="journal-intro">Your monster friends, all together.</p><p id="journal-status" class="form-status" role="status"></p><div id="journal-gallery" class="journal-gallery"></div><button id="adopt-another" class="primary journal-adopt" type="button">Adopt Another Monster</button></section>
  <dialog id="replace-dialog"><h2 id="replace-title">Adopt another monster?</h2><p id="replace-message">Your current friend will move into the Journal.</p><div class="dialog-buttons"><button id="replace-cancel" type="button">Keep my friend</button><button id="replace-confirm" class="primary" type="button">Continue</button></div></dialog>
</main>`;
addHomeLink($('.monster-app'));

function setStatus(selector,message){$(selector).textContent=message;}
function restingPose(){return state?.sleeping?'sleep':'idle';}
function update(){
 if(!state)return;
 $('#pet-name').textContent=state.name;
 $('#rename-input').value=state.name;
 for(const key of NEEDS) $(`#need-${key}`).value=Math.round(state.needs[key]);
 if(animator){animator.setSpecies(state.species);if(!reactionActive&&['idle','sleep'].includes(animator.action)&&animator.action!==restingPose())animator.play(restingPose());}
}
function selectMonster(species){
 selected=species;
 document.querySelectorAll('.monster-choice').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.species===species)));
}
function showAdoption(){
 $('#home').hidden=true;$('#journal').hidden=true;$('#adopt').hidden=false;
 $('#adopt-back').hidden=!pendingAdoption;
 setStatus('#adopt-status','');
 selectMonster(selected);
}
function showHome(){
 clearTimeout(reactionTimer);reactionActive=false;
 $('#pet').className='pet';$('#effect').className='effect';$('#effect').innerHTML='';
 $('#adopt').hidden=true;$('#journal').hidden=true;$('#home').hidden=false;
 if(!animator)animator=createMonsterAnimator($('#pet'),state.species);else animator.setSpecies(state.species);
 animator.play(restingPose());update();
}
function renderJournal(){
 const gallery=$('#journal-gallery');gallery.replaceChildren();
 if(!journal){setStatus('#journal-status','The Journal could not be read. No entries were changed.');$('#adopt-another').disabled=true;return;}
 setStatus('#journal-status','');$('#adopt-another').disabled=false;
 if(!journal.entries.length){const empty=document.createElement('p');empty.className='journal-empty';empty.textContent='Your monster friends will appear here.';gallery.append(empty);return;}
 for(const entry of [...journal.entries].reverse()){
  const card=document.createElement('article');card.className='journal-card';
  const portrait=document.createElement('div');portrait.className='journal-portrait';portrait.innerHTML=monsterSprite(entry.species,'idle',true);
  const details=document.createElement('div');details.className='journal-details';
  const title=document.createElement('h3');title.textContent=entry.name;
  const species=document.createElement('p');species.className='journal-species';species.textContent=MONSTERS.find(monster=>monster.id===entry.species)?.label??entry.species;
  const dates=document.createElement('p');dates.textContent=`Adopted ${entry.adoptionDateEstimated?'by ':''}${dateLabel(entry.adoptedAt)} · Archived ${dateLabel(entry.archivedAt)}`;
  const stats=document.createElement('p');stats.className='journal-stats';stats.textContent=`Fed ${entry.stats.feed} · Played ${entry.stats.play} · Cleaned ${entry.stats.clean} · Rested ${entry.stats.rest}`;
  const restore=document.createElement('button');restore.type='button';restore.className='journal-restore';restore.dataset.restore=entry.id;restore.textContent='Bring Back';
  restore.onclick=()=>showReplaceDialog(`Bring back ${entry.name}?`,`${state.name} will rest safely in your Monster Journal while you play with ${entry.name}.`,()=>{
   const result=restoreFromJournal(applyElapsed(state),entry.id,journal);
   if(!result.ok){
    if(result.journal)journal=result.journal;
    setStatus('#journal-status',result.reason==='journal-invalid'?'The Journal needs repair before switching monsters.':'Could not switch monsters. Your current friend is still here.');
    return;
   }
   journal=result.journal;state=result.active;showHome();setStatus('#message',`Welcome back, ${state.name}!`);
  });
  details.append(title,species,dates,stats,restore);card.append(portrait,details);gallery.append(card);
 }
}
function showJournal(){
 clearTimeout(reactionTimer);reactionActive=false;animator?.stop();
 $('#home').hidden=true;$('#adopt').hidden=true;$('#journal').hidden=false;
 renderJournal();
}
function react(action){
 clearTimeout(reactionTimer);reactionActive=true;
 const pet=$('#pet'),effect=$('#effect');pet.className=`pet doing-${action}`;effect.className=`effect effect-${action}`;
 effect.innerHTML=action==='feed'?'<span class="snack"></span>':action==='play'?'<span class="toy"></span>':action==='clean'?'<i></i><i></i><i></i><i></i>':'<span class="sleep-mark">z z z</span>';
 animator.play(action==='rest'?'sleep':action);update();
 reactionTimer=setTimeout(()=>{pet.className='pet';effect.className='effect';effect.innerHTML='';reactionActive=false;animator.play(restingPose());update();},action==='rest'?2200:1200);
}
function downloadJson(name,value){
 const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function showReplaceDialog(title,message,confirm){
 $('#replace-title').textContent=title;$('#replace-message').textContent=message;replaceAction=confirm;
 const dialog=$('#replace-dialog');
 if(dialog.showModal)dialog.showModal();else if(window.confirm(message)){replaceAction=null;confirm();}
}
function installReplacement(next){
 const result=archiveAndAdopt(state,next,journal);
 if(!result.ok){
  if(result.journal)journal=result.journal;
  const message=result.reason==='journal-invalid'?'The Journal needs repair before adopting another monster.':'Could not save both monsters. Your current friend is still here.';
  setStatus($('#adopt').hidden?'#parent-status':'#adopt-status',message);
  return false;
 }
 journal=result.journal;state=result.active;pendingAdoption=false;showHome();return true;
}

document.querySelectorAll('.monster-choice').forEach(button=>button.onclick=()=>selectMonster(button.dataset.species));
$('#adopt-form').onsubmit=event=>{
 event.preventDefault();
 try{
  const next=newMonster(selected,$('#monster-name').value);
  if(pendingAdoption){if(!installReplacement(next))return;}
  else{if(!writeSave(next)){setStatus('#adopt-status','This browser could not save your new friend. Please try again.');return;}state=next;showHome();}
  $('#monster-name').value='';
 }catch{$('#monster-name').setCustomValidity('Please choose a name.');$('#monster-name').reportValidity();}
};
$('#monster-name').oninput=()=>$('#monster-name').setCustomValidity('');
$('#adopt-back').onclick=()=>{pendingAdoption=false;showJournal();};
document.querySelectorAll('[data-action]').forEach(button=>button.onclick=()=>{
 const action=button.dataset.action,candidate=act(state,action);
 if(!writeSave(candidate)){setStatus('#parent-status','This browser could not save changes. Export a backup of your pet.');return;}
 state=candidate;setStatus('#message',actionMessages[action]);react(action);
});
$('#journal-open').onclick=showJournal;
$('#journal-back').onclick=showHome;
$('#adopt-another').onclick=()=>{
 if(!journal){setStatus('#journal-status','The Journal could not be read. No entries were changed.');return;}
 showReplaceDialog('Adopt another monster?',`${state.name} will join your Monster Journal when you choose a new friend.`,()=>{pendingAdoption=true;selected='emberhorn';showAdoption();});
};
$('#replace-cancel').onclick=()=>{replaceAction=null;$('#replace-dialog').close();};
$('#replace-confirm').onclick=()=>{const action=replaceAction;replaceAction=null;$('#replace-dialog').close();action?.();};
$('#rename').onclick=()=>{
 try{
  const candidate=renameMonster(applyElapsed(state),$('#rename-input').value);
  if(!writeSave(candidate)){setStatus('#parent-status','Could not save the new name.');return;}
  state=candidate;update();setStatus('#parent-status','Name saved.');
 }catch{setStatus('#parent-status','Choose a name with 20 letters or fewer.');}
};
$('#export').onclick=()=>{downloadJson(`little-monster-${state.species}.json`,JSON.parse(exportSave(state)));setStatus('#parent-status','Pet backup downloaded.');};
$('#export-journal').onclick=()=>{if(!journal){setStatus('#parent-status','The Journal could not be read.');return;}downloadJson('little-monsters-journal.json',journal);setStatus('#parent-status','Journal backup downloaded.');};
$('#import').onchange=async event=>{
 const file=event.target.files?.[0];if(!file)return;
 try{
  if(file.size>100_000)throw new Error('too large');
  const imported=importSave(await file.text());
  if(imported.id===state.id){if(!writeSave(imported))throw new Error('storage');state=imported;showHome();setStatus('#parent-status','Pet backup restored.');}
  else if(!journal)setStatus('#parent-status','The Journal could not be read. Import was cancelled.');
  else showReplaceDialog('Import this pet?',`${state.name} will move into your Journal before the imported pet becomes active.`,()=>{if(installReplacement(imported))setStatus('#parent-status','Pet imported.');});
 }catch{setStatus('#parent-status','That file is not a valid Little Monsters save, or storage is unavailable.');}
 finally{event.target.value='';}
};
function tickElapsed(){if(!state)return;state=applyElapsed(state);if(!writeSave(state))setStatus('#parent-status','This browser could not save changes. Export a backup.');update();}
setInterval(()=>{if(!document.hidden)tickElapsed();},60_000);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){animator?.stop();return;}
 tickElapsed();
 if(state&&!$('#home').hidden&&!reactionActive)animator?.play(restingPose());
});
if(state)showHome();else showAdoption();
