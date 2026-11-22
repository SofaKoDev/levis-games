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
  const speakMock=vi.fn();
  const cancelMock=vi.fn();
  class MockUtterance{constructor(text){this.text=text;}}
  vi.stubGlobal('matchMedia',()=>({matches:true}));
  vi.stubGlobal('speechSynthesis',{speak:speakMock,cancel:cancelMock,getVoices:()=>[]});
  vi.stubGlobal('SpeechSynthesisUtterance',MockUtterance);

  await import('../src/main.js');
  const $=s=>document.querySelector(s);

  $('[aria-label="Red"]').click();
  vi.advanceTimersByTime(4999);
  expect(speakMock).not.toHaveBeenCalled();

  // Adding another color before 5s resets the timer
  $('[aria-label="Yellow"]').click();
  const mixedName=$('#result').textContent;
  vi.advanceTimersByTime(4999);
  expect(speakMock).not.toHaveBeenCalled();

  vi.advanceTimersByTime(1);
  expect(speakMock).toHaveBeenCalledTimes(1);
  expect(speakMock.mock.calls[0][0].text).toBe(`You made the color ${mixedName}`);

  // Emptying the bowl cancels any pending announcement
  speakMock.mockClear();
  $('[aria-label="Blue"]').click();
  vi.advanceTimersByTime(2000);
  $('#empty').click();
  vi.advanceTimersByTime(5000);
  expect(speakMock).not.toHaveBeenCalled();

  vi.useRealTimers();
  vi.unstubAllGlobals();
});
