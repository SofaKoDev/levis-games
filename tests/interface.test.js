// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
it('handles fast taps, undo, empty, and synchronized selection',async()=>{
  document.body.innerHTML='<div id="app"></div>';
  vi.stubGlobal('matchMedia',()=>({matches:true}));
  await import('../src/main.js');
  const $=s=>document.querySelector(s);
  expect(document.querySelector('h1').textContent).toContain("Levi's");
  expect(document.querySelector('.home-link').getAttribute('href')).toBe('/');
  document.querySelector('[aria-label="Cyan"]').click();
  expect($('#selected-name').textContent).toBe('Cyan');expect(Number($('#rainbow').value)).toBe(180);
  expect($('#count').textContent).toBe('1 drop');
  document.querySelector('[aria-label="Yellow"]').click();
  const before=$('#hex').textContent;
  expect($('#mix-list').textContent).toContain('Cyan×1');
  expect($('#mix-list').textContent).toContain('Yellow×1');
  document.querySelector('[aria-label="Blue"]').click();for(let i=0;i<9;i++)$('#add').click();
  expect($('#count').textContent).toBe('12 drops');expect($('#hex').textContent).not.toBe(before);
  expect($('#mix-list').textContent).toContain('Blue×10');
  for(let i=0;i<10;i++)$('#undo').click();expect($('#hex').textContent).toBe(before);
  $('#empty').click();expect($('#count').textContent).toBe('0 drops');expect($('#undo').disabled).toBe(true);expect($('#mix-list').hidden).toBe(true);
  $('#rainbow').value='30';$('#rainbow').dispatchEvent(new Event('input'));expect($('#selected-name').textContent).not.toBe('Blue');
  const selectedHue=$('#rainbow').value;$('#rainbow').value='229';window.dispatchEvent(new Event('pageshow'));expect($('#rainbow').value).toBe(selectedHue);
});

it('announces the mixed color after 5 seconds of waiting and resets on new drops or empty',async()=>{
  vi.useFakeTimers();
  vi.resetModules();
  document.body.innerHTML='<div id="app"></div>';
  const players=[];
  class MockAudio{
    constructor(){
      this.src='';this.currentTime=0;
      this.load=vi.fn();this.play=vi.fn(()=>Promise.resolve());this.pause=vi.fn();
      players.push(this);
    }
  }
  vi.stubGlobal('matchMedia',()=>({matches:true}));
  vi.stubGlobal('Audio',MockAudio);

  await import('../src/main.js');
  const $=s=>document.querySelector(s);

  $('[aria-label="Red"]').click();
  expect(players).toHaveLength(1);
  vi.advanceTimersByTime(4999);
  expect(players[0].play).not.toHaveBeenCalled();

  // Adding another color before 5s resets the timer
  $('[aria-label="Yellow"]').click();
  const mixedName=$('#result').textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  vi.advanceTimersByTime(4999);
  expect(players[0].play).not.toHaveBeenCalled();

  vi.advanceTimersByTime(1);
  expect(players[0].play).toHaveBeenCalledTimes(1);
  expect(players[0].src).toContain(`${mixedName}.mp3`);

  // Emptying the bowl cancels any pending announcement
  players[0].play.mockClear();
  $('[aria-label="Blue"]').click();
  vi.advanceTimersByTime(2000);
  $('#empty').click();
  vi.advanceTimersByTime(5000);
  expect(players[0].play).not.toHaveBeenCalled();

  vi.useRealTimers();
  vi.unstubAllGlobals();
});
