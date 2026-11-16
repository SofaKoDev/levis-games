import {it,expect} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {inventory,buildLesson,createShuffleBag,wordReady,reviewFingerprint,letterPositions} from '../src/games/sound-lab/library.js';
import {createLesson} from '../src/games/sound-lab/lesson.js';
const word=id=>inventory.words.find(w=>w.id===id);
function pcm(file){const bytes=readFileSync(`sound-lab/audio/${file}`);for(let offset=12;offset<bytes.length;){const size=bytes.readUInt32LE(offset+4);if(bytes.toString('ascii',offset,offset+4)==='data')return bytes.subarray(offset+8,offset+8+size);offset+=8+size+(size%2);}throw Error('Missing WAV data');}
it('covers the requested vocabulary in one editable inventory',()=>{expect(inventory.words).toHaveLength(40);expect(new Set(inventory.words.map(w=>w.id)).size).toBe(40);for(const w of inventory.words.filter(w=>w.engineStatus==='supported'))expect(w.units.map(u=>u.text).join('')).toBe(w.word);});
it.each([['am',2,5],['sun',3,7],['stop',4,9],['green',4,9],['see',2,5],['eggs',3,7]])('builds %s from %i phonemes with %i stages',(id,n,stages)=>{const lesson=buildLesson(word(id));expect(lesson.letters).toHaveLength(n);expect(lesson.stages).toHaveLength(stages);expect(lesson.stages.at(-1).complete).toBe(true);const c=createLesson(lesson);c.start();for(let i=1;i<stages;i++)c.next();c.back();expect(c.stage.id).toBe('blend');expect(c.stage.focus).toHaveLength(n);});
it('keeps ee together and the gr/st consonants separate, with correct voiced final s in eggs',()=>{expect(buildLesson(word('see')).letters).toEqual(['s','ee']);expect(buildLesson(word('green')).letters).toEqual(['g','r','ee','n']);expect(word('eggs').units.at(-1).ipa).toBe('z');expect(buildLesson(word('stop')).stages.find(s=>s.id==='partial-2').focus).toEqual([0,1]);});
it('teaches X as one combined /ks/ unit in BOX and FOX',()=>{for(const id of ['box','fox']){const lesson=buildLesson(word(id));expect(lesson.letters).toEqual([id[0],'o','x']);expect(lesson.stages).toHaveLength(7);expect(lesson.stages.find(s=>s.id==='sound-2').audio).toBe('library/phoneme-ks.wav');expect(lesson.stages.find(s=>s.id==='sound-2').prompt).toContain('/ks/');}});
it('shuffles every word once per bag without repeats at bag boundaries',()=>{const items=inventory.words.slice(0,8);const bag=createShuffleBag(items,()=>.37);let previous;for(let cycle=0;cycle<30;cycle++){const drawn=Array.from({length:items.length},()=>bag.next().id);expect(drawn[0]).not.toBe(previous);expect(new Set(drawn).size).toBe(items.length);previous=drawn.at(-1);}expect(createShuffleBag([]).next()).toBeNull();expect(createShuffleBag([items[0]]).next()).toBe(items[0]);});
it('opens with SUN, then draws all remaining words before repeating',()=>{const items=inventory.words.slice(0,8);for(const random of [()=>0,()=>.99]){const bag=createShuffleBag(items,random,'sun');expect(bag.next().id).toBe('sun');const rest=Array.from({length:7},()=>bag.next().id);expect(rest).not.toContain('sun');expect(new Set(rest).size).toBe(7);expect(bag.next().id).not.toBe(rest.at(-1));}});
it('uses the approved puh only for standalone P, keeping every blend and introduction separate',()=>{
 for(const w of inventory.words.filter(w=>w.engineStatus==='supported'&&w.units.some(u=>u.phoneme==='p'))){
  const lesson=buildLesson(w);
  for(const [i,unit] of w.units.entries())if(unit.phoneme==='p')expect(lesson.stages.find(s=>s.id===`sound-${i}`).audio).toBe('library/phoneme-p-demo.wav');
  expect(lesson.stages.filter(s=>!s.id.startsWith('sound-')).every(s=>!s.audio.includes('p-demo'))).toBe(true);
  expect(pcm(`library/${w.id}-intro.wav`).equals(Buffer.concat(w.units.map(u=>pcm(['pin','fin','sit'].includes(w.id)&&u.phoneme==='i'?'library/pig-short-i-demo.wav':`library/phoneme-${u.phoneme}.wav`))))).toBe(true);
 }
 expect(createHash('sha256').update(readFileSync('sound-lab/audio/library/phoneme-p-demo.wav')).digest('hex')).toBe('618279318af4fdba06e3ff33e77b832643ff856ea18f02196e797953ac9bf46b');
 expect(buildLesson(word('map')).stages.slice(-3).map(s=>s.audio)).toEqual(['library/map-blend-2.wav','library/map-blend-3.wav','library/map-word.wav']);
});
it('uses the approved fresh M/N unchanged and includes them in separated introductions',()=>{
 for(const phone of ['m','n']){const file=`library/phoneme-${phone}.wav`,manifest=JSON.parse(readFileSync('sound-lab/library-manifest.json','utf8'));expect(createHash('sha256').update(readFileSync(`sound-lab/audio/${file}`)).digest('hex')).toBe(manifest.files[file].sha256);}
 expect(readFileSync('sound-lab/audio/04-n.wav').equals(readFileSync('sound-lab/audio/library/phoneme-n.wav'))).toBe(true);
 expect(pcm('01-intro.wav').equals(Buffer.concat(['02-s.wav','03-u.wav','04-n.wav'].map(pcm)))).toBe(true);
 for(const w of inventory.words.filter(w=>w.id!=='sun'&&w.engineStatus==='supported'&&w.units.some(u=>['m','n'].includes(u.phoneme))))expect(pcm(`library/${w.id}-intro.wav`).equals(Buffer.concat(w.units.map(u=>pcm(['pin','fin','sit'].includes(w.id)&&u.phoneme==='i'?'library/pig-short-i-demo.wav':`library/phoneme-${u.phoneme}.wav`))))).toBe(true);
});
it('uses approved guh only for standalone G and preserves pure G in separated introductions',()=>{
 for(const w of inventory.words.filter(w=>w.engineStatus==='supported'&&w.units.some(u=>u.phoneme==='g'))){const lesson=buildLesson(w);for(const [i,u] of w.units.entries())if(u.phoneme==='g')expect(lesson.stages.find(s=>s.id===`sound-${i}`).audio).toBe('library/phoneme-g-demo.wav');expect(lesson.stages.filter(s=>!s.id.startsWith('sound-')).every(s=>!s.audio.includes('g-demo'))).toBe(true);expect(pcm(`library/${w.id}-intro.wav`).equals(Buffer.concat(w.units.map(u=>pcm(`library/phoneme-${u.phoneme}.wav`))))).toBe(true);}
 expect(createHash('sha256').update(readFileSync('sound-lab/audio/library/phoneme-g-demo.wav')).digest('hex')).toBe('608a3cf9e37dab99985aeabd7c593f2500d2818d5375b031fad5f0ea1e05164c');
});
it('uses approved buh only for standalone B and preserves connected B recordings',()=>{
 for(const w of inventory.words.filter(w=>w.engineStatus==='supported'&&w.units.some(u=>u.phoneme==='b'))){const lesson=buildLesson(w);for(const [i,u] of w.units.entries())if(u.phoneme==='b')expect(lesson.stages.find(s=>s.id===`sound-${i}`).audio).toBe('library/phoneme-b-demo.wav');expect(lesson.stages.filter(s=>!s.id.startsWith('sound-')).every(s=>!s.audio.includes('b-demo'))).toBe(true);expect(pcm(`library/${w.id}-intro.wav`).equals(Buffer.concat(w.units.map(u=>pcm(`library/phoneme-${u.phoneme}.wav`))))).toBe(true);}
 expect(createHash('sha256').update(readFileSync('sound-lab/audio/library/phoneme-b-demo.wav')).digest('hex')).toBe(JSON.parse(readFileSync('sound-lab/library-manifest.json','utf8')).files['library/phoneme-b-demo.wav'].sha256);
});
it('uses one connected short-I prefix for PIG without altering its full blend or whole word',()=>{
 const partial=pcm('library/pig-blend-2.wav'),full=pcm('library/pig-blend-3.wav');const rate=24000,cut=Math.round(.405*rate),fade=Math.round(.008*rate);
 expect(partial.subarray(0,(cut-fade)*2).equals(full.subarray(0,(cut-fade)*2))).toBe(true);
 expect(partial.subarray(cut*2).every(byte=>byte===0)).toBe(true);
 for(const [file,hash] of [['pig-blend-3.wav','c5881f81d8b00978f5edd2657f703983c24e21cfe8a7920b7c471b631fb2e936'],['pig-word.wav','30daf78c907ef06b6e3fde0b76bb7bf18521c06441d4877ddbe8816174b0bc6b']])expect(createHash('sha256').update(readFileSync(`sound-lab/audio/library/${file}`)).digest('hex')).toBe(hash);
});
it('uses the approved short I only for PIG standalone I',()=>{
 const pig=buildLesson(word('pig'));expect(pig.stages.find(s=>s.id==='sound-1').audio).toBe('library/pig-short-i-demo.wav');
 expect(pig.stages.filter(s=>s.id!=='sound-1').every(s=>s.audio!=='library/pig-short-i-demo.wav')).toBe(true);
 expect(buildLesson(word('pin')).stages.find(s=>s.id==='sound-1').audio).toBe('library/pig-short-i-demo.wav');
 expect(createHash('sha256').update(readFileSync('sound-lab/audio/library/pig-short-i-demo.wav')).digest('hex')).toBe('992e71fdee6c30d9ea9b3834d21c29c0cc018fa13c4ec9f5a5749b75fa03a240');
});
it('rejects missing assets, unreviewed words, and stale approvals',()=>{const w={...word('map'),audioReviewed:false,illustrationReviewed:false},art={map:'svg'},manifest={files:{},art:{map:'hash'}};const context={resolve:()=>'/local.wav',art,manifest,reviews:{}};expect(wordReady(w,context)).toBe(false);context.reviews.map=reviewFingerprint(w,manifest);expect(wordReady(w,context)).toBe(true);expect(wordReady(w,{...context,resolve:()=>undefined})).toBe(false);expect(wordReady(w,{...context,art:{}})).toBe(false);expect(wordReady(w,{...context,manifest:{...manifest,art:{map:'changed'}}})).toBe(false);});
it('integrates all 40 owner-approved word sets and preserves original SUN assets',()=>{expect(inventory.words.filter(w=>w.audioReviewed&&w.illustrationReviewed)).toHaveLength(40);for(const stage of buildLesson(word('sun')).stages)expect(existsSync(`sound-lab/audio/${stage.audio}`)).toBe(true);});
it('keeps original illustrations as SVGs without emoji or external references',()=>{for(const w of inventory.words.filter(w=>w.id!=='sun')){const svg=readFileSync(`sound-lab/illustrations/${w.illustration}`,'utf8');expect(svg).toContain('<svg');expect(svg).not.toMatch(/<image|<script|https?:\/\/(?!www.w3.org)/);}});
it('joins only the active phoneme prefix in longer words',()=>{const letters=['s','t','o','p'];const apart=letterPositions(letters,{animation:'apart'});const partial=letterPositions(letters,{animation:'partial',joined:2});expect(partial[1]-partial[0]).toBeLessThan(apart[1]-apart[0]);expect(partial[2]-partial[1]).toBe(apart[2]-apart[1]);expect(letterPositions(['s','u','n'],{animation:'apart'})).toEqual([-88,0,88]);});
it('keeps every non-SUN word readable at every stage using displayed glyph widths',()=>{for(const w of inventory.words.filter(w=>w.id!=='sun')){const lesson=buildLesson(w),widths=lesson.letters.map(unit=>unit.length===2?82:unit==='m'||unit==='w'?90:60);for(const stage of lesson.stages){const positions=letterPositions(lesson.letters,stage,widths);for(let i=1;i<positions.length;i++)expect(positions[i]-positions[i-1]).toBeGreaterThanOrEqual((widths[i]+widths[i-1])/2+7);}}});
it('has complete, hash-verified audio for every approved word',()=>{const manifest=JSON.parse(readFileSync('sound-lab/library-manifest.json','utf8'));for(const w of inventory.words.filter(w=>w.engineStatus==='supported')){for(const stage of buildLesson(w).stages){const bytes=readFileSync(`sound-lab/audio/${stage.audio}`);expect(createHash('sha256').update(bytes).digest('hex')).toBe(manifest.files[stage.audio].sha256);expect(manifest.files[stage.audio].peak).toBeGreaterThan(0);expect(manifest.files[stage.audio].peak).toBeLessThan(1);}if(w.id!=='sun')expect(createHash('sha256').update(readFileSync(`sound-lab/illustrations/${w.illustration}`)).digest('hex')).toBe(manifest.art[w.id]);}});
