import inventory from './words.json';
import {sunLesson} from './lesson.js';
export {inventory};
export const REVIEW_KEY='levis-sound-library-review-v1';
export function buildLesson(word){
 if(word.id==='sun')return sunLesson;
 if(word.engineStatus!=='supported')throw new Error(`Review required: ${word.id}`);
 const n=word.units.length,all=word.units.map((_,i)=>i),base=`library/${word.id}`;
 const stages=[{id:'intro',title:'A little word adventure',prompt:`Listen to the ${n} sounds.`,audio:`${base}-intro.wav`,animation:'apart',focus:[]}];
 word.units.forEach((unit,i)=>{
  const demonstration=inventory.wordDemonstrations?.[word.id]?.[i]||inventory.isolatedDemonstrations?.[unit.phoneme];
  stages.push({id:`sound-${i}`,title:i===0?'The first sound':i===n-1?'The last sound':'The next sound',prompt:unit.text==='x'?`X makes /${unit.ipa}/. Listen, then try it.`:'Listen, then try the sound.',audio:demonstration?.approved?demonstration.audio:`library/phoneme-${unit.phoneme}.wav`,animation:'apart',focus:[i]});
 });
 for(let count=2;count<=n;count++)stages.push({id:count===n?'blend':`partial-${count}`,title:count===n?'Now all the sounds':'Let’s slide sounds together',prompt:'Listen as the sounds slide together.',audio:`${base}-blend-${count}.wav`,animation:count===n?'together':'partial',focus:all.slice(0,count),joined:count});
 stages.push({id:'word',title:'You made a word!',prompt:'Listen to the whole word.',audio:`${base}-word.wav`,animation:'word',focus:[],complete:true});
 return {id:word.id,word:word.word,letters:word.units.map(u=>u.text),illustration:word.id,stages};
}
export function createShuffleBag(items,random=Math.random,firstId=null){
 let bag=[],last,opening=true;
 return {next(){
  if(!items.length)return null;
  if(!bag.length){
   bag=[...items];
   for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
   // The familiar SUN lesson opens the first bag; the remainder stays shuffled.
   const firstIndex=opening?bag.findIndex(item=>item.id===firstId):-1;
   if(firstIndex>=0)[bag[firstIndex],bag[bag.length-1]]=[bag.at(-1),bag[firstIndex]];
   if(bag.length>1&&bag.at(-1).id===last)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];
   opening=false;
  }
  const item=bag.pop();last=item.id;return item;
 }};
}
export function readReviews(storage=globalThis.localStorage){try{return JSON.parse(storage.getItem(REVIEW_KEY)||'{}');}catch{return {};}}
export function reviewFingerprint(word,manifest){return JSON.stringify([word,buildLesson(word).stages.map(s=>[s.audio,manifest.files?.[s.audio]?.sha256]),manifest.art?.[word.id]]);}
export function wordReady(word,{resolve,art,manifest,reviews={}}){
 if(!word.enabled||word.engineStatus!=='supported'||!art[word.id])return false;
 if(!buildLesson(word).stages.every(s=>resolve(s.audio)))return false;
 return (word.audioReviewed&&word.illustrationReviewed)||reviews[word.id]===reviewFingerprint(word,manifest);
}
// Unit widths keep digraphs together. SUN retains its approved positions.
export function letterPositions(letters,stage,measuredWidths){
 if(letters.join('')==='sun')return stage.animation==='apart'?[-88,0,88]:stage.animation==='partial'?[-66,-10,80]:[-57,0,59];
 const joined=stage.animation==='apart'?0:stage.animation==='partial'?stage.joined:letters.length;
 const widths=measuredWidths||letters.map(s=>s.length===2?74:48),gaps=letters.slice(1).map((_,i)=>i+1<joined?8:24);
 let cursor=-(widths.reduce((a,b)=>a+b,0)+gaps.reduce((a,b)=>a+b,0))/2;
 return widths.map((width,i)=>{const center=cursor+width/2;cursor+=width+(gaps[i]||0);return center;});
}
export function displayedLetterWidths(container,letters){
 if(globalThis.navigator?.userAgent?.includes('jsdom'))return letters.map(s=>s.length===2?74:48);
 const style=getComputedStyle(container),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)return letters.map(s=>s.length===2?74:48);
 ctx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
 return letters.map(s=>Math.ceil(ctx.measureText(s).width)+6);
}
