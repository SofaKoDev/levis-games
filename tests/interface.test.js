// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
it('handles fast taps, undo, empty, and synchronized selection',async()=>{
  document.body.innerHTML='<div id="app"></div>';
  vi.stubGlobal('matchMedia',()=>({matches:true}));
  await import('../src/main.js');
  const $=s=>document.querySelector(s);
  expect(document.querySelector('h1').textContent).toContain("Levi's");
  document.querySelector('[aria-label="Cyan"]').click();$('#add').click();
  expect($('#selected-name').textContent).toBe('Cyan');expect(Number($('#rainbow').value)).toBe(180);
  document.querySelector('[aria-label="Yellow"]').click();$('#add').click();
  const before=$('#hex').textContent;
  document.querySelector('[aria-label="Blue"]').click();for(let i=0;i<10;i++)$('#add').click();
  expect($('#count').textContent).toBe('12 drops');expect($('#hex').textContent).not.toBe(before);
  for(let i=0;i<10;i++)$('#undo').click();expect($('#hex').textContent).toBe(before);
  $('#empty').click();expect($('#count').textContent).toBe('0 drops');expect($('#undo').disabled).toBe(true);
  $('#rainbow').value='30';$('#rainbow').dispatchEvent(new Event('input'));expect($('#selected-name').textContent).not.toBe('Blue');
});
