// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
const calls=vi.hoisted(()=>({play:vi.fn(),preload:vi.fn(),stop:vi.fn()}));
vi.mock('../src/games/sound-lab/audio.js',()=>({createLessonAudio:()=>calls}));
vi.mock('../src/games/sound-lab/library.js',async original=>{const actual=await original();return {...actual,inventory:{...actual.inventory,words:actual.inventory.words.map(w=>w.id==='sun'?w:{...w,audioReviewed:false,illustrationReviewed:false})}};});
it('uses approved guh for DOG standalone G and leaves connected lessons unchanged',async()=>{
 vi.resetModules();localStorage.clear();history.replaceState(null,'','/sound-lab/library-review.html?word=dog');document.body.innerHTML='<div id="app"></div>';await import('../src/games/sound-lab/review.js');
 expect(document.querySelector('[data-comparison="g"]')).toBeNull();document.querySelector('[data-stage="3"]').click();expect(calls.play.mock.calls.at(-1)[0].audio).toBe('library/phoneme-g-demo.wav');expect([...document.querySelectorAll('[data-letter].active')].map(el=>el.textContent)).toEqual(['g']);
 document.querySelector('[data-stage="5"]').click();expect(calls.play.mock.calls.at(-1)[0].audio).toBe('library/dog-blend-3.wav');expect(document.querySelector('#approve-word').checked).toBe(false);expect(localStorage.length).toBe(0);
 const {inventory,buildLesson}=await import('../src/games/sound-lab/library.js');expect(buildLesson(inventory.words.find(w=>w.id==='dog')).stages[3].audio).toBe('library/phoneme-g-demo.wav');
});
it('updates approval designations immediately, preserves other words, and restores them on reload',async()=>{
 vi.resetModules();localStorage.clear();history.replaceState(null,'','/sound-lab/library-review.html?word=dog');
 const {inventory,reviewFingerprint,REVIEW_KEY}=await import('../src/games/sound-lab/library.js');const manifest=(await import('../sound-lab/library-manifest.json')).default;
 const mapApproval=reviewFingerprint(inventory.words.find(w=>w.id==='map'),manifest);localStorage.setItem(REVIEW_KEY,JSON.stringify({map:mapApproval}));
 document.body.innerHTML='<div id="app"></div>';await import('../src/games/sound-lab/review.js');
 const label=id=>document.querySelector(`#word-select option[value="${id}"]`).textContent;
 expect(label('map')).toBe('map — approved');expect(label('dog')).toContain('needs listening review');
 const catApproval=reviewFingerprint(inventory.words.find(w=>w.id==='cat'),manifest);localStorage.setItem(REVIEW_KEY,JSON.stringify({map:mapApproval,cat:catApproval})); // Another tab saves a word after this page loaded.
 document.querySelector('#approve-word').click();expect(label('dog')).toBe('dog — approved');expect(document.querySelector('#library-status').textContent).toContain('4 words approved');expect(JSON.parse(localStorage.getItem(REVIEW_KEY)).map).toBe(mapApproval);expect(JSON.parse(localStorage.getItem(REVIEW_KEY)).cat).toBe(catApproval);
 vi.resetModules();document.body.innerHTML='<div id="app"></div>';await import('../src/games/sound-lab/review.js');expect(label('dog')).toBe('dog — approved');expect(document.querySelector('#approve-word').checked).toBe(true);
 document.querySelector('#approve-word').click();expect(label('dog')).toContain('needs listening review');expect(label('map')).toBe('map — approved');expect(JSON.parse(localStorage.getItem(REVIEW_KEY)).map).toBe(mapApproval);
 localStorage.clear();
});
