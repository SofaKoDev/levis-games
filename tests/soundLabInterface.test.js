// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
const calls=vi.hoisted(()=>({play:vi.fn(),preload:vi.fn(),stop:vi.fn()}));
vi.mock('../src/games/sound-lab/audio.js',()=>({createLessonAudio:()=>calls}));
vi.mock('../src/games/sound-lab/library.js',async original=>{const actual=await original();return {...actual,inventory:{...actual.inventory,words:actual.inventory.words.filter(w=>w.id==='sun')}};});
it('starts from a user action, navigates and reveals only the final illustration',async()=>{
 vi.resetModules();document.body.innerHTML='<div id="app"></div>';await import('../src/games/sound-lab/main.js');const $=s=>document.querySelector(s);
 expect(calls.play).not.toHaveBeenCalled();expect($('#reveal').hidden).toBe(true);expect($('.audio-notice').hidden).toBe(true);
 $('#start').click();expect(calls.preload).toHaveBeenCalledTimes(1);expect(calls.play.mock.calls.at(-1)[0].id).toBe('intro');expect($('#back').disabled).toBe(true);
 for(let i=0;i<4;i++)$('#next').click();expect($('.letter-stage').dataset.animation).toBe('partial');expect($('#reveal').hidden).toBe(true);
 $('#back').click();expect(calls.play.mock.calls.at(-1)[0].id).toBe('n');expect($('.letter-stage').dataset.animation).toBe('apart');
 for(let i=0;i<3;i++)$('#next').click();expect($('#reveal').hidden).toBe(false);expect($('#next').hidden).toBe(false);expect($('#next').getAttribute('aria-label')).toBe('Next word');expect(calls.play.mock.calls.at(-1)[0].id).toBe('word');
 $('#replay').click();expect(calls.play.mock.calls.at(-1)[0].id).toBe('word');$('#back').click();expect($('#reveal').hidden).toBe(true);
 $('#next').click();$('#restart').click();expect($('.letter-stage').dataset.animation).toBe('apart');expect($('#reveal').hidden).toBe(true);expect(calls.play.mock.calls.at(-1)[0].id).toBe('intro');
 for(let i=0;i<6;i++)$('#next').click();expect($('.letter-stage').dataset.animation).toBe('word');$('#next').click();expect(calls.play.mock.calls.at(-1)[0].id).toBe('intro');expect($('#reveal').hidden).toBe(true);expect($('#back').disabled).toBe(true);expect($('.home-link').getAttribute('href')).toBe('/');
 window.dispatchEvent(new Event('pagehide'));expect(calls.stop).toHaveBeenCalled();
});
