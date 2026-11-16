// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
const calls=vi.hoisted(()=>({play:vi.fn(),preload:vi.fn(),stop:vi.fn()}));
vi.mock('../src/games/sound-lab/audio.js',()=>({createLessonAudio:()=>calls}));
vi.mock('../src/games/sound-lab/library.js',async original=>{const actual=await original();return {...actual,inventory:{...actual.inventory,words:['green','am','sun'].map(id=>({...actual.inventory.words.find(w=>w.id===id),audioReviewed:true,illustrationReviewed:true}))}};});
it('opens with SUN, then moves through shuffled two- and four-phoneme words and replays Back',async()=>{
 vi.resetModules();vi.spyOn(Math,'random').mockReturnValue(.99);document.body.innerHTML='<div id="app"></div>';await import('../src/games/sound-lab/main.js');const $=s=>document.querySelector(s);
 expect($('.letters').getAttribute('aria-label')).toBe('sun');$('#start').click();for(let i=0;i<6;i++)$('#next').click();expect($('#reveal').hidden).toBe(false);$('#next').click();
 expect($('.letters').getAttribute('aria-label')).toBe('am');expect(document.querySelectorAll('[data-letter]')).toHaveLength(2);for(let i=0;i<4;i++)$('#next').click();expect($('#reveal').hidden).toBe(false);
 $('#next').click();expect($('.letters').getAttribute('aria-label')).toBe('green');expect($('#reveal').hidden).toBe(true);expect($('#back').disabled).toBe(true);expect([...document.querySelectorAll('[data-letter]')].map(el=>el.textContent)).toEqual(['g','r','ee','n']);
 for(let i=0;i<5;i++)$('#next').click();expect(calls.play.mock.calls.at(-1)[0].focus).toEqual([0,1]);$('#next').click();$('#back').click();expect(calls.play.mock.calls.at(-1)[0].id).toBe('partial-2');expect(document.querySelectorAll('[data-letter].active')).toHaveLength(2);
 for(let i=0;i<3;i++)$('#next').click();expect($('#reveal').hidden).toBe(false);$('#next').click();expect($('.letters').getAttribute('aria-label')).not.toBe('green');vi.restoreAllMocks();
});
